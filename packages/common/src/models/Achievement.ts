export type AchievementType =
    | 'first-kill'
    | 'triple-kill'
    | 'no-death-win'
    | 'speed-demon'
    | 'sharpshooter'
    | 'survivor'
    | 'team-player'
    | 'collector';

export interface Achievement {
    id: AchievementType;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: number;
}

export interface PlayerProgress {
    level: number;
    xp: number;
    xpToNextLevel: number;
    totalKills: number;
    totalDeaths: number;
    totalWins: number;
    totalGames: number;
    achievements: Achievement[];
}
