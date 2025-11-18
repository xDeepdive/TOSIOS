import React, { CSSProperties } from 'react';
import { Models } from '@tosios/common';
import { Space, Text, View } from '../../components';
import { Container } from './Container';
import { isMobile } from 'react-device-detect';

interface VictoryScreenProps {
    winnerName?: string;
    isTimeout: boolean;
    players: Models.PlayerJSON[];
    playerId: string;
    onClose: () => void;
}

/**
 * Display victory/defeat screen with match stats
 */
export const VictoryScreen = React.memo((props: VictoryScreenProps): React.ReactElement | null => {
    const { winnerName, isTimeout, players, playerId, onClose } = props;

    if (!winnerName && !isTimeout) {
        return null;
    }

    // Find the current player
    const currentPlayer = players.find(p => p.playerId === playerId);
    const isWinner = currentPlayer?.name === winnerName;

    // Sort players by score (or kills if score is equal) for leaderboard
    const sortedPlayers = [...players].sort((a, b) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        if (scoreA !== scoreB) {
            return scoreB - scoreA; // Sort by score descending
        }
        return (b.kills || 0) - (a.kills || 0); // If scores are equal, sort by kills
    });
    const topPlayers = sortedPlayers.slice(0, 5); // Show top 5

    // Debug logging
    console.log('[VictoryScreen] Players data:', {
        currentPlayer,
        allPlayers: players.length,
        topPlayers: topPlayers.map(p => ({ name: p.name, score: p.score, kills: p.kills, level: p.level })),
    });

    return (
        <View style={styles.overlay}>
            <Container style={styles.victoryContainer}>
                {/* Title */}
                <Text style={{
                    ...styles.titleText,
                    color: isTimeout ? '#FFA500' : (isWinner ? '#00FF00' : '#FF4444'),
                }}>
                    {isTimeout ? '⏱️ TIME\'S UP!' : (isWinner ? '🏆 VICTORY!' : '💀 DEFEAT')}
                </Text>

                <Space size="s" />

                {/* Winner announcement */}
                {winnerName && (
                    <>
                        <Text style={styles.winnerText}>
                            {isTimeout ? `Time expired` : `${winnerName} wins!`}
                        </Text>
                        <Space size="m" />
                    </>
                )}

                {/* Player stats */}
                {currentPlayer && (
                    <View style={styles.statsBox}>
                        <Text style={styles.sectionTitle}>Your Performance</Text>
                        <Space size="s" />
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Score:</Text>
                            <Text style={styles.statValue}>{currentPlayer.score || 0}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Level:</Text>
                            <Text style={styles.statValue}>{currentPlayer.level || 1}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Kills:</Text>
                            <Text style={styles.statValue}>{currentPlayer.kills || 0}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Deaths:</Text>
                            <Text style={styles.statValue}>{currentPlayer.deaths || 0}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>K/D Ratio:</Text>
                            <Text style={styles.statValue}>
                                {currentPlayer.deaths ? ((currentPlayer.kills || 0) / currentPlayer.deaths).toFixed(2) : (currentPlayer.kills || 0)}
                            </Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Highest Streak:</Text>
                            <Text style={styles.statValue}>{currentPlayer.highestKillStreak || 0}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Accuracy:</Text>
                            <Text style={styles.statValue}>{(currentPlayer.accuracy || 0).toFixed(1)}%</Text>
                        </View>
                    </View>
                )}

                <Space size="m" />

                {/* Top players */}
                <View style={styles.leaderboardBox}>
                    <Text style={styles.sectionTitle}>Top Players</Text>
                    <Space size="s" />

                    {/* Header */}
                    <View style={styles.leaderboardHeader}>
                        <Text style={styles.headerRank}>#</Text>
                        <Text style={styles.headerName}>Name</Text>
                        <Text style={styles.headerStat}>Score</Text>
                        <Text style={styles.headerStat}>Kills</Text>
                        <Text style={styles.headerStat}>Lvl</Text>
                    </View>

                    {topPlayers.map((player, index) => (
                        <View key={player.playerId} style={{
                            ...styles.leaderboardRow,
                            backgroundColor: player.playerId === playerId ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                        }}>
                            <Text style={styles.rankText}>#{index + 1}</Text>
                            <Text style={styles.playerNameText}>
                                {player.playerId === playerId ? 'You' : player.name}
                            </Text>
                            <Text style={styles.scoreText}>{player.score || 0}</Text>
                            <Text style={styles.killsText}>{player.kills || 0}</Text>
                            <Text style={styles.levelText}>{player.level || 1}</Text>
                        </View>
                    ))}
                </View>

                <Space size="m" />

                {/* Close button */}
                <View
                    style={styles.closeButton}
                    onClick={onClose}
                >
                    <Text style={styles.closeButtonText}>Return to Lobby</Text>
                </View>
            </Container>
        </View>
    );
});

const styles: { [key: string]: CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        pointerEvents: 'auto',
    },
    victoryContainer: {
        backgroundColor: 'rgba(25, 19, 26, 0.95)',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
        padding: isMobile ? 24 : 40,
        maxWidth: isMobile ? '95%' : 700,
        maxHeight: '85%',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    },
    titleText: {
        fontSize: isMobile ? 32 : 48,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 0 10px currentColor',
    },
    winnerText: {
        fontSize: isMobile ? 18 : 24,
        color: '#FFD700',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: isMobile ? 16 : 20,
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statsBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: isMobile ? 16 : 24,
        borderRadius: 8,
        border: '2px solid rgba(255, 215, 0, 0.4)',
    },
    statRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '6px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    statLabel: {
        color: '#CCCCCC',
        fontSize: isMobile ? 13 : 15,
        fontWeight: '500',
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: isMobile ? 13 : 15,
        fontWeight: 'bold',
    },
    leaderboardBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: isMobile ? 16 : 24,
        borderRadius: 8,
        border: '2px solid rgba(255, 255, 255, 0.3)',
    },
    leaderboardHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '2px solid rgba(255, 215, 0, 0.5)',
        marginBottom: 8,
    },
    headerRank: {
        color: '#FFD700',
        fontSize: isMobile ? 11 : 13,
        fontWeight: 'bold',
        width: isMobile ? 30 : 40,
    },
    headerName: {
        color: '#FFD700',
        fontSize: isMobile ? 11 : 13,
        fontWeight: 'bold',
        flex: 1,
    },
    headerStat: {
        color: '#FFD700',
        fontSize: isMobile ? 11 : 13,
        fontWeight: 'bold',
        width: isMobile ? 45 : 60,
        textAlign: 'right',
    },
    leaderboardRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: 4,
        marginBottom: 6,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    rankText: {
        color: '#FFD700',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
        width: isMobile ? 30 : 40,
    },
    playerNameText: {
        color: '#FFFFFF',
        fontSize: isMobile ? 12 : 14,
        flex: 1,
        fontWeight: '500',
    },
    scoreText: {
        color: '#00FF00',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
        width: isMobile ? 45 : 60,
        textAlign: 'right',
    },
    killsText: {
        color: '#FF6B6B',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
        width: isMobile ? 45 : 60,
        textAlign: 'right',
    },
    levelText: {
        color: '#4ECDC4',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
        width: isMobile ? 45 : 60,
        textAlign: 'right',
    },
    closeButton: {
        backgroundColor: '#4ECDC4',
        padding: '12px 24px',
        borderRadius: 8,
        cursor: 'pointer',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        transition: 'all 0.2s',
        textAlign: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: isMobile ? 14 : 16,
        fontWeight: 'bold',
    },
};
