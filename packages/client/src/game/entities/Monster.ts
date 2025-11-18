import { BaseEntity } from './';
import { Effects } from '../sprites';
import { Graphics } from 'pixi.js';
import { Models } from '@tosios/common';
import { MonstersTextures } from '../assets/images';

const HURT_COLOR = 0xff0000;
const ZINDEXES = {
    SHADOW: 0,
    MONSTER: 1,
};

export type MonsterDirection = 'left' | 'right';

export class Monster extends BaseEntity {
    private _toX: number = 0;

    private _toY: number = 0;

    private _direction: MonsterDirection = 'right';

    private _shadow: Graphics;

    public monsterType: Models.MonsterType;

    // Init
    constructor(monster: Models.MonsterJSON) {
        super({
            x: monster.x,
            y: monster.y,
            radius: monster.radius,
            textures: getMonsterTextures(monster.type),
            zIndex: ZINDEXES.MONSTER,
        });

        this.monsterType = monster.type;

        // Apply color tint based on monster type for visual distinction
        const tints = {
            bat: 0xFFFFFF,        // White (default)
            spider: 0x8B4513,     // Brown
            golem: 0x808080,      // Gray/Stone
            ghost: 0xE0E0FF,      // Pale blue/white
            boss: 0xFF0000,       // Red
        };
        this.sprite.tint = tints[monster.type];

        // Adjust scale based on monster type
        const scales = {
            bat: 2,
            spider: 2.2,
            golem: 2.5,
            ghost: 2.3,
            boss: 3.0,
        };
        const baseScale = scales[monster.type];
        this.sprite.scale.set(baseScale, baseScale);

        // Shadow
        this._shadow = new Graphics();
        this._shadow.zIndex = ZINDEXES.SHADOW;
        this._shadow.pivot.set(0.5);
        this._shadow.beginFill(0x000000, 0.3);
        this._shadow.drawEllipse(monster.radius, monster.radius * 2, monster.radius / 2, monster.radius / 4);
        this._shadow.endFill();
        this.container.addChild(this._shadow);

        // Sort rendering order
        this.container.sortChildren();
    }

    // Methods
    hurt() {
        Effects.flash(this.sprite, HURT_COLOR, 0xffffff);
    }

    // Setters
    set x(x: number) {
        this.container.x = x;
        this.body.x = x;
    }

    set y(y: number) {
        this.container.y = y;
        this.body.y = y;
    }

    set toX(toX: number) {
        this._toX = toX;
    }

    set toY(toY: number) {
        this._toY = toY;
    }

    set rotation(rotation: number) {
        this._direction = getDirection(rotation);

        // Get the current absolute scale (preserve monster type scaling)
        const currentScale = Math.abs(this.sprite.scale.x);

        switch (this._direction) {
            case 'left':
                this.sprite.scale.x = -currentScale;
                break;
            case 'right':
                this.sprite.scale.x = currentScale;
                break;
            default:
                break;
        }
    }

    // Getters
    get x(): number {
        return this.body.x;
    }

    get y(): number {
        return this.body.y;
    }

    get toX() {
        return this._toX;
    }

    get toY() {
        return this._toY;
    }
}

/**
 * Get a direction given a rotation.
 */
function getDirection(rotation: number): MonsterDirection {
    if (rotation >= -(Math.PI / 2) && rotation <= Math.PI / 2) {
        return 'right';
    }

    return 'left';
}

/**
 * Get textures for different monster types.
 * Note: Currently all monsters use bat sprite with different colors/scales for distinction.
 * Each monster type has unique tint and size (see constructor).
 */
function getMonsterTextures(type: Models.MonsterType): any {
    // All monsters use bat texture with type-specific tinting:
    // - Bat: White (default)
    // - Spider: Brown
    // - Golem: Gray/Stone
    // - Ghost: Pale blue
    // - Boss: Red (larger)
    return MonstersTextures.Bat;
}
