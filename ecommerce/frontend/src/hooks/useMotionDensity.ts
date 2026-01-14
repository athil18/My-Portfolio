/**
 * Ore System 2.0 — Motion Cognition Engine
 * =========================================
 * Cognitive load balancer that dynamically adjusts animation intensity
 * based on the number of visible elements and system performance.
 * 
 * This ensures 60 FPS by reducing animation complexity when many
 * elements are animating simultaneously.
 */

import { useMemo, useCallback } from 'react';

interface MotionPhysics {
    stiffness: number;
    damping: number;
    mass: number;
}

interface MotionDensityConfig {
    /** Number of elements currently animating or visible */
    elementCount: number;
    /** Base stiffness for spring animations (default: 300) */
    baseStiffness?: number;
    /** Base damping for spring animations (default: 25) */
    baseDamping?: number;
    /** Minimum density multiplier (default: 0.3) */
    minDensity?: number;
    /** Elements per density reduction step (default: 6) */
    elementsPerStep?: number;
}

/**
 * Calculates optimized spring physics based on visible element count.
 * As more elements appear, animations become snappier to reduce GPU load.
 */
export function useMotionDensity(config: MotionDensityConfig): MotionPhysics {
    const {
        elementCount,
        baseStiffness = 300,
        baseDamping = 25,
        minDensity = 0.3,
        elementsPerStep = 6,
    } = config;

    return useMemo(() => {
        // Calculate density factor (1.0 = full, 0.3 = reduced)
        const density = Math.max(minDensity, 1 - (elementCount / elementsPerStep) * 0.1);

        return {
            stiffness: baseStiffness * density,
            damping: baseDamping + ((1 - density) * 15), // Increase damping as density drops
            mass: 0.8 + ((1 - density) * 0.4), // Slightly heavier for smoother reduced motion
        };
    }, [elementCount, baseStiffness, baseDamping, minDensity, elementsPerStep]);
}

/**
 * Generates stagger delay for orchestrated animations.
 * Automatically compresses stagger as element count increases.
 */
export function useStaggerDelay(index: number, elementCount: number): number {
    return useMemo(() => {
        const baseDelay = 0.08; // 80ms base stagger
        const compressionFactor = Math.max(0.3, 1 - (elementCount / 30));
        return index * baseDelay * compressionFactor;
    }, [index, elementCount]);
}

/**
 * Animation budget system - limits concurrent animations.
 */
export function useAnimationBudget(maxConcurrent: number = 12) {
    const queue: string[] = [];

    const requestAnimation = useCallback((id: string): boolean => {
        if (queue.length >= maxConcurrent) {
            return false; // Budget exhausted
        }
        queue.push(id);
        return true;
    }, [maxConcurrent]);

    const releaseAnimation = useCallback((id: string): void => {
        const idx = queue.indexOf(id);
        if (idx > -1) queue.splice(idx, 1);
    }, []);

    return { requestAnimation, releaseAnimation, activeCcount: queue.length };
}

/**
 * Preset motion configurations for common use cases.
 */
export const MotionPresets = {
    /** Snappy micro-interaction */
    snappy: { stiffness: 500, damping: 30, mass: 0.5 },
    /** Smooth entrance animation */
    smooth: { stiffness: 200, damping: 20, mass: 1 },
    /** Bouncy playful animation */
    bouncy: { stiffness: 400, damping: 15, mass: 0.8 },
    /** Slow premium reveal */
    premium: { stiffness: 100, damping: 25, mass: 1.2 },
} as const;

export type MotionPresetName = keyof typeof MotionPresets;
