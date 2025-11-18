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
 * Victory screen - ultra compact, no overflow
 */
export const VictoryScreen = React.memo((props: VictoryScreenProps): React.ReactElement | null => {
    const { winnerName, isTimeout, players, playerId, onClose } = props;

    if (!winnerName && !isTimeout) {
        return null;
    }

    const currentPlayer = players.find(p => p.playerId === playerId);
    const isWinner = currentPlayer?.name === winnerName;

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
            <Container style={styles.container}>
                {/* Title */}
                <Text style={{
                    ...styles.title,
                    color: isTimeout ? '#FFA500' : (isWinner ? '#00FF00' : '#FF4444'),
                }}>
                    {isTimeout ? 'TIME UP' : (isWinner ? 'WIN' : 'LOSE')}
                </Text>

                {winnerName && (
                    <Text style={styles.subtitle}>
                        {isTimeout ? 'Match Timeout' : `${winnerName.substring(0, 15)} Wins`}
                    </Text>
                )}

                <Space size="xs" />

                {/* Content */}
                <View style={styles.content}>
                    {/* Stats */}
                    {currentPlayer && (
                        <View style={styles.col}>
                            <View style={styles.box}>
                                <Text style={styles.boxTitle}>YOUR STATS</Text>
                                <View style={styles.grid}>
                                    <View style={styles.cell}>
                                        <Text style={styles.cellLabel}>Score</Text>
                                        <Text style={styles.cellValue}>{currentPlayer.score || 0}</Text>
                                    </View>
                                    <View style={styles.cell}>
                                        <Text style={styles.cellLabel}>Lvl</Text>
                                        <Text style={styles.cellValue}>{currentPlayer.level || 1}</Text>
                                    </View>
                                    <View style={styles.cell}>
                                        <Text style={styles.cellLabel}>Kills</Text>
                                        <Text style={styles.cellValueGreen}>{currentPlayer.kills || 0}</Text>
                                    </View>
                                    <View style={styles.cell}>
                                        <Text style={styles.cellLabel}>Death</Text>
                                        <Text style={styles.cellValueRed}>{currentPlayer.deaths || 0}</Text>
                                    </View>
                                    <View style={styles.cell}>
                                        <Text style={styles.cellLabel}>K/D</Text>
                                        <Text style={styles.cellValue}>
                                            {currentPlayer.deaths ? ((currentPlayer.kills || 0) / currentPlayer.deaths).toFixed(1) : (currentPlayer.kills || 0)}
                                        </Text>
                                    </View>
                                    <View style={styles.cell}>
                                        <Text style={styles.cellLabel}>Stk</Text>
                                        <Text style={styles.cellValue}>{currentPlayer.highestKillStreak || 0}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Leaderboard */}
                    <View style={styles.col}>
                        <View style={styles.box}>
                            <Text style={styles.boxTitle}>TOP PLAYERS</Text>
                            <View style={styles.table}>
                                {/* Header */}
                                <View style={styles.tr}>
                                    <Text style={styles.thRank}>#</Text>
                                    <Text style={styles.thName}>Name</Text>
                                    <Text style={styles.thNum}>Pts</Text>
                                    <Text style={styles.thNum}>K</Text>
                                </View>
                                {/* Rows */}
                                {topPlayers.map((player, i) => {
                                    const me = player.playerId === playerId;
                                    const name = me ? 'YOU' : player.name.substring(0, 10);
                                    return (
                                        <View key={player.playerId} style={{
                                            ...styles.tr,
                                            backgroundColor: me ? 'rgba(78, 205, 196, 0.15)' : 'transparent',
                                        }}>
                                            <Text style={styles.tdRank}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                            </Text>
                                            <Text style={{
                                                ...styles.tdName,
                                                color: me ? '#4ECDC4' : '#FFF',
                                            }}>
                                                {name}
                                            </Text>
                                            <Text style={styles.tdNum}>{player.score || 0}</Text>
                                            <Text style={styles.tdNum}>{player.kills || 0}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </View>

                <Space size="xs" />

                {/* Button */}
                <View style={styles.btn} onClick={onClose}>
                    <Text style={styles.btnText}>RETURN TO LOBBY</Text>
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
    container: {
        backgroundColor: 'rgba(20, 15, 25, 0.98)',
        border: '2px solid rgba(78, 205, 196, 0.5)',
        borderRadius: 8,
        padding: isMobile ? 12 : 16,
        width: isMobile ? '95%' : '700px',
        maxWidth: '95%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
    },
    title: {
        fontSize: isMobile ? 20 : 28,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: isMobile ? 12 : 14,
        color: '#FFD700',
        textAlign: 'center',
        fontWeight: '600',
        marginTop: 2,
    },
    content: {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
    },
    col: {
        flex: 1,
        minWidth: 0,
    },
    box: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 6,
        padding: 10,
    },
    boxTitle: {
        fontSize: 12,
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    // Stats grid
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 6,
    },
    cell: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
    },
    cellLabel: {
        fontSize: 9,
        color: '#AAA',
        marginBottom: 2,
    },
    cellValue: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: 'bold',
    },
    cellValueGreen: {
        fontSize: 14,
        color: '#00FF00',
        fontWeight: 'bold',
    },
    cellValueRed: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    // Table
    table: {
        width: '100%',
    },
    tr: {
        display: 'flex',
        flexDirection: 'row',
        padding: '3px 2px',
        marginBottom: 1,
        borderRadius: 3,
        alignItems: 'center',
    },
    thRank: {
        width: 26,
        fontSize: 9,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    thName: {
        flex: 1,
        fontSize: 9,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    thNum: {
        width: 35,
        fontSize: 9,
        color: '#4ECDC4',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    tdRank: {
        width: 26,
        fontSize: 11,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    tdName: {
        flex: 1,
        fontSize: 11,
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    tdNum: {
        width: 35,
        fontSize: 11,
        color: '#00FF00',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    btn: {
        backgroundColor: '#4ECDC4',
        padding: '10px 24px',
        borderRadius: 6,
        cursor: 'pointer',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        margin: '0 auto',
        maxWidth: 220,
        transition: 'all 0.2s',
    },
    btnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
};
