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

    // Sort players by score for leaderboard
    const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
    const topPlayers = sortedPlayers.slice(0, 5); // Show top 5

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
                        <Space size="xs" />
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
                    <Space size="xs" />
                    {topPlayers.map((player, index) => (
                        <View key={player.playerId} style={{
                            ...styles.leaderboardRow,
                            backgroundColor: player.playerId === playerId ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                        }}>
                            <Text style={styles.rankText}>#{index + 1}</Text>
                            <Text style={styles.playerNameText}>{player.name}</Text>
                            <Text style={styles.scoreText}>{player.score || 0}</Text>
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
        maxWidth: isMobile ? '90%' : 600,
        maxHeight: '80%',
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: isMobile ? 12 : 20,
        borderRadius: 8,
        border: '2px solid rgba(255, 215, 0, 0.3)',
    },
    statRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '4px 0',
    },
    statLabel: {
        color: '#CCCCCC',
        fontSize: isMobile ? 12 : 14,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
    },
    leaderboardBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: isMobile ? 12 : 20,
        borderRadius: 8,
        border: '2px solid rgba(255, 255, 255, 0.2)',
    },
    leaderboardRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 4,
        marginBottom: 4,
    },
    rankText: {
        color: '#FFD700',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
        width: 40,
    },
    playerNameText: {
        color: '#FFFFFF',
        fontSize: isMobile ? 12 : 14,
        flex: 1,
    },
    scoreText: {
        color: '#00FF00',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
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
