export type MonsterType = 'bat' | 'spider' | 'golem' | 'ghost' | 'boss';

export interface MonsterJSON {
    x: number;
    y: number;
    radius: number;
    rotation: number;
    type: MonsterType;
}
