export type HazardType = 'lava' | 'spikes' | 'poison';

export interface HazardJSON {
    x: number;
    y: number;
    radius: number;
    type: HazardType;
    active: boolean;
}
