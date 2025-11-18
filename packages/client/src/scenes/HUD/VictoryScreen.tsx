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
 * Minimal, compact design for clear visibility
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
            return scoreB - scoreA;
        }
        return (b.kills || 0) - (a.kills || 0);
    });
    const topPlayers = sortedPlayers.slice(0, 10);

    return (
        <View style={styles.overlay}>
            <Container style={styles.victoryContainer}>
                {/* Title */}
                <Text style={{
                    ...styles.titleText,
                    color: isTimeout ? '#FFA500' : (isWinner ? '#00FF00' : '#FF4444'),
                }}>
                    {isTimeout ? 'TIME\'S UP' : (isWinner ? 'VICTORY' : 'DEFEAT')}
                </Text>

                {winnerName && (
                    <Text style={styles.subtitleText}>
                        {isTimeout ? 'Match Timeout' : `${winnerName} Wins!`}
                    </Text>
                )}

                <Space size="m" />

                {/* Desktop: Two Column | Mobile: Single Column */}
                <View style={isMobile ? styles.mobileLayout : styles.desktopLayout}>
                    {/* Your Stats */}
                    {currentPlayer && (
                        <View style={styles.column}>
                            <View style={styles.box}>
                                <Text style={styles.boxTitle}>YOUR STATS</Text>

                                <View style={styles.statsGrid}>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.label}>Score</Text>
                                        <Text style={styles.value}>{currentPlayer.score || 0}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.label}>Level</Text>
                                        <Text style={styles.value}>{currentPlayer.level || 1}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.label}>Kills</Text>
                                        <Text style={styles.valueGreen}>{currentPlayer.kills || 0}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.label}>Deaths</Text>
                                        <Text style={styles.valueRed}>{currentPlayer.deaths || 0}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.label}>K/D</Text>
                                        <Text style={styles.value}>
                                            {currentPlayer.deaths ? ((currentPlayer.kills || 0) / currentPlayer.deaths).toFixed(2) : (currentPlayer.kills || 0)}
                                        </Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.label}>Streak</Text>
                                        <Text style={styles.value}>{currentPlayer.highestKillStreak || 0}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {isMobile && <Space size="s" />}

                    {/* Leaderboard */}
                    <View style={styles.column}>
                        <View style={styles.box}>
                            <Text style={styles.boxTitle}>TOP PLAYERS</Text>

                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={styles.thRank}>#</Text>
                                <Text style={styles.thName}>Name</Text>
                                <Text style={styles.thStat}>Score</Text>
                                <Text style={styles.thStat}>Kills</Text>
                            </View>

                            {/* Player Rows */}
                            {topPlayers.map((player, index) => {
                                const isCurrentPlayer = player.playerId === playerId;
                                return (
                                    <View key={player.playerId} style={{
                                        ...styles.tableRow,
                                        backgroundColor: isCurrentPlayer ? 'rgba(78, 205, 196, 0.2)' : 'transparent',
                                    }}>
                                        <Text style={styles.tdRank}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                        </Text>
                                        <Text style={{
                                            ...styles.tdName,
                                            color: isCurrentPlayer ? '#4ECDC4' : '#FFF',
                                        }}>
                                            {isCurrentPlayer ? 'YOU' : player.name}
                                        </Text>
                                        <Text style={styles.tdScore}>{player.score || 0}</Text>
                                        <Text style={styles.tdKills}>{player.kills || 0}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                <Space size="m" />

                {/* Close Button */}
                <View style={styles.closeButton} onClick={onClose}>
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        pointerEvents: 'auto',
    },
    victoryContainer: {
        backgroundColor: 'rgba(20, 15, 25, 0.98)',
        border: '2px solid rgba(78, 205, 196, 0.5)',
        borderRadius: 12,
        padding: isMobile ? 20 : 32,
        maxWidth: isMobile ? '95%' : 1000,
        width: isMobile ? '95%' : 'auto',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
    },
    titleText: {
        fontSize: isMobile ? 28 : 42,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 3,
        marginBottom: 4,
    },
    subtitleText: {
        fontSize: isMobile ? 16 : 20,
        color: '#FFD700',
        textAlign: 'center',
        fontWeight: '600',
    },
    // Layout
    desktopLayout: {
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
    },
    mobileLayout: {
        display: 'flex',
        flexDirection: 'column',
    },
    column: {
        flex: 1,
        minWidth: 0,
    },
    // Box
    box: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: isMobile ? 12 : 16,
    },
    boxTitle: {
        fontSize: isMobile ? 14 : 16,
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 1,
    },
    // Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
    },
    gridItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 6,
    },
    label: {
        fontSize: isMobile ? 11 : 13,
        color: '#AAA',
        marginBottom: 4,
    },
    value: {
        fontSize: isMobile ? 16 : 20,
        color: '#FFF',
        fontWeight: 'bold',
    },
    valueGreen: {
        fontSize: isMobile ? 16 : 20,
        color: '#00FF00',
        fontWeight: 'bold',
    },
    valueRed: {
        fontSize: isMobile ? 16 : 20,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    // Table
    tableHeader: {
        display: 'flex',
        flexDirection: 'row',
        padding: '8px 4px',
        borderBottom: '2px solid rgba(78, 205, 196, 0.5)',
        marginBottom: 8,
    },
    thRank: {
        width: isMobile ? 30 : 40,
        fontSize: isMobile ? 11 : 13,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    thName: {
        flex: 1,
        fontSize: isMobile ? 11 : 13,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    thStat: {
        width: isMobile ? 45 : 55,
        fontSize: isMobile ? 11 : 13,
        color: '#4ECDC4',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    tableRow: {
        display: 'flex',
        flexDirection: 'row',
        padding: '6px 4px',
        marginBottom: 4,
        borderRadius: 4,
    },
    tdRank: {
        width: isMobile ? 30 : 40,
        fontSize: isMobile ? 13 : 15,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    tdName: {
        flex: 1,
        fontSize: isMobile ? 13 : 15,
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    tdScore: {
        width: isMobile ? 45 : 55,
        fontSize: isMobile ? 13 : 15,
        color: '#00FF00',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    tdKills: {
        width: isMobile ? 45 : 55,
        fontSize: isMobile ? 13 : 15,
        color: '#FF6B6B',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    // Close Button
    closeButton: {
        backgroundColor: '#4ECDC4',
        padding: isMobile ? '12px 24px' : '14px 40px',
        borderRadius: 8,
        cursor: 'pointer',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        margin: '0 auto',
        maxWidth: 300,
        transition: 'all 0.2s',
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: isMobile ? 14 : 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
};
