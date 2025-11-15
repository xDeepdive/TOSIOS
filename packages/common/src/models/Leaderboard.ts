export interface LeaderboardEntry {
    playerId: string;
    playerName: string;
    kills: number;
    deaths: number;
    score: number;
    level: number;
    killStreak: number;
    accuracy: number;
    team?: string;
}

export interface GlobalLeaderboard {
    topPlayers: LeaderboardEntry[];
    lastUpdated: number;
}

export interface MatchLeaderboard {
    players: LeaderboardEntry[];
    winner: string | null;
    winningTeam: string | null;
}

export type LeaderboardSortBy = 'kills' | 'score' | 'kd-ratio' | 'accuracy' | 'level';
