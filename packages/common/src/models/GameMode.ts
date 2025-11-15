export interface CaptureTheFlagState {
    redFlagPosition: { x: number; y: number };
    blueFlagPosition: { x: number; y: number };
    redFlagCarrier: string | null; // playerId
    blueFlagCarrier: string | null; // playerId
    redFlagAtBase: boolean;
    blueFlagAtBase: boolean;
    redTeamScore: number;
    blueTeamScore: number;
    captureLimit: number; // First to capture X flags wins
}

export interface KingOfTheHillState {
    hillPosition: { x: number; y: number };
    hillRadius: number;
    controllingTeam: string | null; // 'Red' | 'Blue' | null
    redTeamScore: number;
    blueTeamScore: number;
    scoreLimit: number; // First to X points wins
    contestedHill: boolean; // Both teams on the hill
}

export interface BattleRoyaleState {
    safeZoneRadius: number;
    safeZonePosition: { x: number; y: number };
    shrinkStartTime: number;
    nextShrinkTime: number;
    damagePerTick: number;
}
