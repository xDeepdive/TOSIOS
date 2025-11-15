export interface ChatMessage {
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
    team?: string;
}

export interface ChatMessageJSON {
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
    team?: string;
}
