import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from '../../lib/hooks';

/**
 * ScrambleText — characters resolve out of noise, like a value being computed.
 *
 * Idea borrowed from React Bits' "Decrypted Text", rebuilt for this codebase:
 *  - single rAF loop instead of a setInterval per instance
 *  - resolves left→right so it reads as *compiling*, not glitching
 *  - scrambles from a code-flavoured charset, not random unicode
 *  - width is reserved up-front, so a resolving line can never shift layout
 *  - reduced-motion renders the final string immediately, no animation
 *
 * We deliberately keep the noise dim and the resolved text full-contrast, so
 * the eye tracks the resolution front rather than the churn.
 */

const CHARS = '{}[]()<>/\\|=+-*&^%$#@!?;:._~01';

type Trigger = 'view' | 'hover';

interface Props {
  text: string;
  /** ms between animation steps */
  speed?: number;
  /** how many noise frames each character passes through before locking */
  churn?: number;
  trigger?: Trigger;
  className?: string;
  /** class applied to not-yet-resolved characters */
  noiseClassName?: string;
  delay?: number;
  as?: 'span' | 'p' | 'div';
}

export default function ScrambleText({
  text,
  speed = 26,
  churn = 5,
  trigger = 'view',
  className = '',
  noiseClassName = 'text-mute/45',
  delay = 0,
  as: Tag = 'span',
}: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);
  const [resolved, setResolved] = useState(reduced ? text.length : 0);
  const [noise, setNoise] = useState('');
  const running = useRef(false);

  const run = useCallback(() => {
    if (reduced || running.current) return;
    running.current = true;

    const start = performance.now() + delay;
    let last = 0;

    const tick = (now: number) => {
      if (now < start) { rafRef.current = requestAnimationFrame(tick); return; }
      if (now - last >= speed) {
        last = now;
        const elapsed = Math.floor((now - start) / speed);
        const done = Math.min(text.length, Math.floor(elapsed / churn));
        setResolved(done);

        if (done < text.length) {
          // only generate noise for the unresolved tail
          let s = '';
          for (let i = done; i < text.length; i++) {
            s += text[i] === ' ' ? ' ' : CHARS[(Math.random() * CHARS.length) | 0];
          }
          setNoise(s);
        } else {
          setNoise('');
          running.current = false;
          return; // stop the loop — no idle rAF left spinning
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [text, speed, churn, delay, reduced]);

  useEffect(() => {
    if (reduced) { setResolved(text.length); return; }
    if (trigger !== 'view') return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { run(); obs.disconnect(); } },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [run, trigger, reduced, text.length]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const onEnter = () => {
    if (trigger !== 'hover' || reduced) return;
    running.current = false;
    setResolved(0);
    run();
  };

  return (
    <Tag
      ref={ref as never}
      className={`inline-block ${className}`}
      onMouseEnter={onEnter}
      // Reserve the final width so resolving text never reflows its neighbours.
      style={{ minWidth: `${text.length}ch` }}
    >
      {/* Accessible copy is always the real text, whatever the pixels show. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        <span>{text.slice(0, resolved)}</span>
        <span className={noiseClassName}>{noise}</span>
      </span>
    </Tag>
  );
}
