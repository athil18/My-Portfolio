/**
 * Ore System 2.0 — OreMotion Wrapper Component
 * =============================================
 * Pre-configured Framer Motion wrapper with physics-based stagger,
 * viewport awareness, and reduced motion support.
 */

import { type ReactNode, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants, HTMLMotionProps } from 'framer-motion';
import { useMotionDensity, MotionPresets } from '../../hooks/useMotionDensity';
import type { MotionPresetName } from '../../hooks/useMotionDensity';

// ==================== VARIANT LIBRARY ====================

const createVariants = (physics: { stiffness: number; damping: number; mass: number }): Record<string, Variants> => ({
    fadeIn: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { type: 'spring', ...physics }
        },
    },
    slideUp: {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', ...physics }
        },
    },
    slideDown: {
        hidden: { opacity: 0, y: -24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', ...physics }
        },
    },
    slideLeft: {
        hidden: { opacity: 0, x: 24 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', ...physics }
        },
    },
    slideRight: {
        hidden: { opacity: 0, x: -24 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', ...physics }
        },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', ...physics }
        },
    },
    scaleUp: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', ...physics }
        },
    },
});

export type OreVariant = 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'scaleUp';

// ==================== ORE MOTION COMPONENT ====================

interface OreMotionProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate'> {
    children: ReactNode;
    /** Animation variant to use */
    variant?: OreVariant;
    /** Delay before animation starts (seconds) */
    delay?: number;
    /** Use viewport-triggered animation */
    viewportTrigger?: boolean;
    /** Viewport trigger margin */
    viewportMargin?: string;
    /** Motion preset name or custom physics */
    preset?: MotionPresetName;
    /** Number of sibling elements (for density calculation) */
    siblingCount?: number;
    /** Additional class names */
    className?: string;
}

export function OreMotion({
    children,
    variant = 'fadeIn',
    delay = 0,
    viewportTrigger = false,
    viewportMargin = '-50px',
    preset = 'smooth',
    siblingCount = 1,
    className = '',
    ...motionProps
}: OreMotionProps) {
    const shouldReduceMotion = useReducedMotion();

    // Get adaptive physics based on element density
    const adaptivePhysics = useMotionDensity({
        elementCount: siblingCount,
        ...MotionPresets[preset]
    });

    // Generate variants with current physics
    const variants = useMemo(() => createVariants(adaptivePhysics), [adaptivePhysics]);

    // Skip animation if user prefers reduced motion
    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            variants={variants[variant]}
            initial="hidden"
            animate={viewportTrigger ? undefined : 'visible'}
            whileInView={viewportTrigger ? 'visible' : undefined}
            viewport={viewportTrigger ? { once: true, margin: viewportMargin } : undefined}
            transition={{ delay }}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}

// ==================== ORE STAGGER CONTAINER ====================

interface OreStaggerProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate'> {
    children: ReactNode;
    /** Stagger delay between children (seconds) */
    staggerDelay?: number;
    /** Delay before first child animates */
    initialDelay?: number;
    /** Use viewport-triggered animation */
    viewportTrigger?: boolean;
    /** Viewport trigger margin */
    viewportMargin?: string;
    className?: string;
}

const staggerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (custom: { staggerDelay: number; initialDelay: number }) => ({
        opacity: 1,
        transition: {
            delayChildren: custom.initialDelay,
            staggerChildren: custom.staggerDelay,
        },
    }),
};

export function OreStagger({
    children,
    staggerDelay = 0.08,
    initialDelay = 0.1,
    viewportTrigger = false,
    viewportMargin = '-50px',
    className = '',
    ...motionProps
}: OreStaggerProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            variants={staggerContainerVariants}
            initial="hidden"
            animate={viewportTrigger ? undefined : 'visible'}
            whileInView={viewportTrigger ? 'visible' : undefined}
            viewport={viewportTrigger ? { once: true, margin: viewportMargin } : undefined}
            custom={{ staggerDelay, initialDelay }}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}

// ==================== ORE STAGGER ITEM ====================

interface OreStaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
    children: ReactNode;
    variant?: OreVariant;
    className?: string;
}

const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
};

export function OreStaggerItem({
    children,
    variant = 'slideUp',
    className = '',
    ...motionProps
}: OreStaggerItemProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            variants={staggerItemVariants}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}

// ==================== EXPORTS ====================

export default OreMotion;
