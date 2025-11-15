import { Maths, Types } from '@tosios/common';
import { Circle } from './Circle';
import { type } from '@colyseus/schema';

export class Player extends Circle {
    @type('string')
    public playerId: string;

    @type('string')
    public name: string;

    @type('number')
    public lives: number;

    @type('number')
    public maxLives: number;

    @type('string')
    public team: Types.Teams;

    @type('string')
    public color: string;

    @type('number')
    public kills: number;

    @type('number')
    public rotation: number;

    @type('number')
    public ack: number;

    @type('boolean')
    public hasSpeedBoost: boolean = false;

    @type('boolean')
    public hasShield: boolean = false;

    @type('boolean')
    public hasRapidFire: boolean = false;

    @type('boolean')
    public isInvisible: boolean = false;

    @type('boolean')
    public hasDoubleDamage: boolean = false;

    @type('number')
    public deaths: number = 0;

    @type('number')
    public score: number = 0;

    @type('string')
    public weapon: Types.WeaponType = 'pistol';

    @type('string')
    public skin: string = 'default';

    @type('string')
    public hat: string = 'none';

    @type('number')
    public level: number = 1;

    @type('number')
    public xp: number = 0;

    @type('number')
    public killStreak: number = 0;

    @type('number')
    public highestKillStreak: number = 0;

    @type('number')
    public accuracy: number = 0;

    @type('number')
    public shotsFired: number = 0;

    @type('number')
    public shotsHit: number = 0;

    // This property is needed to limit shooting rate
    public lastShootAt: number;

    // Powerup timers
    public speedBoostExpiry: number = 0;
    public shieldExpiry: number = 0;
    public rapidFireExpiry: number = 0;
    public invisibilityExpiry: number = 0;
    public doubleDamageExpiry: number = 0;

    // Init
    constructor(
        playerId: string,
        x: number,
        y: number,
        radius: number,
        lives: number,
        maxLives: number,
        name: string,
        team?: Types.Teams,
    ) {
        super(x, y, radius);
        this.playerId = playerId;
        this.lives = lives;
        this.maxLives = maxLives;
        this.name = validateName(name);
        this.team = team;
        this.color = team ? getTeamColor(team) : '#FFFFFF';
        this.kills = 0;
        this.rotation = 0;
        this.lastShootAt = undefined;
    }

    // Methods
    move(dirX: number, dirY: number, speed: number) {
        const magnitude = Maths.normalize2D(dirX, dirY);

        const speedX = Math.round(Maths.round2Digits(dirX * (speed / magnitude)));
        const speedY = Math.round(Maths.round2Digits(dirY * (speed / magnitude)));

        this.x += speedX;
        this.y += speedY;
    }

    hurt(damage: number = 1) {
        // Shield absorbs the hit
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldExpiry = 0;
            return;
        }
        this.lives -= damage;
        if (this.lives <= 0) {
            this.deaths += 1;
            this.killStreak = 0; // Reset kill streak on death
        }
    }

    heal() {
        this.lives += 1;
    }

    activatePowerup(powerupType: string, currentTime: number) {
        switch (powerupType) {
            case 'speed-boost':
                this.hasSpeedBoost = true;
                this.speedBoostExpiry = currentTime + 10000;
                break;
            case 'shield':
                this.hasShield = true;
                this.shieldExpiry = currentTime + 15000;
                break;
            case 'rapid-fire':
                this.hasRapidFire = true;
                this.rapidFireExpiry = currentTime + 8000;
                break;
            case 'invisibility':
                this.isInvisible = true;
                this.invisibilityExpiry = currentTime + 5000;
                break;
            case 'double-damage':
                this.hasDoubleDamage = true;
                this.doubleDamageExpiry = currentTime + 10000;
                break;
        }
    }

    updatePowerups(currentTime: number) {
        if (this.hasSpeedBoost && currentTime >= this.speedBoostExpiry) {
            this.hasSpeedBoost = false;
        }
        if (this.hasShield && currentTime >= this.shieldExpiry) {
            this.hasShield = false;
        }
        if (this.hasRapidFire && currentTime >= this.rapidFireExpiry) {
            this.hasRapidFire = false;
        }
        if (this.isInvisible && currentTime >= this.invisibilityExpiry) {
            this.isInvisible = false;
        }
        if (this.hasDoubleDamage && currentTime >= this.doubleDamageExpiry) {
            this.hasDoubleDamage = false;
        }
    }

    addKill() {
        this.kills += 1;
        this.killStreak += 1;

        // Track highest kill streak
        if (this.killStreak > this.highestKillStreak) {
            this.highestKillStreak = this.killStreak;
        }

        // Bonus points for kill streaks
        let streakBonus = 0;
        if (this.killStreak >= 3) streakBonus = 50;
        if (this.killStreak >= 5) streakBonus = 100;
        if (this.killStreak >= 10) streakBonus = 200;

        this.score += 100 + streakBonus;
        this.addXP(50 + streakBonus); // XP with streak bonus
    }

    recordShot(hit: boolean) {
        this.shotsFired += 1;
        if (hit) {
            this.shotsHit += 1;
        }
        this.accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired) * 100 : 0;
    }

    addXP(amount: number) {
        this.xp += amount;
        // Level up every 1000 XP
        const newLevel = Math.floor(this.xp / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }
    }

    changeWeapon(weaponType: Types.WeaponType) {
        this.weapon = weaponType;
    }

    canBulletHurt(otherPlayerId: string, team?: string): boolean {
        if (!this.isAlive) {
            return false;
        }

        if (this.playerId === otherPlayerId) {
            return false;
        }

        if (!!team && team === this.team) {
            return false;
        }

        return true;
    }

    // Getters
    get isAlive(): boolean {
        return this.lives > 0;
    }

    get isFullLives(): boolean {
        return this.lives === this.maxLives;
    }

    // Setters
    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
    }

    setLives(lives: number) {
        if (lives) {
            this.lives = lives;
            this.kills = 0;
        } else {
            this.lives = 0;
        }
    }

    setName(name: string) {
        this.name = validateName(name);
    }

    setTeam(team: Types.Teams) {
        this.team = team;
        this.color = getTeamColor(team);
    }

    setKills(kills: number) {
        this.kills = kills;
    }
}

const validateName = (name: string) => name.trim().slice(0, 16);
const getTeamColor = (team: Types.Teams) => (team === 'Blue' ? '#0000FF' : '#FF0000');
