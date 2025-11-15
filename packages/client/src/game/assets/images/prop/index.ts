import { createTexturesArray } from '../utils';
import potionRed1 from './potion-red-1.png';
import potionRed2 from './potion-red-2.png';
import potionRed3 from './potion-red-3.png';
import potionRed4 from './potion-red-4.png';
import speedBoost from './speed-boost.png';
import shield from './shield.png';
import rapidFire from './rapid-fire.png';
import invisibility from './invisibility.png';
import doubleDamage from './double-damage.png';

// Flask
const potionRedTextures = createTexturesArray([potionRed1, potionRed2, potionRed3, potionRed4]);

// Powerups
const speedBoostTextures = createTexturesArray([speedBoost]);
const shieldTextures = createTexturesArray([shield]);
const rapidFireTextures = createTexturesArray([rapidFire]);
const invisibilityTextures = createTexturesArray([invisibility]);
const doubleDamageTextures = createTexturesArray([doubleDamage]);

export {
    potionRedTextures,
    speedBoostTextures,
    shieldTextures,
    rapidFireTextures,
    invisibilityTextures,
    doubleDamageTextures
};
