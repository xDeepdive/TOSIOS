import { Graphics, Texture } from 'pixi.js';
import { BaseEntity } from '.';
import { Models } from '@tosios/common';
import { PropTextures } from '../assets/images';

const ZINDEXES = {
    SHADOW: 0,
    PROP: 1,
};

export class Prop extends BaseEntity {
    private _type: Models.PropType;

    private _active: boolean = false;

    private _shadow: Graphics;

    private _glow: Graphics | null = null;

    // Init
    constructor(prop: Models.PropJSON) {
        super({
            x: prop.x,
            y: prop.y,
            radius: prop.radius,
            textures: getTexture(prop.type),
            zIndex: ZINDEXES.PROP,
        });

        // For powerups, add a colored circle graphic instead of sprite
        if (prop.type !== 'potion-red') {
            this.sprite.visible = false; // Hide the default sprite

            // Create powerup visual
            const powerupGraphic = new Graphics();
            const color = getPowerupColor(prop.type);
            const size = prop.radius;

            // Draw colored circle
            powerupGraphic.beginFill(color, 0.9);
            powerupGraphic.drawCircle(0, 0, size);
            powerupGraphic.endFill();

            // Add white border
            powerupGraphic.lineStyle(3, 0xFFFFFF, 1);
            powerupGraphic.drawCircle(0, 0, size);

            powerupGraphic.zIndex = ZINDEXES.PROP;
            this.container.addChild(powerupGraphic);

            // Add glow effect
            this._glow = new Graphics();
            this._glow.beginFill(color, 0.2);
            this._glow.drawCircle(0, 0, size * 1.5);
            this._glow.endFill();
            this._glow.zIndex = 0;
            this.container.addChild(this._glow);
        }

        // Shadow
        this._shadow = new Graphics();
        this._shadow.zIndex = ZINDEXES.SHADOW;
        this._shadow.pivot.set(0.5);
        this._shadow.beginFill(0x000000, 0.3);
        this._shadow.drawEllipse(prop.radius, prop.radius * 2, prop.radius / 2, prop.radius / 4);
        this._shadow.endFill();
        this.container.addChild(this._shadow);

        // Sort rendering order
        this.container.sortChildren();

        // Prop
        this._type = prop.type;
        this.active = prop.active;
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

    set active(active: boolean) {
        this._active = active;
        this.visible = active;
    }

    // Getters
    get x(): number {
        return this.body.x;
    }

    get y(): number {
        return this.body.y;
    }

    get type() {
        return this._type;
    }

    get active() {
        return this._active;
    }
}

/**
 * Return a texture depending on a type.
 */
const getTexture = (type: Models.PropType): Texture[] => {
    switch (type) {
        case 'potion-red':
            return PropTextures.potionRedTextures;
        // Powerups will use graphics instead of textures
        default:
            return PropTextures.potionRedTextures; // Dummy return
    }
};

/**
 * Return a color for each powerup type
 */
const getPowerupColor = (type: Models.PropType): number => {
    switch (type) {
        case 'speed-boost':
            return 0x00FFFF; // Cyan
        case 'shield':
            return 0x4169E1; // Royal Blue
        case 'rapid-fire':
            return 0xFF6600; // Orange
        case 'invisibility':
            return 0xC0C0C0; // Silver/Gray
        case 'double-damage':
            return 0xFF1493; // Deep Pink
        default:
            return 0xFFFFFF; // White
    }
};
