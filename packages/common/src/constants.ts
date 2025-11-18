export const APP_TITLE = 'TOSIOS';

// General
export const WS_PORT = 3001;
export const ROOM_NAME = 'game'; // Colyseus Room<T>'s name (no need to change)
export const ROOM_REFRESH = 3000;
export const PLAYERS_REFRESH = 1000;
export const DEBUG = false;

// Game
export const MAPS_NAMES = ['gigantic', 'desert', 'ice', 'forest'];
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
export const MONSTERS_COUNT = 1; // Start with just 1 monster
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

// Monster Types
export const MONSTER_TYPES = ['bat', 'spider', 'golem', 'ghost', 'boss'] as const;

// Bat (original - balanced)
export const MONSTER_BAT_SPEED_PATROL = 0.75;
export const MONSTER_BAT_SPEED_CHASE = 1.25;
export const MONSTER_BAT_LIVES = 3;
export const MONSTER_BAT_SIZE = 32;
export const MONSTER_BAT_SIGHT = 192;

// Spider (fast, low health)
export const MONSTER_SPIDER_SPEED_PATROL = 1.2;
export const MONSTER_SPIDER_SPEED_CHASE = 2.0;
export const MONSTER_SPIDER_LIVES = 2;
export const MONSTER_SPIDER_SIZE = 28;
export const MONSTER_SPIDER_SIGHT = 160;

// Golem (slow, high health, melee)
export const MONSTER_GOLEM_SPEED_PATROL = 0.4;
export const MONSTER_GOLEM_SPEED_CHASE = 0.7;
export const MONSTER_GOLEM_LIVES = 8;
export const MONSTER_GOLEM_SIZE = 48;
export const MONSTER_GOLEM_SIGHT = 128;
export const MONSTER_GOLEM_ATTACK_DAMAGE = 2; // Does 2 damage instead of 1

// Ghost (teleports, medium stats)
export const MONSTER_GHOST_SPEED_PATROL = 0.5;
export const MONSTER_GHOST_SPEED_CHASE = 1.0;
export const MONSTER_GHOST_LIVES = 4;
export const MONSTER_GHOST_SIZE = 32;
export const MONSTER_GHOST_SIGHT = 224;
export const MONSTER_GHOST_TELEPORT_INTERVAL = 5000; // Teleport every 5 seconds
export const MONSTER_GHOST_TELEPORT_RANGE = 200; // Max teleport distance

// Boss (rare, powerful)
export const MONSTER_BOSS_SPEED_PATROL = 0.6;
export const MONSTER_BOSS_SPEED_CHASE = 1.0;
export const MONSTER_BOSS_LIVES = 15;
export const MONSTER_BOSS_SIZE = 64;
export const MONSTER_BOSS_SIGHT = 256;
export const MONSTER_BOSS_ATTACK_DAMAGE = 2;
export const MONSTER_BOSS_SPAWN_MINIONS = true; // Can spawn smaller monsters

// Monster Waves
export const MONSTER_WAVES_ENABLED = true;
export const MONSTER_WAVE_INTERVAL = 30000; // New wave every 30 seconds (reduced frequency)
export const MONSTER_WAVE_INCREMENT = 1; // Add 1 monster per wave (reduced from 2)
export const MONSTER_WAVE_MAX_MONSTERS = 5; // Maximum 5 monsters at once (reduced from 15)

// Monster Loot
export const MONSTER_LOOT_ENABLED = true;
export const MONSTER_LOOT_DROP_CHANCE = 0.4; // 40% chance to drop loot
export const MONSTER_BOSS_LOOT_DROP_CHANCE = 1.0; // Bosses always drop loot

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

// Environmental Hazards
export const HAZARDS_ENABLED = true;
export const HAZARD_TYPES = ['lava', 'spikes', 'poison'] as const;

// Lava pools (continuous damage while standing in them)
export const HAZARD_LAVA_COUNT = 3;
export const HAZARD_LAVA_SIZE = 48;
export const HAZARD_LAVA_DAMAGE = 1;
export const HAZARD_LAVA_TICK_RATE = 1000; // Damage every 1 second

// Spike traps (instant damage when stepped on)
export const HAZARD_SPIKES_COUNT = 5;
export const HAZARD_SPIKES_SIZE = 32;
export const HAZARD_SPIKES_DAMAGE = 1;
export const HAZARD_SPIKES_COOLDOWN = 3000; // 3 seconds before can damage again

// Poison zones (damage over time + slow effect)
export const HAZARD_POISON_COUNT = 4;
export const HAZARD_POISON_SIZE = 64;
export const HAZARD_POISON_DAMAGE = 1;
export const HAZARD_POISON_TICK_RATE = 1500; // Damage every 1.5 seconds
export const HAZARD_POISON_SLOW_MULTIPLIER = 0.7; // 30% slower movement

// Map Themes
export const MAP_THEMES = ['default', 'forest', 'desert', 'dungeon', 'ice'] as const;
export const MAP_THEME_DEFAULT = 'default';

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

// Bots
export const BOTS_ENABLED = true; // Enable/disable bot system
export const BOTS_MIN_PLAYERS = 16; // Auto-spawn bots if less than this many players - ensure full 16-player sessions
export const BOTS_MAX_COUNT = 15; // Maximum number of bots (16 total with 1 real player minimum)
export const BOTS_DIFFICULTY = 'medium'; // easy, medium, hard
export const BOTS_UPDATE_INTERVAL = 16; // How often bots think (ms) - 60 FPS for smooth movement
export const BOTS_SHOOT_DISTANCE = 300; // Distance at which bots start shooting - increased range
export const BOTS_RETREAT_HEALTH = 1; // Health level at which bots retreat
export const BOTS_POWERUP_DETECTION_RANGE = 200; // Range for detecting powerups - increased
export const BOTS_EASY_AIM_ERROR = 0.3; // Radians of aim error (easy) - improved accuracy
export const BOTS_MEDIUM_AIM_ERROR = 0.15; // Radians of aim error (medium) - improved
export const BOTS_HARD_AIM_ERROR = 0.05; // Radians of aim error (hard) - very accurate
export const BOTS_EASY_REACTION_TIME = 50; // ms delay before actions - instant
export const BOTS_MEDIUM_REACTION_TIME = 30; // very fast
export const BOTS_HARD_REACTION_TIME = 16; // instant reactions

// UI Features
export const KILL_FEED_MAX_ENTRIES = 5; // Maximum kill feed notifications to show
export const KILL_FEED_DURATION = 5000; // How long kill feed entries stay visible (ms)
export const SCREEN_SHAKE_DURATION = 200; // Screen shake duration on damage (ms)
export const SCREEN_SHAKE_INTENSITY = 5; // Screen shake intensity (pixels)
export const HUD_UPDATE_INTERVAL = 100; // HUD update frequency (ms)
