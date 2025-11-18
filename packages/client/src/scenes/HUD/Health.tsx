import React, { CSSProperties } from 'react';
import { Space, Text, View } from '../../components';

import { heartEmptyImage, heartFullImage } from '../../images';
import { Container } from './';
import { isMobile } from 'react-device-detect';

const HEART_SIZE = isMobile ? 24 : 36;

interface HealthProps {
    name: string;
    lives: number;
    maxLives: number;
    style?: CSSProperties;
    level?: number;
    score?: number;
    killStreak?: number;
    xp?: number;
    hasSpeedBoost?: boolean;
    hasShield?: boolean;
    hasRapidFire?: boolean;
    isInvisible?: boolean;
    hasDoubleDamage?: boolean;
}

/**
 * Render the health of the player.
 */
export const Health = React.memo((props: HealthProps): React.ReactElement => {
    const {
        name,
        lives,
        maxLives = 3,
        style,
        level = 1,
        score = 0,
        killStreak = 0,
        xp = 0,
        hasSpeedBoost,
        hasShield,
        hasRapidFire,
        isInvisible,
        hasDoubleDamage,
    } = props;

    // Debug logging
    console.log('[Health] Stats:', { level, score, killStreak, xp, name });

        // Create list of hearts
        const hearts = [];
        for (let i = 0; i < maxLives; i++) {
            const isFull = i < lives;

            hearts.push(
                <img
                    key={i}
                    src={isFull ? heartFullImage : heartEmptyImage}
                    alt={isFull ? 'full-heart' : 'empty-heart'}
                    width={HEART_SIZE}
                    height={HEART_SIZE}
                />,
            );
        }

        // Active powerups
        const activePowerups = [];
        if (hasSpeedBoost) activePowerups.push('⚡ Speed');
        if (hasShield) activePowerups.push('🛡️ Shield');
        if (hasRapidFire) activePowerups.push('🔥 Rapid');
        if (isInvisible) activePowerups.push('👻 Invisible');
        if (hasDoubleDamage) activePowerups.push('💥 2x Dmg');

        // Calculate health percentage
        const healthPercent = (lives / maxLives) * 100;

        // Health bar color based on percentage
        let healthBarColor = '#00FF00'; // Green
        if (healthPercent <= 33) {
            healthBarColor = '#FF0000'; // Red
        } else if (healthPercent <= 66) {
            healthBarColor = '#FFA500'; // Orange
        }

        return (
            <Container
                style={{
                    ...styles.health,
                    ...style,
                }}
            >
                <Text style={styles.nameText}>{name}</Text>
                <Space size="xxs" />

                {/* Health Bar */}
                <View style={styles.healthBarContainer}>
                    <View style={{
                        ...styles.healthBarFill,
                        width: `${healthPercent}%`,
                        backgroundColor: healthBarColor,
                    }} />
                    <Text style={styles.healthBarText}>{lives} / {maxLives}</Text>
                </View>

                <Space size="xxs" />
                <View style={styles.hearts}>{hearts}</View>
                <Space size="xxs" />
                <View style={styles.statsContainer}>
                    <Text style={styles.statText}>Lvl {level} | Score: {score} | Streak: {killStreak > 0 ? `🔥${killStreak}` : killStreak}</Text>
                </View>
                {activePowerups.length > 0 && (
                    <>
                        <Space size="xxs" />
                        <View style={styles.powerupsContainer}>
                            <Text style={styles.powerupText}>{activePowerups.join(' | ')}</Text>
                        </View>
                    </>
                )}
            </Container>
        );
    },
);

const styles: { [key: string]: CSSProperties } = {
    health: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    nameText: {
        color: 'white',
        fontSize: isMobile ? 14 : 16,
    },
    healthBarContainer: {
        position: 'relative',
        width: isMobile ? 120 : 200,
        height: isMobile ? 16 : 24,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    healthBarFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        transition: 'width 0.3s ease, background-color 0.3s ease',
    },
    healthBarText: {
        position: 'relative',
        color: 'white',
        fontSize: isMobile ? 10 : 12,
        fontWeight: 'bold',
        zIndex: 1,
        textShadow: '0 0 2px black',
    },
    hearts: {
        display: 'flex',
        alignItems: 'center',
    },
    statsContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
    },
    statText: {
        color: '#FFD700',
        fontSize: isMobile ? 12 : 14,
        fontWeight: 'bold',
    },
    powerupsContainer: {
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        padding: 4,
        borderRadius: 4,
        border: '1px solid rgba(0, 255, 0, 0.4)',
    },
    powerupText: {
        color: '#00FF00',
        fontSize: isMobile ? 10 : 12,
        fontWeight: 'bold',
    },
};
