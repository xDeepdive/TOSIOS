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

    // Unstuck mechanism
    private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
    private stuckCounter: number = 0;
    private stuckCheckTime: number = 0;

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

        // Check if bot is stuck (hasn't moved in 1 second)
        if (currentTime - this.stuckCheckTime > 1000) {
            const distanceMoved = Math.sqrt(
                Math.pow(this.bot.x - this.lastPosition.x, 2) + Math.pow(this.bot.y - this.lastPosition.y, 2),
            );

            if (distanceMoved < 5) {
                // Bot barely moved - likely stuck
                this.stuckCounter++;
                // Force new wander direction
                this.wanderDirection = null;
            } else {
                this.stuckCounter = 0;
            }

            this.lastPosition = { x: this.bot.x, y: this.bot.y };
            this.stuckCheckTime = currentTime;
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

        // Check if bot should retreat (low health)
        const shouldRetreat = this.bot.lives <= 1;

        // Shoot at threats occasionally (not every frame, so bot can also move)
        const shootInterval = Constants.BULLET_RATE; // Same as bullet rate
        if (
            closestThreat &&
            threatDistance < Constants.BOTS_SHOOT_DISTANCE &&
            currentTime - this.lastShootTime > shootInterval &&
            !shouldRetreat // Don't shoot when retreating, just run!
        ) {
            this.lastShootTime = currentTime;
            return this.getShootAction(closestThreat, currentTime);
        }

        // ALWAYS move (primary action)
        // Priority: Retreat when low health > Move to health > Move towards threat > Wander
        if (shouldRetreat && closestThreat) {
            // RETREAT - run AWAY from threat
            return this.getRetreatAction(closestThreat, walls, currentTime);
        } else if (closestThreat) {
            // Move towards closest threat (player or monster) when healthy
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
     * Retreat AWAY from a threat (run away when low health)
     */
    private getRetreatAction(
        threat: BotTarget,
        walls: Collisions.TreeCollider,
        currentTime?: number,
    ): Models.ActionJSON | null {
        // Calculate direction AWAY from threat (opposite direction)
        const dirX = this.bot.x - threat.x; // Reversed!
        const dirY = this.bot.y - threat.y; // Reversed!

        // Normalize direction
        const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
        if (magnitude === 0) {
            // If somehow on same position, pick random direction
            return this.getWanderAction(walls, currentTime || Date.now());
        }

        let normalizedX = dirX / magnitude;
        let normalizedY = dirY / magnitude;
        let rotation = Math.atan2(dirY, dirX);

        // Check if this movement would collide with a wall
        const futureX = this.bot.x + normalizedX * Constants.PLAYER_SPEED * 3;
        const futureY = this.bot.y + normalizedY * Constants.PLAYER_SPEED * 3;
        const futureBody = new Geometry.CircleBody(futureX, futureY, this.bot.radius);

        if (walls.collidesWithCircle(futureBody, 'full')) {
            // Try perpendicular directions
            const perpAngle1 = rotation + Math.PI / 2;
            const perpAngle2 = rotation - Math.PI / 2;

            const testX1 = this.bot.x + Math.cos(perpAngle1) * Constants.PLAYER_SPEED * 3;
            const testY1 = this.bot.y + Math.sin(perpAngle1) * Constants.PLAYER_SPEED * 3;
            const testX2 = this.bot.x + Math.cos(perpAngle2) * Constants.PLAYER_SPEED * 3;
            const testY2 = this.bot.y + Math.sin(perpAngle2) * Constants.PLAYER_SPEED * 3;

            const testBody1 = new Geometry.CircleBody(testX1, testY1, this.bot.radius);
            const testBody2 = new Geometry.CircleBody(testX2, testY2, this.bot.radius);

            if (!walls.collidesWithCircle(testBody1, 'full')) {
                normalizedX = Math.cos(perpAngle1);
                normalizedY = Math.sin(perpAngle1);
                rotation = perpAngle1;
            } else if (!walls.collidesWithCircle(testBody2, 'full')) {
                normalizedX = Math.cos(perpAngle2);
                normalizedY = Math.sin(perpAngle2);
                rotation = perpAngle2;
            } else {
                // Cornered - try to wander away
                return this.getWanderAction(walls, currentTime || Date.now());
            }
        }

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

        let normalizedX = dirX / magnitude;
        let normalizedY = dirY / magnitude;
        let rotation = Math.atan2(dirY, dirX);

        // Check if this movement would collide with a wall
        const futureX = this.bot.x + normalizedX * Constants.PLAYER_SPEED * 3;
        const futureY = this.bot.y + normalizedY * Constants.PLAYER_SPEED * 3;
        const futureBody = new Geometry.CircleBody(futureX, futureY, this.bot.radius);

        if (walls.collidesWithCircle(futureBody, 'full')) {
            // Try perpendicular directions to navigate around obstacle
            const perpAngle1 = rotation + Math.PI / 2;
            const perpAngle2 = rotation - Math.PI / 2;

            const testX1 = this.bot.x + Math.cos(perpAngle1) * Constants.PLAYER_SPEED * 3;
            const testY1 = this.bot.y + Math.sin(perpAngle1) * Constants.PLAYER_SPEED * 3;
            const testX2 = this.bot.x + Math.cos(perpAngle2) * Constants.PLAYER_SPEED * 3;
            const testY2 = this.bot.y + Math.sin(perpAngle2) * Constants.PLAYER_SPEED * 3;

            const testBody1 = new Geometry.CircleBody(testX1, testY1, this.bot.radius);
            const testBody2 = new Geometry.CircleBody(testX2, testY2, this.bot.radius);

            if (!walls.collidesWithCircle(testBody1, 'full')) {
                normalizedX = Math.cos(perpAngle1);
                normalizedY = Math.sin(perpAngle1);
                rotation = perpAngle1;
            } else if (!walls.collidesWithCircle(testBody2, 'full')) {
                normalizedX = Math.cos(perpAngle2);
                normalizedY = Math.sin(perpAngle2);
                rotation = perpAngle2;
            } else {
                // Both perpendiculars blocked - switch to wander
                return this.getWanderAction(walls, currentTime || Date.now());
            }
        }

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
        // Change even faster if stuck
        const baseDuration = this.stuckCounter > 2 ? 100 : 300;
        const wanderDuration = baseDuration + Math.random() * 300;

        if (!this.wanderDirection || currentTime - this.wanderChangeTime > wanderDuration) {
            // Try to find a clear direction
            let foundClearPath = false;
            let attempts = 0;
            let angle = 0;

            while (!foundClearPath && attempts < 8) {
                angle = Math.random() * Math.PI * 2;
                const testX = this.bot.x + Math.cos(angle) * Constants.PLAYER_SPEED * 5;
                const testY = this.bot.y + Math.sin(angle) * Constants.PLAYER_SPEED * 5;
                const testBody = new Geometry.CircleBody(testX, testY, this.bot.radius);

                if (!walls.collidesWithCircle(testBody, 'full')) {
                    foundClearPath = true;
                } else {
                    attempts++;
                }
            }

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

        // Final check - make sure we're not walking into a wall
        const futureX = this.bot.x + Math.cos(variedAngle) * Constants.PLAYER_SPEED * 3;
        const futureY = this.bot.y + Math.sin(variedAngle) * Constants.PLAYER_SPEED * 3;
        const futureBody = new Geometry.CircleBody(futureX, futureY, this.bot.radius);

        if (walls.collidesWithCircle(futureBody, 'full')) {
            // Force new direction
            this.wanderDirection = null;
            return null;
        }

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
     * Get bot name - random human-like names
     */
    static getBotName(index: number, difficulty: BotDifficulty): string {
        const names = [
            // Popular names from various cultures
            'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
            'Riley', 'Avery', 'Quinn', 'Blake', 'Cameron',
            'Dakota', 'Reese', 'Parker', 'Skyler', 'Phoenix',
            'River', 'Sage', 'Rowan', 'Charlie', 'Sam',
            'Drew', 'Jesse', 'Kai', 'Rory', 'Finley',
            'Ash', 'Logan', 'Hunter', 'Tyler', 'Hayden',
            'Peyton', 'Kendall', 'Jamie', 'Devon', 'Payton',
            'Adrian', 'Ellis', 'Emerson', 'Kyle', 'Ryan',
            'Max', 'Leo', 'Mia', 'Zoe', 'Luna',
            'Nova', 'Aria', 'Cole', 'Jay', 'Kai',
        ];

        // Add some variation with difficulty indicators (subtle)
        const suffixes = {
            easy: ['Jr', '', '', '', ''],  // Mostly no suffix
            medium: ['', '', '', 'Pro', ''],  // Occasional Pro
            hard: ['', 'Pro', 'X', 'V', 'Prime'],  // More badass suffixes
        };

        const baseName = names[index % names.length];
        const suffix = suffixes[difficulty][index % suffixes[difficulty].length];

        return suffix ? `${baseName}${suffix}` : baseName;
    }
}
