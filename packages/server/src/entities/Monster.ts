import { Constants, Maths, Models } from '@tosios/common';
import { MapSchema, type } from '@colyseus/schema';
import { Circle } from './Circle';
import { Player } from '.';

type MonsterState = 'idle' | 'patrol' | 'chase';

export class Monster extends Circle {
    @type('number')
    private rotation: number = 0;

    // Monster type and stats
    @type('string')
    public monsterType: Models.MonsterType;

    private speedPatrol: number;

    private speedChase: number;

    private sight: number;

    public attackDamage: number = 1;

    // Hidden properties
    private mapWidth: number;

    private mapHeight: number;

    private lives: number = 0;

    private maxLives: number = 0;

    private state: MonsterState = 'idle';

    private lastActionAt: number = Date.now();

    private lastAttackAt: number = Date.now();

    private idleDuration: number = 0;

    private patrolDuration: number = 0;

    private targetPlayerId: string = null;

    // Ghost-specific properties
    private lastTeleportAt: number = Date.now();

    // Init
    constructor(
        x: number,
        y: number,
        radius: number,
        mapWidth: number,
        mapHeight: number,
        lives: number,
        monsterType: Models.MonsterType = 'bat',
    ) {
        super(x, y, radius);

        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.monsterType = monsterType;
        this.lives = lives;
        this.maxLives = lives;

        // Set stats based on monster type
        this.setStatsFromType(monsterType);
    }

    private setStatsFromType(type: Models.MonsterType) {
        switch (type) {
            case 'spider':
                this.speedPatrol = Constants.MONSTER_SPIDER_SPEED_PATROL;
                this.speedChase = Constants.MONSTER_SPIDER_SPEED_CHASE;
                this.sight = Constants.MONSTER_SPIDER_SIGHT;
                this.attackDamage = 1;
                break;
            case 'golem':
                this.speedPatrol = Constants.MONSTER_GOLEM_SPEED_PATROL;
                this.speedChase = Constants.MONSTER_GOLEM_SPEED_CHASE;
                this.sight = Constants.MONSTER_GOLEM_SIGHT;
                this.attackDamage = Constants.MONSTER_GOLEM_ATTACK_DAMAGE;
                break;
            case 'ghost':
                this.speedPatrol = Constants.MONSTER_GHOST_SPEED_PATROL;
                this.speedChase = Constants.MONSTER_GHOST_SPEED_CHASE;
                this.sight = Constants.MONSTER_GHOST_SIGHT;
                this.attackDamage = 1;
                break;
            case 'boss':
                this.speedPatrol = Constants.MONSTER_BOSS_SPEED_PATROL;
                this.speedChase = Constants.MONSTER_BOSS_SPEED_CHASE;
                this.sight = Constants.MONSTER_BOSS_SIGHT;
                this.attackDamage = Constants.MONSTER_BOSS_ATTACK_DAMAGE;
                break;
            case 'bat':
            default:
                this.speedPatrol = Constants.MONSTER_BAT_SPEED_PATROL;
                this.speedChase = Constants.MONSTER_BAT_SPEED_CHASE;
                this.sight = Constants.MONSTER_BAT_SIGHT;
                this.attackDamage = 1;
                break;
        }
    }

    // Update
    update(players: MapSchema<Player>) {
        switch (this.state) {
            case 'idle':
                this.updateIdle(players);
                break;
            case 'patrol':
                this.updatePatrol(players);
                break;
            case 'chase':
                this.updateChase(players);
                break;
            default:
                break;
        }
    }

    updateIdle(players: MapSchema<Player>) {
        // Look for a player to chase
        if (this.lookForPlayer(players)) {
            return;
        }

        // Is state over?
        const delta = Date.now() - this.lastActionAt;
        if (delta > this.idleDuration) {
            this.startPatrol();
        }
    }

    updatePatrol(players: MapSchema<Player>) {
        // Look for a player to chase
        if (this.lookForPlayer(players)) {
            return;
        }

        // Is state over?
        const delta = Date.now() - this.lastActionAt;
        if (delta > this.patrolDuration) {
            this.startIdle();
            return;
        }

        // Move monster (use instance-specific speed)
        this.move(this.speedPatrol, this.rotation);

        // Is the monster out of bounds?
        if (
            this.x < Constants.TILE_SIZE ||
            this.x > this.mapWidth - Constants.TILE_SIZE ||
            this.y < Constants.TILE_SIZE ||
            this.y > this.mapHeight - Constants.TILE_SIZE
        ) {
            this.x = Maths.clamp(this.x, 0, this.mapWidth);
            this.y = Maths.clamp(this.y, 0, this.mapHeight);
            this.rotation = Maths.getRandomInt(-3, 3);
        }
    }

    updateChase(players: MapSchema<Player>) {
        // Did player disconnect or die?
        const player = getPlayerFromId(this.targetPlayerId, players);
        if (!player || !player.isAlive) {
            this.startIdle();
            return;
        }

        // Did player run away?
        const distance = Maths.getDistance(this.x, this.y, player.x, player.y);
        if (distance > this.sight) {
            this.startIdle();
            return;
        }

        // Ghost teleportation ability
        if (this.monsterType === 'ghost') {
            const timeSinceTeleport = Date.now() - this.lastTeleportAt;
            if (timeSinceTeleport > Constants.MONSTER_GHOST_TELEPORT_INTERVAL) {
                // Teleport closer to player (within range)
                const teleportDistance = Math.min(
                    distance * 0.6,
                    Constants.MONSTER_GHOST_TELEPORT_RANGE,
                );
                const angle = Maths.calculateAngle(player.x, player.y, this.x, this.y);
                this.x += Math.cos(angle) * teleportDistance;
                this.y += Math.sin(angle) * teleportDistance;

                // Clamp to map bounds
                this.x = Maths.clamp(this.x, Constants.TILE_SIZE, this.mapWidth - Constants.TILE_SIZE);
                this.y = Maths.clamp(this.y, Constants.TILE_SIZE, this.mapHeight - Constants.TILE_SIZE);

                this.lastTeleportAt = Date.now();
            }
        }

        // Move toward player (use instance-specific speed)
        this.rotation = Maths.calculateAngle(player.x, player.y, this.x, this.y);
        this.move(this.speedChase, this.rotation);
    }

    // States
    startIdle() {
        this.state = 'idle';
        this.rotation = 0;
        this.targetPlayerId = null;
        this.idleDuration = Maths.getRandomInt(
            Constants.MONSTER_IDLE_DURATION_MIN,
            Constants.MONSTER_IDLE_DURATION_MAX,
        );
        this.lastActionAt = Date.now();
    }

    startPatrol() {
        this.state = 'patrol';
        this.targetPlayerId = null;
        this.patrolDuration = Maths.getRandomInt(
            Constants.MONSTER_PATROL_DURATION_MIN,
            Constants.MONSTER_PATROL_DURATION_MAX,
        );
        this.rotation = Maths.getRandomInt(-3, 3);
        this.lastActionAt = Date.now();
    }

    startChase(playerId: string) {
        this.state = 'chase';
        this.targetPlayerId = playerId;
        this.lastActionAt = Date.now();
    }

    // Methods
    lookForPlayer(players: MapSchema<Player>): boolean {
        if (!this.targetPlayerId) {
            const playerId = getClosestPlayerId(this.x, this.y, players, this.sight);
            if (playerId) {
                this.startChase(playerId);
                return true;
            }
        }

        return false;
    }

    hurt() {
        this.lives -= 1;
    }

    move(speed: number, rotation: number) {
        this.x += Math.cos(rotation) * speed;
        this.y += Math.sin(rotation) * speed;
    }

    attack() {
        this.lastAttackAt = Date.now();
    }

    // Getters
    get isAlive(): boolean {
        return this.lives > 0;
    }

    get canAttack(): boolean {
        const delta = Math.abs(this.lastAttackAt - Date.now());
        return this.state === 'chase' && delta > Constants.MONSTER_ATTACK_BACKOFF;
    }
}

function getPlayerFromId(id: string, players: MapSchema<Player>): Player | null {
    return players.get(id);
}

function getClosestPlayerId(
    x: number,
    y: number,
    players: MapSchema<Player>,
    sight: number,
): string | null {
    let selectedPlayerId = null;

    players.forEach((player, playerId) => {
        if (player.isAlive) {
            const distance = Maths.getDistance(x, y, player.x, player.y);
            if (distance <= sight) {
                selectedPlayerId = playerId;
            }
        }
    });

    return selectedPlayerId;
}
