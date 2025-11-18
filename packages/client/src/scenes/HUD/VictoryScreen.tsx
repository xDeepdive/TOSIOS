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
 * Desktop-optimized layout with two-column design
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
    const topPlayers = sortedPlayers.slice(0, 8); // Show top 8 for better display

    // Debug logging
    console.log('[VictoryScreen] Players data:', {
        currentPlayer,
        allPlayers: players.length,
        topPlayers: topPlayers.map(p => ({ name: p.name, score: p.score, kills: p.kills, level: p.level })),
    });

    return (
        <View style={styles.overlay}>
            <Container style={styles.victoryContainer}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={{
                        ...styles.titleText,
                        color: isTimeout ? '#FFA500' : (isWinner ? '#00FF00' : '#FF4444'),
                    }}>
                        {isTimeout ? '⏱️ TIME\'S UP!' : (isWinner ? '🏆 VICTORY!' : '💀 DEFEAT')}
                    </Text>

                    {winnerName && (
                        <Text style={styles.winnerText}>
                            {isTimeout ? `Match ended by timeout` : `${winnerName} wins the match!`}
                        </Text>
                    )}
                </View>

                <Space size="l" />

                {/* Desktop: Two Column Layout | Mobile: Single Column */}
                <View style={isMobile ? styles.mobileLayout : styles.desktopLayout}>
                    {/* Left Column: Player Stats */}
                    {currentPlayer && (
                        <View style={styles.statsColumn}>
                            <View style={styles.statsBox}>
                                <Text style={styles.sectionTitle}>
                                    ⭐ YOUR PERFORMANCE
                                </Text>
                                <Space size="s" />

                                {/* Score - Highlighted */}
                                <View style={styles.statRowHighlight}>
                                    <Text style={styles.statLabelLarge}>SCORE</Text>
                                    <Text style={styles.statValueLarge}>{currentPlayer.score || 0}</Text>
                                </View>

                                {/* Level */}
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Level</Text>
                                    <Text style={styles.statValue}>{currentPlayer.level || 1}</Text>
                                </View>

                                {/* Kills */}
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Kills</Text>
                                    <Text style={styles.statValueGreen}>{currentPlayer.kills || 0}</Text>
                                </View>

                                {/* Deaths */}
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Deaths</Text>
                                    <Text style={styles.statValueRed}>{currentPlayer.deaths || 0}</Text>
                                </View>

                                {/* K/D Ratio - Highlighted */}
                                <View style={styles.statRowHighlight}>
                                    <Text style={styles.statLabelLarge}>K/D RATIO</Text>
                                    <Text style={styles.statValueLarge}>
                                        {currentPlayer.deaths ? ((currentPlayer.kills || 0) / currentPlayer.deaths).toFixed(2) : (currentPlayer.kills || 0)}
                                    </Text>
                                </View>

                                {/* Best Streak */}
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Best Streak</Text>
                                    <Text style={styles.statValue}>{currentPlayer.highestKillStreak || 0} 🔥</Text>
                                </View>

                                {/* Accuracy */}
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Accuracy</Text>
                                    <Text style={styles.statValue}>{(currentPlayer.accuracy || 0).toFixed(1)}%</Text>
                                </View>

                                {/* XP */}
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>XP Earned</Text>
                                    <Text style={styles.statValue}>{currentPlayer.xp || 0}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {isMobile && <Space size="m" />}

                    {/* Right Column: Leaderboard */}
                    <View style={styles.leaderboardColumn}>
                        <View style={styles.leaderboardBox}>
                            <Text style={styles.sectionTitle}>
                                🏆 TOP PLAYERS
                            </Text>
                            <Space size="s" />

                            {/* Header */}
                            <View style={styles.leaderboardHeader}>
                                <Text style={styles.headerRank}>RANK</Text>
                                <Text style={styles.headerName}>PLAYER</Text>
                                <Text style={styles.headerStat}>SCORE</Text>
                                <Text style={styles.headerStat}>KILLS</Text>
                                <Text style={styles.headerStat}>LEVEL</Text>
                            </View>

                            {/* Player Rows */}
                            {topPlayers.map((player, index) => {
                                const isCurrentPlayer = player.playerId === playerId;
                                const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
                                const rankColor = index < 3 ? rankColors[index] : '#FFD700';

                                return (
                                    <View key={player.playerId} style={{
                                        ...styles.leaderboardRow,
                                        backgroundColor: isCurrentPlayer
                                            ? 'rgba(78, 205, 196, 0.25)'
                                            : index < 3
                                                ? 'rgba(255, 215, 0, 0.1)'
                                                : 'transparent',
                                        border: isCurrentPlayer ? '2px solid #4ECDC4' : '1px solid rgba(255, 255, 255, 0.1)',
                                    }}>
                                        <Text style={{...styles.rankText, color: rankColor}}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </Text>
                                        <Text style={{
                                            ...styles.playerNameText,
                                            color: isCurrentPlayer ? '#4ECDC4' : '#FFFFFF',
                                            fontWeight: isCurrentPlayer ? 'bold' : '500',
                                        }}>
                                            {isCurrentPlayer ? `${player.name} (YOU)` : player.name}
                                        </Text>
                                        <Text style={styles.scoreText}>{player.score || 0}</Text>
                                        <Text style={styles.killsText}>{player.kills || 0}</Text>
                                        <Text style={styles.levelText}>{player.level || 1}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                <Space size="l" />

                {/* Close Button */}
                <View
                    style={styles.closeButton}
                    onClick={onClose}
                    onMouseEnter={(e: any) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e: any) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Text style={styles.closeButtonText}>RETURN TO LOBBY</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        pointerEvents: 'auto',
    },
    victoryContainer: {
        backgroundColor: 'rgba(15, 10, 16, 0.98)',
        border: '4px solid rgba(78, 205, 196, 0.6)',
        borderRadius: 20,
        padding: isMobile ? 24 : 60,
        maxWidth: isMobile ? '95%' : 1400,
        width: isMobile ? '95%' : '90%',
        maxHeight: '95%',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 100px rgba(78, 205, 196, 0.2)',
    },
    titleSection: {
        textAlign: 'center',
        marginBottom: 20,
    },
    titleText: {
        fontSize: isMobile ? 40 : 72,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 0 20px currentColor, 0 0 40px currentColor',
        marginBottom: 16,
        letterSpacing: 4,
    },
    winnerText: {
        fontSize: isMobile ? 22 : 32,
        color: '#FFD700',
        textAlign: 'center',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    // Layout containers
    desktopLayout: {
        display: 'flex',
        flexDirection: 'row',
        gap: 32,
        alignItems: 'stretch',
    },
    mobileLayout: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    statsColumn: {
        flex: 1,
        minWidth: 0,
    },
    leaderboardColumn: {
        flex: 1.2,
        minWidth: 0,
    },
    sectionTitle: {
        fontSize: isMobile ? 20 : 28,
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 2,
        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    // Stats Box
    statsBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: isMobile ? 20 : 40,
        borderRadius: 16,
        border: '3px solid rgba(255, 215, 0, 0.6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        height: '100%',
    },
    statRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 8px' : '16px 12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: isMobile ? 40 : 56,
        alignItems: 'center',
    },
    statRowHighlight: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: isMobile ? '14px 12px' : '20px 16px',
        borderBottom: '2px solid rgba(255, 215, 0, 0.4)',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 8,
        marginBottom: 8,
        minHeight: isMobile ? 50 : 70,
        alignItems: 'center',
    },
    statLabel: {
        color: '#CCCCCC',
        fontSize: isMobile ? 16 : 20,
        fontWeight: '500',
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: isMobile ? 16 : 22,
        fontWeight: 'bold',
    },
    statValueGreen: {
        color: '#00FF00',
        fontSize: isMobile ? 16 : 22,
        fontWeight: 'bold',
    },
    statValueRed: {
        color: '#FF6B6B',
        fontSize: isMobile ? 16 : 22,
        fontWeight: 'bold',
    },
    statLabelLarge: {
        color: '#FFD700',
        fontSize: isMobile ? 18 : 24,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    statValueLarge: {
        color: '#FFFFFF',
        fontSize: isMobile ? 22 : 32,
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    },
    // Leaderboard Box
    leaderboardBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: isMobile ? 20 : 40,
        borderRadius: 16,
        border: '3px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        height: '100%',
    },
    leaderboardHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '12px 12px' : '18px 16px',
        borderBottom: '3px solid rgba(78, 205, 196, 0.6)',
        marginBottom: 16,
        minHeight: isMobile ? 44 : 60,
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderRadius: 8,
    },
    headerRank: {
        color: '#4ECDC4',
        fontSize: isMobile ? 14 : 18,
        fontWeight: 'bold',
        width: isMobile ? 50 : 80,
        letterSpacing: 1,
    },
    headerName: {
        color: '#4ECDC4',
        fontSize: isMobile ? 14 : 18,
        fontWeight: 'bold',
        flex: 1,
        letterSpacing: 1,
    },
    headerStat: {
        color: '#4ECDC4',
        fontSize: isMobile ? 14 : 18,
        fontWeight: 'bold',
        width: isMobile ? 60 : 90,
        textAlign: 'right',
        letterSpacing: 1,
    },
    leaderboardRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '12px 12px' : '18px 16px',
        borderRadius: 8,
        marginBottom: 10,
        minHeight: isMobile ? 48 : 64,
        transition: 'all 0.2s',
    },
    rankText: {
        fontSize: isMobile ? 16 : 22,
        fontWeight: 'bold',
        width: isMobile ? 50 : 80,
    },
    playerNameText: {
        fontSize: isMobile ? 16 : 20,
        flex: 1,
        fontWeight: '500',
    },
    scoreText: {
        color: '#00FF00',
        fontSize: isMobile ? 16 : 20,
        fontWeight: 'bold',
        width: isMobile ? 60 : 90,
        textAlign: 'right',
    },
    killsText: {
        color: '#FF6B6B',
        fontSize: isMobile ? 16 : 20,
        fontWeight: 'bold',
        width: isMobile ? 60 : 90,
        textAlign: 'right',
    },
    levelText: {
        color: '#4ECDC4',
        fontSize: isMobile ? 16 : 20,
        fontWeight: 'bold',
        width: isMobile ? 60 : 90,
        textAlign: 'right',
    },
    // Close Button
    closeButton: {
        backgroundColor: '#4ECDC4',
        padding: isMobile ? '16px 32px' : '20px 60px',
        borderRadius: 12,
        cursor: 'pointer',
        border: '3px solid rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(78, 205, 196, 0.4)',
        margin: '0 auto',
        maxWidth: isMobile ? '100%' : 400,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: isMobile ? 18 : 24,
        fontWeight: 'bold',
        letterSpacing: 2,
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },
};
