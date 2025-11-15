export type PropType =
    | 'potion-red'
    | 'speed-boost'
    | 'shield'
    | 'rapid-fire'
    | 'invisibility'
    | 'double-damage'
    | 'teleporter'
    | 'trap-spike'
    | 'trap-fire';

export interface PropJSON {
    x: number;
    y: number;
    radius: number;
    active: boolean;
    type: PropType;
}
