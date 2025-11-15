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

        return (
            <Container
                style={{
                    ...styles.health,
                    ...style,
                }}
            >
                <Text style={styles.nameText}>{name}</Text>
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
                            <Text style={styles.powerupText}>{activePowerups.join(' ')}</Text>
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
    },
    powerupText: {
        color: '#00FF00',
        fontSize: isMobile ? 10 : 12,
        fontWeight: 'bold',
    },
};
