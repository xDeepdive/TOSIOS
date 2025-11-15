import { Constants, Geometry, Maths, Models } from '@tosios/common';
import { Player } from '../entities/Player';
import { Prop } from '../entities/Prop';
import { Monster } from '../entities/Monster';
import { Collisions } from '@tosios/common';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface BotTarget {
    type: 'player' | 'monster' | 'powerup' | 'health';
    x: number;
    y: number;
    distance: number;
    priority: number;
}

export class BotAI {
    private bot: Player;
    private difficulty: BotDifficulty;
    private lastActionTime: number = 0;
    private lastShootTime: number = 0; // Track last shoot time separately
    private reactionTime: number;
    private aimError: number;
    private currentTarget: BotTarget | null = null;
    private lastUpdateTime: number = 0;
    private wanderDirection: { x: number; y: number; angle: number } | null = null;
    private wanderChangeTime: number = 0;

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
        monsters: Map<string, Monster>,
        props: Prop[],
        walls: Collisions.TreeCollider,
    ): Models.ActionJSON | null {
        // Throttle updates (faster now - every 50ms)
        if (currentTime - this.lastUpdateTime < Constants.BOTS_UPDATE_INTERVAL) {
            return null;
        }
        this.lastUpdateTime = currentTime;

        if (!this.bot.isAlive) {
            return null;
        }

        // Evaluate targets
        this.evaluateTargets(players, monsters, props);

        // Decide action based on current state
        const action = this.decideAction(currentTime, players, monsters, walls);

        // Update last action time only if we generated an action
        if (action) {
            this.lastActionTime = currentTime;
        }

        return action;
    }

    /**
     * Evaluate and prioritize targets
     */
    private evaluateTargets(players: Map<string, Player>, monsters: Map<string, Monster>, props: Prop[]) {
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

        // Evaluate monsters (bats) - high priority threats!
        monsters.forEach((monster) => {
            if (!monster.isAlive) {
                return;
            }

            const distance = Maths.getDistance(this.bot.x, this.bot.y, monster.x, monster.y);

            // High priority for nearby monsters
            const priority = 120 - distance / 8; // Higher priority than players!

            targets.push({
                type: 'monster',
                x: monster.x,
                y: monster.y,
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
        monsters: Map<string, Monster>,
        walls: Collisions.TreeCollider,
    ): Models.ActionJSON | null {
        // Find closest threat (player or monster) for shooting
        let closestThreat: BotTarget | null = null;
        let threatDistance = Infinity;

        // Check players
        players.forEach((player) => {
            if (player.playerId === this.bot.playerId || !player.isAlive) {
                return;
            }
            if (this.bot.team && player.team === this.bot.team) {
                return;
            }

            const distance = Maths.getDistance(this.bot.x, this.bot.y, player.x, player.y);
            if (distance < threatDistance) {
                threatDistance = distance;
                closestThreat = {
                    type: 'player',
                    x: player.x,
                    y: player.y,
                    distance,
                    priority: 100,
                };
            }
        });

        // Check monsters - prioritize if they're closer
        monsters.forEach((monster) => {
            if (!monster.isAlive) {
                return;
            }

            const distance = Maths.getDistance(this.bot.x, this.bot.y, monster.x, monster.y);
            if (distance < threatDistance) {
                threatDistance = distance;
                closestThreat = {
                    type: 'monster',
                    x: monster.x,
                    y: monster.y,
                    distance,
                    priority: 120, // Higher priority!
                };
            }
        });

        // Shoot at threats occasionally (not every frame, so bot can also move)
        const shootInterval = Constants.BULLET_RATE; // Same as bullet rate
        if (
            closestThreat &&
            threatDistance < Constants.BOTS_SHOOT_DISTANCE &&
            currentTime - this.lastShootTime > shootInterval
        ) {
            this.lastShootTime = currentTime;
            return this.getShootAction(closestThreat, currentTime);
        }

        // ALWAYS move (primary action)
        // Priority: Move towards threat > Move towards target > Wander
        if (closestThreat) {
            // Move towards closest threat (player or monster)
            return this.getMoveTowardTargetAction(closestThreat, walls, currentTime);
        } else if (this.currentTarget) {
            // Move towards target (powerup/health)
            return this.getMoveTowardTargetAction(this.currentTarget, walls, currentTime);
        } else {
            // Wander randomly
            return this.getWanderAction(walls, currentTime);
        }
    }

    /**
     * Get a shoot action (simplified - just shoot, don't wait for perfect rotation)
     */
    private getShootAction(target: BotTarget, currentTime: number): Models.ActionJSON | null {
        const angle = Math.atan2(target.y - this.bot.y, target.x - this.bot.x);

        // Add aim error based on difficulty
        const aimWithError = angle + (Math.random() - 0.5) * this.aimError;

        // Just shoot directly - no rotation check
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
        currentTime?: number,
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
            ts: currentTime || Date.now(),
            playerId: this.bot.playerId,
        };
    }

    /**
     * Wander randomly - changes direction frequently for unpredictable movement
     */
    private getWanderAction(walls: Collisions.TreeCollider, currentTime: number): Models.ActionJSON | null {
        // Change direction more frequently for varied movement (300-600ms)
        const wanderDuration = 300 + Math.random() * 300;

        if (!this.wanderDirection || currentTime - this.wanderChangeTime > wanderDuration) {
            // Pick a new random direction
            const angle = Math.random() * Math.PI * 2;
            this.wanderDirection = {
                x: Math.cos(angle),
                y: Math.sin(angle),
                angle,
            };
            this.wanderChangeTime = currentTime;
        }

        // Add slight random variation to direction each frame for more natural movement
        const dirVariation = (Math.random() - 0.5) * 0.2; // Small angle variation
        const variedAngle = this.wanderDirection.angle + dirVariation;

        return {
            type: 'move',
            value: {
                x: Math.cos(variedAngle),
                y: Math.sin(variedAngle),
                rotation: variedAngle,
            },
            ts: currentTime,
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
