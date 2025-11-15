export type GameState = 'waiting' | 'lobby' | 'game';
export type GameMode = 'deathmatch' | 'team deathmatch' | 'capture-the-flag' | 'king-of-the-hill';
export type Teams = 'Red' | 'Blue';
export type WallCollisionType = 'full' | 'none';
export type WeaponType = 'pistol' | 'shotgun' | 'sniper' | 'smg' | 'rocket-launcher';
export type PlayerSkin = 'default' | 'ninja' | 'knight' | 'robot' | 'wizard' | 'pirate';
export type PlayerHat = 'none' | 'crown' | 'cap' | 'helmet' | 'top-hat' | 'bandana';

/**
 * Represent the initial parameters of a Player
 */
export interface IPlayerOptions {
    playerName?: string;
    skin?: PlayerSkin;
    hat?: PlayerHat;
}

/**
 * Represent the initial parameters of a Room
 */
export interface IRoomOptions {
    playerName?: string;
    roomName: string;
    roomMap: string;
    roomMaxPlayers: number;
    mode: GameMode;
}
