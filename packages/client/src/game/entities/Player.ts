import { Constants, Maths, Models, Types } from '@tosios/common';
import { Container, Graphics, Sprite, Texture, utils } from 'pixi.js';
import { Effects, PlayerLivesSprite, TextSprite } from '../sprites';
import { PlayerTextures, WeaponTextures } from '../assets/images';
import { SmokeConfig, SmokeTexture } from '../assets/particles';
import { BaseEntity } from '.';
import { Emitter } from 'pixi-particles';

const NAME_OFFSET = 4;
const LIVES_OFFSET = 10;
const HURT_COLOR = 0xff0000;
const HEAL_COLOR = 0x00ff00;
const SPEED_BOOST_COLOR = 0x00ffff; // Cyan
const SHIELD_COLOR = 0x4169e1; // Royal Blue
const RAPID_FIRE_COLOR = 0xff6600; // Orange
const INVISIBILITY_COLOR = 0xc0c0c0; // Silver
const DOUBLE_DAMAGE_COLOR = 0xff1493; // Deep Pink
const BULLET_DELAY_FACTOR = 1.1; // Add 10% to delay as server may lag behind sometimes (rarely)
const SMOKE_DELAY = 500;
const DEAD_ALPHA = 0.2;
const POWERUP_TEXT_OFFSET = 20;
const ZINDEXES = {
    SHADOW: 0,
    WEAPON_BACK: 1,
    PLAYER: 2,
    WEAPON_FRONT: 3,
    INFOS: 4,
};

export type PlayerDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export class Player extends BaseEntity {
    private _playerId: string = '';

    private _name: string = '';

    private _lives: number = 0;

    private _maxLives: number = 0;

    public team?: Types.Teams;

    private _color: string = '#FFFFFF';

    private _kills: number = 0;

    private _rotation: number = 0;

    // Powerup states
    private _hasSpeedBoost: boolean = false;

    private _hasShield: boolean = false;

    private _hasRapidFire: boolean = false;

    private _isInvisible: boolean = false;

    private _hasDoubleDamage: boolean = false;

    // New stats
    public level: number = 1;

    public score: number = 0;

    public killStreak: number = 0;

    public xp: number = 0;

    // Computed
    private _isGhost: boolean = false;

    private _direction: PlayerDirection = 'bottom-right';

    private _lastShootAt: number = 0;

    private _toX: number = 0;

    private _toY: number = 0;

    private _weaponSprite: Sprite;

    private _nameTextSprite: TextSprite;

    private _livesSprite: PlayerLivesSprite;

    public ack?: number;

    private _shadow: Graphics;

    private _particlesContainer?: Container;

    private _lastSmokeAt: number = 0;

    // Init
    constructor(player: Models.PlayerJSON, isGhost: boolean, particlesContainer?: Container) {
        super({
            x: player.x,
            y: player.y,
            radius: player.radius,
            textures: getTexture(player.lives),
            zIndex: ZINDEXES.PLAYER,
        });

        // Weapon
        this._weaponSprite = new Sprite(WeaponTextures.staff);
        this._weaponSprite.anchor.set(0, 0.5);
        this._weaponSprite.position.set(player.radius, player.radius);
        this._weaponSprite.zIndex = ZINDEXES.WEAPON_BACK;
        this.container.addChild(this._weaponSprite);

        // Name
        this._nameTextSprite = new TextSprite(player.name, 8, 0.5, 1);
        this._nameTextSprite.position.set(player.radius, -NAME_OFFSET);
        this._nameTextSprite.zIndex = ZINDEXES.INFOS;
        this.container.addChild(this._nameTextSprite);

        // Lives
        this._livesSprite = new PlayerLivesSprite(0.5, 1, 8, player.maxLives, player.lives);
        this._livesSprite.position.set(
            player.radius,
            this._nameTextSprite.y - this._nameTextSprite.height - LIVES_OFFSET,
        );
        this._livesSprite.anchorX = 0.5;
        this._livesSprite.zIndex = ZINDEXES.INFOS;
        this.container.addChild(this._livesSprite);

        // Shadow
        this._shadow = new Graphics();
        this._shadow.zIndex = ZINDEXES.SHADOW;
        this._shadow.pivot.set(0.5);
        this._shadow.beginFill(0x000000, 0.3);
        this._shadow.drawEllipse(player.radius, player.radius * 2, player.radius * 0.7, player.radius * 0.3);
        this._shadow.endFill();
        this.container.addChild(this._shadow);

        // Sort rendering order
        this.container.sortChildren();

        // Reference to the particles container
        this._particlesContainer = particlesContainer;

        // Player
        this.playerId = player.playerId;
        this.toX = player.x;
        this.toY = player.y;
        this.rotation = player.rotation;
        this.name = player.name;
        this.color = player.color;
        this.lives = player.lives;
        this.maxLives = player.maxLives;
        this.kills = player.kills;
        this.team = player.team;
        this.isGhost = isGhost;

        // Initialize stats from server
        if (player.level !== undefined) this.level = player.level;
        if (player.score !== undefined) this.score = player.score;
        if (player.killStreak !== undefined) this.killStreak = player.killStreak;
        if (player.xp !== undefined) this.xp = player.xp;

        // Debug logging
        console.log(`[Player Constructor] ${player.name} stats:`, {
            level: this.level,
            score: this.score,
            killStreak: this.killStreak,
            xp: this.xp,
            fromServer: { level: player.level, score: player.score, killStreak: player.killStreak, xp: player.xp }
        });

        // Ghost
        if (isGhost) {
            this.visible = Constants.DEBUG;
        }
    }

    // Methods
    move(dirX: number, dirY: number, speed: number) {
        const magnitude = Maths.normalize2D(dirX, dirY);
        const speedX = Math.round(Maths.round2Digits(dirX * (speed / magnitude)));
        const speedY = Math.round(Maths.round2Digits(dirY * (speed / magnitude)));

        this.x += speedX;
        this.y += speedY;
    }

    hurt() {
        Effects.flash(this.sprite, HURT_COLOR, utils.string2hex(this.color));
    }

    heal() {
        Effects.flash(this.sprite, HEAL_COLOR, utils.string2hex(this.color));
    }

    speedBoostEffect() {
        Effects.flash(this.sprite, SPEED_BOOST_COLOR, utils.string2hex(this.color));
        this.showPowerupText('⚡ SPEED BOOST!', SPEED_BOOST_COLOR);
    }

    shieldEffect() {
        Effects.flash(this.sprite, SHIELD_COLOR, utils.string2hex(this.color));
        this.showPowerupText('🛡️ SHIELD!', SHIELD_COLOR);
    }

    rapidFireEffect() {
        Effects.flash(this.sprite, RAPID_FIRE_COLOR, utils.string2hex(this.color));
        this.showPowerupText('🔥 RAPID FIRE!', RAPID_FIRE_COLOR);
    }

    invisibilityEffect() {
        Effects.flash(this.sprite, INVISIBILITY_COLOR, utils.string2hex(this.color));
        this.showPowerupText('👻 INVISIBLE!', INVISIBILITY_COLOR);
    }

    doubleDamageEffect() {
        Effects.flash(this.sprite, DOUBLE_DAMAGE_COLOR, utils.string2hex(this.color));
        this.showPowerupText('💥 DOUBLE DAMAGE!', DOUBLE_DAMAGE_COLOR);
    }

    showPowerupText(text: string, color: number) {
        // Create a text sprite that floats up and fades out
        const textSprite = new TextSprite(text, 10, 0.5, 1);
        textSprite.position.set(this.body.radius, -POWERUP_TEXT_OFFSET);
        textSprite.zIndex = ZINDEXES.INFOS + 1;
        textSprite.tint = color;
        this.container.addChild(textSprite);

        // Animate the text upward and fade out
        let opacity = 1;
        let offsetY = 0;
        const animationInterval = setInterval(() => {
            offsetY += 2;
            opacity -= 0.05;
            textSprite.position.y = -POWERUP_TEXT_OFFSET - offsetY;
            textSprite.alpha = opacity;

            if (opacity <= 0) {
                clearInterval(animationInterval);
                this.container.removeChild(textSprite);
            }
        }, 50);
    }

    updateTextures() {
        const isAlive = this.lives > 0;

        // Player
        this.sprite.alpha = isAlive ? 1 : DEAD_ALPHA;
        this.sprite.textures = isAlive ? PlayerTextures.playerIdleTextures : PlayerTextures.playerDeadTextures;
        this.sprite.anchor.set(0.5);
        this.sprite.width = this.body.width;
        this.sprite.height = this.body.height;
        this.sprite.play();

        // Weapon
        this._weaponSprite.visible = this.isGhost ? isAlive && Constants.DEBUG : isAlive;

        // Name
        this._nameTextSprite.alpha = isAlive ? 1 : DEAD_ALPHA;

        // Lives
        this._livesSprite.alpha = isAlive ? 1 : DEAD_ALPHA;

        // Shadow
        this._shadow.alpha = isAlive ? 1 : DEAD_ALPHA;
    }

    canShoot(): boolean {
        if (!this.isAlive) {
            return false;
        }

        const now: number = Date.now();
        if (now - this.lastShootAt < Constants.BULLET_RATE * BULLET_DELAY_FACTOR) {
            return false;
        }

        this.lastShootAt = now;
        return true;
    }

    canBulletHurt(otherPlayerId: string, team?: string): boolean {
        if (!this.isAlive) {
            return false;
        }

        if (this.isGhost) {
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

    spawnSmoke() {
        if (!this._particlesContainer) {
            return;
        }

        if (!this.isAlive) {
            return;
        }

        const timeSinceLastSmoke = Date.now() - this._lastSmokeAt;
        if (timeSinceLastSmoke < SMOKE_DELAY) {
            return;
        }

        new Emitter(this._particlesContainer, [SmokeTexture], {
            ...SmokeConfig,
            pos: {
                x: this.body.x,
                y: this.body.y + this.body.radius / 2,
            },
        }).playOnceAndDestroy();

        this._lastSmokeAt = Date.now();
    }

    // Setters
    set x(x: number) {
        this.container.x = x;
        this.body.x = x;
        this.spawnSmoke();
    }

    set y(y: number) {
        this.container.y = y;
        this.body.y = y;
        this.spawnSmoke();
    }

    set toX(toX: number) {
        this._toX = toX;
    }

    set toY(toY: number) {
        this._toY = toY;
    }

    set playerId(playerId: string) {
        this._playerId = playerId;
    }

    set name(name: string) {
        this._name = name;
        this._nameTextSprite.text = name;
    }

    set lives(lives: number) {
        if (this._lives === lives) {
            return;
        }

        if (lives > this._lives) {
            this.heal();
        }

        this._lives = lives;
        this._livesSprite.lives = this._lives;
        this.updateTextures();
    }

    set maxLives(maxLives: number) {
        if (this._maxLives === maxLives) {
            return;
        }

        this._maxLives = maxLives;
        this._livesSprite.maxLives = this._maxLives;
        this.updateTextures();
    }

    set color(color: string) {
        if (this._color === color) {
            return;
        }

        this._color = color;

        // FIXME: Tints seem not to be apliable directly on a AnimatedSprite.
        // Therefore, adding a delay fixes the problem for now.
        setTimeout(() => {
            this.sprite.tint = utils.string2hex(color);
            this._weaponSprite.tint = utils.string2hex(color);
        }, 300);
    }

    set kills(kills: number) {
        if (this._kills === kills) {
            return;
        }

        this._kills = kills;
    }

    set rotation(rotation: number) {
        this._direction = getDirection(rotation);

        switch (this._direction) {
            case 'top-left':
                this.sprite.scale.x = -2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_BACK;
                break;
            case 'top-right':
                this.sprite.scale.x = 2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_BACK;
                break;
            case 'bottom-left':
                this.sprite.scale.x = -2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_FRONT;
                break;
            case 'bottom-right':
                this.sprite.scale.x = 2;
                this._weaponSprite.zIndex = ZINDEXES.WEAPON_FRONT;
                break;
            default:
                break;
        }

        this._rotation = rotation;
        this._weaponSprite.rotation = rotation;
        this.container.sortChildren();
    }

    set isGhost(isGhost: boolean) {
        this._isGhost = isGhost;
    }

    set lastShootAt(lastShootAt: number) {
        this._lastShootAt = lastShootAt;
    }

    set hasSpeedBoost(hasSpeedBoost: boolean) {
        if (!this._hasSpeedBoost && hasSpeedBoost) {
            this.speedBoostEffect();
        }
        this._hasSpeedBoost = hasSpeedBoost;
    }

    set hasShield(hasShield: boolean) {
        if (!this._hasShield && hasShield) {
            this.shieldEffect();
        }
        this._hasShield = hasShield;
    }

    set hasRapidFire(hasRapidFire: boolean) {
        if (!this._hasRapidFire && hasRapidFire) {
            this.rapidFireEffect();
        }
        this._hasRapidFire = hasRapidFire;
    }

    set isInvisible(isInvisible: boolean) {
        if (!this._isInvisible && isInvisible) {
            this.invisibilityEffect();
        }
        this._isInvisible = isInvisible;
    }

    set hasDoubleDamage(hasDoubleDamage: boolean) {
        if (!this._hasDoubleDamage && hasDoubleDamage) {
            this.doubleDamageEffect();
        }
        this._hasDoubleDamage = hasDoubleDamage;
    }

    // Getters
    get x(): number {
        return this.body.x;
    }

    get y(): number {
        return this.body.y;
    }

    get toX(): number {
        return this._toX;
    }

    get toY(): number {
        return this._toY;
    }

    get playerId() {
        return this._playerId;
    }

    get name() {
        return this._name;
    }

    get lives() {
        return this._lives;
    }

    get maxLives() {
        return this._maxLives;
    }

    get color() {
        return this._color;
    }

    get kills() {
        return this._kills;
    }

    get rotation() {
        return this._rotation;
    }

    get isGhost() {
        return this._isGhost;
    }

    get lastShootAt() {
        return this._lastShootAt;
    }

    get isAlive() {
        return this._lives > 0;
    }

    get hasSpeedBoost() {
        return this._hasSpeedBoost;
    }

    get hasShield() {
        return this._hasShield;
    }

    get hasRapidFire() {
        return this._hasRapidFire;
    }

    get isInvisible() {
        return this._isInvisible;
    }

    get hasDoubleDamage() {
        return this._hasDoubleDamage;
    }
}

/**
 * Return a texture depending on the number of lives.
 */
const getTexture = (lives: number): Texture[] => {
    return lives > 0 ? PlayerTextures.playerIdleTextures : PlayerTextures.playerDeadTextures;
};

/**
 * Get a direction given a rotation.
 */
function getDirection(rotation: number): PlayerDirection {
    const top = -(Math.PI / 2);
    const right = 0;
    const bottom = Math.PI / 2;

    // Top
    if (rotation < right) {
        if (rotation > top) {
            return 'top-right';
        }

        return 'top-left';
    }

    // Bottom
    if (rotation < bottom) {
        return 'bottom-right';
    }

    return 'bottom-left';
}
