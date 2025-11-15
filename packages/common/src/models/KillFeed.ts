export interface KillFeedEntry {
    id: string;
    killerName: string;
    killedName: string;
    weapon?: string;
    timestamp: number;
}
