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
 * Minimal, compact design with no text overflow
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
    const topPlayers = sortedPlayers.slice(0, 8);

    return (
        <View style={styles.overlay}>
            <Container style={styles.victoryContainer}>
                {/* Title */}
                <Text style={{
                    ...styles.titleText,
                    color: isTimeout ? '#FFA500' : (isWinner ? '#00FF00' : '#FF4444'),
                }}>
                    {isTimeout ? 'TIME UP' : (isWinner ? 'VICTORY' : 'DEFEAT')}
                </Text>

                {winnerName && (
                    <Text style={styles.subtitleText}>
                        {isTimeout ? 'Timeout' : `${winnerName} Wins`}
                    </Text>
                )}

                <Space size="s" />

                {/* Two Column Layout */}
                <View style={isMobile ? styles.mobileLayout : styles.desktopLayout}>
                    {/* Your Stats */}
                    {currentPlayer && (
                        <View style={styles.column}>
                            <View style={styles.box}>
                                <Text style={styles.boxTitle}>YOUR STATS</Text>

                                <View style={styles.statsGrid}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Score</Text>
                                        <Text style={styles.statValue}>{currentPlayer.score || 0}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Level</Text>
                                        <Text style={styles.statValue}>{currentPlayer.level || 1}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Kills</Text>
                                        <Text style={styles.statValueGreen}>{currentPlayer.kills || 0}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Deaths</Text>
                                        <Text style={styles.statValueRed}>{currentPlayer.deaths || 0}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>K/D</Text>
                                        <Text style={styles.statValue}>
                                            {currentPlayer.deaths ? ((currentPlayer.kills || 0) / currentPlayer.deaths).toFixed(1) : (currentPlayer.kills || 0)}
                                        </Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Streak</Text>
                                        <Text style={styles.statValue}>{currentPlayer.highestKillStreak || 0}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {isMobile && <Space size="s" />}

                    {/* Leaderboard */}
                    <View style={styles.column}>
                        <View style={styles.box}>
                            <Text style={styles.boxTitle}>LEADERBOARD</Text>

                            {/* Compact Table */}
                            <View style={styles.table}>
                                {/* Header */}
                                <View style={styles.tableRow}>
                                    <Text style={styles.thRank}>#</Text>
                                    <Text style={styles.thName}>Player</Text>
                                    <Text style={styles.thStat}>Pts</Text>
                                    <Text style={styles.thStat}>K</Text>
                                </View>

                                {/* Rows */}
                                {topPlayers.map((player, index) => {
                                    const isCurrentPlayer = player.playerId === playerId;
                                    const displayName = isCurrentPlayer ? 'YOU' : (player.name.length > 12 ? player.name.substring(0, 12) + '...' : player.name);

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
                                                {displayName}
                                            </Text>
                                            <Text style={styles.tdScore}>{player.score || 0}</Text>
                                            <Text style={styles.tdKills}>{player.kills || 0}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </View>

                <Space size="s" />

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
        borderRadius: 10,
        padding: isMobile ? 16 : 24,
        maxWidth: isMobile ? '95%' : 800,
        width: isMobile ? '95%' : '800px',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
    },
    titleText: {
        fontSize: isMobile ? 24 : 36,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 4,
    },
    subtitleText: {
        fontSize: isMobile ? 14 : 16,
        color: '#FFD700',
        textAlign: 'center',
        fontWeight: '600',
    },
    // Layout
    desktopLayout: {
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
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
        borderRadius: 6,
        padding: isMobile ? 10 : 12,
    },
    boxTitle: {
        fontSize: isMobile ? 12 : 14,
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 1,
    },
    // Stats Grid (2x3)
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
    },
    statLabel: {
        fontSize: isMobile ? 10 : 11,
        color: '#AAA',
        marginBottom: 2,
    },
    statValue: {
        fontSize: isMobile ? 14 : 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    statValueGreen: {
        fontSize: isMobile ? 14 : 16,
        color: '#00FF00',
        fontWeight: 'bold',
    },
    statValueRed: {
        fontSize: isMobile ? 14 : 16,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    // Table
    table: {
        width: '100%',
    },
    tableRow: {
        display: 'flex',
        flexDirection: 'row',
        padding: '4px 2px',
        marginBottom: 2,
        borderRadius: 3,
        alignItems: 'center',
    },
    thRank: {
        width: isMobile ? 28 : 32,
        fontSize: isMobile ? 10 : 11,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    thName: {
        flex: 1,
        fontSize: isMobile ? 10 : 11,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    thStat: {
        width: isMobile ? 38 : 42,
        fontSize: isMobile ? 10 : 11,
        color: '#4ECDC4',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    tdRank: {
        width: isMobile ? 28 : 32,
        fontSize: isMobile ? 12 : 13,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    tdName: {
        flex: 1,
        fontSize: isMobile ? 12 : 13,
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    tdScore: {
        width: isMobile ? 38 : 42,
        fontSize: isMobile ? 12 : 13,
        color: '#00FF00',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    tdKills: {
        width: isMobile ? 38 : 42,
        fontSize: isMobile ? 12 : 13,
        color: '#FF6B6B',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    // Close Button
    closeButton: {
        backgroundColor: '#4ECDC4',
        padding: isMobile ? '10px 20px' : '12px 30px',
        borderRadius: 6,
        cursor: 'pointer',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        margin: '0 auto',
        maxWidth: 250,
        transition: 'all 0.2s',
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: isMobile ? 13 : 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
};
