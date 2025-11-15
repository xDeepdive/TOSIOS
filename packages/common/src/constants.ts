export const APP_TITLE = 'TOSIOS';

// General
export const WS_PORT = 3001;
export const ROOM_NAME = 'game'; // Colyseus Room<T>'s name (no need to change)
export const ROOM_REFRESH = 3000;
export const PLAYERS_REFRESH = 1000;
export const DEBUG = false;

// Game
export const MAPS_NAMES = ['small', 'gigantic'];
export const ROOM_PLAYERS_MIN = 2;
export const ROOM_PLAYERS_MAX = 16;
export const ROOM_PLAYERS_SCALES = [2, 4, 8, 10, 16];
export const ROOM_NAME_MAX = 16;
export const PLAYER_NAME_MAX = 16;
export const LOG_LINES_MAX = 5;
export const LOBBY_DURATION = 1000 * 10; // 10 seconds
export const GAME_DURATION = 1000 * 90; // 90 seconds
export const GAME_MODES = ['deathmatch', 'team deathmatch', 'capture-the-flag', 'king-of-the-hill'];

// Background
export const BACKGROUND_COLOR = '#25131A';

// Tile (rectangle)
export const TILE_SIZE = 32;

// Player (circle)
export const PLAYER_SIZE = 32;
export const PLAYER_SPEED = 1;
export const PLAYER_MAX_LIVES = 3;
export const PLAYER_WEAPON_SIZE = 12; // The bigger, the further away a bullet will be shot from.
export const PLAYER_HEARING_DISTANCE = 256;

// Monster
export const MONSTERS_COUNT = 3;
export const MONSTER_SIZE = 32;
export const MONSTER_SPEED_PATROL = 0.75;
export const MONSTER_SPEED_CHASE = 1.25;
export const MONSTER_SIGHT = 192;
export const MONSTER_LIVES = 3;
export const MONSTER_IDLE_DURATION_MIN = 1000;
export const MONSTER_IDLE_DURATION_MAX = 3000;
export const MONSTER_PATROL_DURATION_MIN = 1000;
export const MONSTER_PATROL_DURATION_MAX = 3000;
export const MONSTER_ATTACK_BACKOFF = 3000;

// Props (rectangle)
export const FLASKS_COUNT = 3;
export const FLASK_SIZE = 24;

// Powerups
export const POWERUPS_COUNT = 5;
export const POWERUP_SIZE = 24;
export const POWERUP_SPEED_BOOST_MULTIPLIER = 1.5;
export const POWERUP_SPEED_BOOST_DURATION = 10000; // 10 seconds
export const POWERUP_SHIELD_DURATION = 15000; // 15 seconds
export const POWERUP_RAPID_FIRE_MULTIPLIER = 0.5; // 50% faster fire rate
export const POWERUP_RAPID_FIRE_DURATION = 8000; // 8 seconds
export const POWERUP_INVISIBILITY_DURATION = 5000; // 5 seconds
export const POWERUP_DOUBLE_DAMAGE_DURATION = 10000; // 10 seconds

// Map Features
export const TELEPORTERS_COUNT = 4;
export const TELEPORTER_SIZE = 32;
export const TRAPS_COUNT = 5;
export const TRAP_SIZE = 24;
export const TRAP_DAMAGE = 1;
export const TRAP_COOLDOWN = 2000; // 2 seconds

// Bullet (circle)
export const BULLET_SIZE = 8;
export const BULLET_SPEED = 4;
export const BULLET_RATE = 800; // The bigger, the slower.

// Weapons
export const WEAPON_PISTOL_RATE = 800;
export const WEAPON_PISTOL_DAMAGE = 1;
export const WEAPON_PISTOL_SPEED = 4;
export const WEAPON_PISTOL_SIZE = 8;

export const WEAPON_SHOTGUN_RATE = 1500;
export const WEAPON_SHOTGUN_DAMAGE = 1;
export const WEAPON_SHOTGUN_SPEED = 3;
export const WEAPON_SHOTGUN_SIZE = 6;
export const WEAPON_SHOTGUN_SPREAD = 3; // Number of bullets

export const WEAPON_SNIPER_RATE = 2000;
export const WEAPON_SNIPER_DAMAGE = 2;
export const WEAPON_SNIPER_SPEED = 6;
export const WEAPON_SNIPER_SIZE = 10;

export const WEAPON_SMG_RATE = 300;
export const WEAPON_SMG_DAMAGE = 1;
export const WEAPON_SMG_SPEED = 4;
export const WEAPON_SMG_SIZE = 6;

export const WEAPON_ROCKET_RATE = 2500;
export const WEAPON_ROCKET_DAMAGE = 2;
export const WEAPON_ROCKET_SPEED = 2;
export const WEAPON_ROCKET_SIZE = 12;
export const WEAPON_ROCKET_EXPLOSION_RADIUS = 64;
