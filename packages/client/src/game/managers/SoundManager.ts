import { ExplosionSound, FireSound, FootstepSound } from '../assets/sounds';

/**
 * Manages game sounds and audio playback
 */
export class SoundManager {
    private enabled: boolean = true;
    private footstepPlaying: boolean = false;

    constructor() {
        // Initialize with sounds enabled
        this.enabled = true;
    }

    /**
     * Enable/disable all sounds
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled;

        if (!enabled) {
            this.stopAll();
        }
    }

    /**
     * Play shoot sound
     */
    playShoot() {
        if (!this.enabled) return;

        try {
            // Play short fire sound
            FireSound.stop();
            FireSound.play();

            // Auto-stop after short duration
            setTimeout(() => {
                FireSound.stop();
            }, 100);
        } catch (error) {
            console.warn('Failed to play shoot sound:', error);
        }
    }

    /**
     * Play hit/impact sound
     */
    playHit() {
        if (!this.enabled) return;

        try {
            ExplosionSound.play();
        } catch (error) {
            console.warn('Failed to play hit sound:', error);
        }
    }

    /**
     * Start footstep sound
     */
    startFootsteps() {
        if (!this.enabled || this.footstepPlaying) return;

        try {
            FootstepSound.play();
            this.footstepPlaying = true;
        } catch (error) {
            console.warn('Failed to play footstep sound:', error);
        }
    }

    /**
     * Stop footstep sound
     */
    stopFootsteps() {
        if (!this.footstepPlaying) return;

        try {
            FootstepSound.stop();
            this.footstepPlaying = false;
        } catch (error) {
            console.warn('Failed to stop footstep sound:', error);
        }
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        try {
            FireSound.stop();
            ExplosionSound.stop();
            FootstepSound.stop();
            this.footstepPlaying = false;
        } catch (error) {
            console.warn('Failed to stop sounds:', error);
        }
    }
}
