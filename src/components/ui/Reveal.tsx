import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE } from '../../lib/motion';
import { useReducedMotion } from '../../lib/hooks';

/**
 * Line-mask headline reveal.
 *
 * NOTE: the animated span starts translated 112% down inside an
 * overflow-hidden parent, so it is FULLY CLIPPED. IntersectionObserver
 * accounts for ancestor clipping, which means observing the span itself
 * would report ratio 0 forever and the reveal would never fire.
 * So the observer lives on the unclipped container and drives the
 * children through variants.
 */
export function MaskLines({
  lines, as = 'h2', className = '', lineClassName = '', delay = 0, id,
}: {
  lines: string[];
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string; lineClassName?: string; delay?: number; id?: string;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {lines.map((ln, i) => (
        <span key={i} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
          <motion.span
            className={`block ${lineClassName}`}
            variants={{
              hidden: reduced ? { opacity: 0 } : { y: '112%' },
              show: reduced
                ? { opacity: 1, transition: { duration: 0.3, delay: delay + i * 0.04 } }
                : { y: '0%', transition: { duration: 1.05, ease: EASE, delay: delay + i * 0.085 } },
            }}
          >
            {ln}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/* ── Word-by-word opacity wipe for body copy ── */
export function WordFade({ text, className = '', stagger = 0.022 }: { text: string; className?: string; stagger?: number }) {
  const reduced = useReducedMotion();
  const words = text.split(' ');
  if (reduced) return <p className={className}>{text}</p>;
  return (
    <motion.p className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0.12, y: 6 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: i * stagger } },
          }}
        >
          {w}{i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.p>
  );
}

/* ── Generic scroll-in wrapper ── */
export function Reveal({
  children, delay = 0, y = 26, className = '', amount = 0.25,
}: { children: ReactNode; delay?: number; y?: number; className?: string; amount?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0.35 : 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
