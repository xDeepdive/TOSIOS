import { Constants, Geometry, Maths, Models } from '@tosios/common';
import { Player } from '../entities/Player';
import { Prop } from '../entities/Prop';
import { Collisions } from '@tosios/common';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface BotTarget {
    type: 'player' | 'powerup' | 'health';
    x: number;
    y: number;
    distance: number;
    priority: number;
}

export class BotAI {
    private bot: Player;
    private difficulty: BotDifficulty;
    private lastActionTime: number = 0;
    private reactionTime: number;
    private aimError: number;
    private currentTarget: BotTarget | null = null;
    private lastUpdateTime: number = 0;

    constructor(bot: Player, difficulty: BotDifficulty = 'medium') {
        this.bot = bot;
        this.difficulty = difficulty;

        // Set difficulty parameters
        switch (difficulty) {
            case 'easy':
                this.reactionTime = Constants.BOTS_EASY_REACTION_TIME;
                this.aimError = Constants.BOTS_EASY_AIM_ERROR;
                break;
            case 'hard':
                this.reactionTime = Constants.BOTS_HARD_REACTION_TIME;
                this.aimError = Constants.BOTS_HARD_AIM_ERROR;
                break;
            case 'medium':
            default:
                this.reactionTime = Constants.BOTS_MEDIUM_REACTION_TIME;
                this.aimError = Constants.BOTS_MEDIUM_AIM_ERROR;
                break;
        }
    }

    /**
     * Main update loop for bot AI
     */
    update(
        currentTime: number,
        players: Map<string, Player>,
        props: Prop[],
        walls: Collisions.TreeCollider,
    ): Models.ActionJSON | null {
        // Throttle updates
        if (currentTime - this.lastUpdateTime < Constants.BOTS_UPDATE_INTERVAL) {
            return null;
        }
        this.lastUpdateTime = currentTime;

        if (!this.bot.isAlive) {
            return null;
        }

        // Check reaction time
        if (currentTime - this.lastActionTime < this.reactionTime) {
            return null;
        }

        // Evaluate targets
        this.evaluateTargets(players, props);

        // Decide action based on current state
        const action = this.decideAction(currentTime, players, walls);

        if (action) {
            this.lastActionTime = currentTime;
        }

        return action;
    }

    /**
     * Evaluate and prioritize targets
     */
    private evaluateTargets(players: Map<string, Player>, props: Prop[]) {
        const targets: BotTarget[] = [];

        // Evaluate enemy players
        players.forEach((player) => {
            if (player.playerId === this.bot.playerId || !player.isAlive) {
                return;
            }

            // Skip teammates in team modes
            if (this.bot.team && player.team === this.bot.team) {
                return;
            }

            const distance = Maths.getDistance(this.bot.x, this.bot.y, player.x, player.y);

            // Higher priority if bot is healthy, lower if bot is weak
            let priority = 100 - distance / 10;
            if (this.bot.lives <= Constants.BOTS_RETREAT_HEALTH) {
                priority -= 50; // Lower priority for combat when low health
            }

            targets.push({
                type: 'player',
                x: player.x,
                y: player.y,
                distance,
                priority,
            });
        });

        // Evaluate powerups and health
        props.forEach((prop) => {
            if (!prop.active) {
                return;
            }

            const distance = Maths.getDistance(this.bot.x, this.bot.y, prop.x, prop.y);

            if (distance > Constants.BOTS_POWERUP_DETECTION_RANGE) {
                return;
            }

            let priority = 0;
            let type: 'powerup' | 'health' = 'powerup';

            if (prop.type === 'potion-red') {
                type = 'health';
                // High priority if low health
                if (this.bot.lives <= Constants.BOTS_RETREAT_HEALTH) {
                    priority = 200 - distance / 5;
                } else if (!this.bot.isFullLives) {
                    priority = 80 - distance / 5;
                } else {
                    priority = 20 - distance / 5;
                }
            } else {
                // It's a powerup
                priority = 60 - distance / 5;
            }

            targets.push({
                type,
                x: prop.x,
                y: prop.y,
                distance,
                priority,
            });
        });

        // Select highest priority target
        targets.sort((a, b) => b.priority - a.priority);
        this.currentTarget = targets.length > 0 ? targets[0] : null;
    }

    /**
     * Decide what action to take
     */
    private decideAction(
        currentTime: number,
        players: Map<string, Player>,
        walls: Collisions.TreeCollider,
    ): Models.ActionJSON | null {
        if (!this.currentTarget) {
            // No target, wander randomly
            return this.getWanderAction(walls);
        }

        const targetDistance = this.currentTarget.distance;

        // If target is a player and in shooting range
        if (this.currentTarget.type === 'player' && targetDistance < Constants.BOTS_SHOOT_DISTANCE) {
            // Try to maintain distance while shooting
            const action = this.getShootAction(this.currentTarget, currentTime);
            if (action) {
                return action;
            }
        }

        // Move towards target
        return this.getMoveTowardTargetAction(this.currentTarget, walls);
    }

    /**
     * Get a shoot action
     */
    private getShootAction(target: BotTarget, currentTime: number): Models.ActionJSON | null {
        const angle = Math.atan2(target.y - this.bot.y, target.x - this.bot.x);

        // Add aim error based on difficulty
        const aimWithError = angle + (Math.random() - 0.5) * this.aimError;

        // First rotate to face target
        if (Math.abs(this.bot.rotation - aimWithError) > 0.1) {
            return {
                type: 'rotate',
                value: {
                    rotation: aimWithError,
                },
                ts: currentTime,
                playerId: this.bot.playerId,
            };
        }

        // Then shoot
        return {
            type: 'shoot',
            value: {
                angle: aimWithError,
            },
            ts: currentTime,
            playerId: this.bot.playerId,
        };
    }

    /**
     * Move towards a target
     */
    private getMoveTowardTargetAction(
        target: BotTarget,
        walls: Collisions.TreeCollider,
    ): Models.ActionJSON | null {
        const dirX = target.x - this.bot.x;
        const dirY = target.y - this.bot.y;

        // Normalize direction
        const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
        if (magnitude === 0) {
            return null;
        }

        const normalizedX = dirX / magnitude;
        const normalizedY = dirY / magnitude;

        // Calculate rotation
        const rotation = Math.atan2(dirY, dirX);

        return {
            type: 'move',
            value: {
                x: normalizedX,
                y: normalizedY,
                rotation,
            },
            ts: Date.now(),
            playerId: this.bot.playerId,
        };
    }

    /**
     * Wander randomly
     */
    private getWanderAction(walls: Collisions.TreeCollider): Models.ActionJSON | null {
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        return {
            type: 'move',
            value: {
                x: dirX,
                y: dirY,
                rotation: angle,
            },
            ts: Date.now(),
            playerId: this.bot.playerId,
        };
    }

    /**
     * Get bot name based on difficulty
     */
    static getBotName(index: number, difficulty: BotDifficulty): string {
        const prefixes = {
            easy: ['Noob', 'Beginner', 'Rookie', 'Newbie'],
            medium: ['Bot', 'AI', 'Fighter', 'Player'],
            hard: ['Elite', 'Pro', 'Master', 'Terminator'],
        };

        const names = [
            'Alpha',
            'Beta',
            'Gamma',
            'Delta',
            'Epsilon',
            'Zeta',
            'Eta',
            'Theta',
            'Iota',
            'Kappa',
        ];

        const prefix = prefixes[difficulty][index % prefixes[difficulty].length];
        const name = names[index % names.length];

        return `${prefix}_${name}`;
    }
}
