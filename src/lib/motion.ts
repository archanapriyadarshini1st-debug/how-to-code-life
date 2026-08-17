import type { Variants, Transition } from 'motion/react';

/** Single source of truth for easing + duration. Mirrors CSS tokens. */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const;

export const DUR = { fast: 0.18, base: 0.42, slow: 0.9, cine: 1.4 } as const;

export const spring: Transition = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 };
export const springSoft: Transition = { type: 'spring', stiffness: 120, damping: 22, mass: 1 };

/** Standard scroll reveal - used by every section for rhythm consistency. */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR.slow, ease: EASE, delay: (i as number) * 0.08 },
  }),
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.slow, ease: EASE } },
};

export const stagger = (amount = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: amount, delayChildren: delay } },
});

/** Line-by-line mask reveal (editorial headline treatment). */
export const maskLine: Variants = {
  hidden: { y: '110%' },
  show: (i = 0) => ({
    y: '0%',
    transition: { duration: 1.05, ease: EASE, delay: (i as number) * 0.085 },
  }),
};

export const viewportOnce = { once: true, amount: 0.35 } as const;
export const viewportSoft = { once: true, amount: 0.2 } as const;
