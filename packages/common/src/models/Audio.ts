export type SoundEffect =
    | 'shoot'
    | 'hit'
    | 'kill'
    | 'death'
    | 'powerup'
    | 'level-up'
    | 'explosion'
    | 'teleport'
    | 'trap-activate';

export type MusicTrack = 'menu' | 'lobby' | 'game' | 'victory' | 'defeat';

export interface AudioConfig {
    soundEffectsVolume: number;
    musicVolume: number;
    muted: boolean;
}
