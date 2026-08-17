import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../lib/hooks';

/**
 * DecodeText
 *
 * Adapted from Kokonut UI's `matrix-text` (MIT, kokonutui.com), rebuilt for
 * this design system:
 *   - binary 0/1 charset swapped for a code-punctuation set, because the page
 *     is about source code, not The Matrix
 *   - green-on-black styling replaced with our ember/mute tokens
 *   - single rAF-driven timeline instead of one setTimeout per letter, so the
 *     work is cancellable and does not leak timers on unmount
 *   - width is reserved up front, so resolving text cannot cause layout shift
 *   - a real text node stays in the accessibility tree; the scramble layer is
 *     aria-hidden
 *
 * Motivation (motion must be motivated): this communicates STATE TRANSITION.
 * It is used only where something is literally resolving from noise into
 * meaning, never as decoration.
 */
interface Props {
  text: string;
  className?: string;
  /** ms between each letter locking in */
  stagger?: number;
  /** ms a single letter spends scrambled before it resolves */
  dwell?: number;
  delay?: number;
  as?: 'span' | 'h2' | 'h3' | 'p';
  noiseClassName?: string;
}

const CHARSET = '{}[]()<>/\\|;:=+-*&^%$#@!?~';

/** Stable component identities. Built once, never during render. */
const MOTION_TAGS = {
  span: motion.span,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
} as const;

export default function DecodeText({
  text,
  className,
  stagger = 42,
  dwell = 260,
  delay = 0,
  as = 'span',
  noiseClassName = 'text-mute/60',
}: Props) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState<string[]>(() => text.split(''));
  const [locked, setLocked] = useState<boolean[]>(() => text.split('').map(() => true));
  const [started, setStarted] = useState(false);
  const hostRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Observe entry once, then run the decode.
  useEffect(() => {
    if (reduced) return;
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const run = useCallback(() => {
    const chars = text.split('');
    const start = performance.now() + delay;
    // Each index resolves at start + i*stagger + dwell.
    setLocked(chars.map(() => false));

    const tick = (now: number) => {
      if (now < start) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const t = now - start;
      let allDone = true;
      const nextChars: string[] = [];
      const nextLocked: boolean[] = [];

      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === ' ') {
          nextChars.push(' ');
          nextLocked.push(true);
          continue;
        }
        const resolveAt = i * stagger + dwell;
        if (t >= resolveAt) {
          nextChars.push(c);
          nextLocked.push(true);
        } else if (t >= i * stagger) {
          nextChars.push(CHARSET[(Math.random() * CHARSET.length) | 0]);
          nextLocked.push(false);
          allDone = false;
        } else {
          nextChars.push(c);
          nextLocked.push(true);
          allDone = false;
        }
      }

      setDisplay(nextChars);
      setLocked(nextLocked);

      if (!allDone) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [text, stagger, dwell, delay]);

  useEffect(() => {
    if (!started || reduced) return;
    run();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [started, reduced, run]);

  // NOTE: do NOT do `const Tag = motion[as]` here. Reading a component off the
  // `motion` proxy during render creates a brand-new component identity on
  // every render, which remounts the subtree and trips "Invalid hook call".
  // Resolve against a stable, module-level map instead.
  const Tag = MOTION_TAGS[as];

  return (
    <Tag
      ref={hostRef as never}
      className={cn('inline-block', className)}
      // Reserve the final width so resolving cannot shift layout.
      style={{ minWidth: `${text.length}ch` }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-block whitespace-pre">
        {display.map((c, i) => (
          <span key={i} className={locked[i] ? undefined : noiseClassName}>
            {c}
          </span>
        ))}
      </span>
    </Tag>
  );
}
