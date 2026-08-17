import { useEffect, useRef } from 'react';
import { createTimeline, stagger } from 'animejs';
import { useReducedMotion } from '../../lib/hooks';

/**
 * BuildSequence
 *
 * A skeletal loader shaped like the code that is about to appear, not a
 * generic spinner (taste-skill 4.5: "Skeletal loaders matching the final
 * layout's shape. Avoid generic circular spinners.").
 *
 * This is the one place anime.js earns its weight: a single declarative
 * timeline sequences three different properties across a stagger of N bars
 * plus a sweeping highlight, with one shared clock. Expressing the same
 * choreography in Framer variants would need nested orchestration and a
 * separate loop for the sweep.
 *
 * Motivation: FEEDBACK. It tells you the compiler is working and roughly how
 * much output to expect.
 */
export default function BuildSequence({ lines = 7 }: { lines?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const bars = root.current.querySelectorAll<HTMLElement>('[data-bar]');
    const sweep = root.current.querySelector<HTMLElement>('[data-sweep]');
    if (!bars.length) return;

    const tl = createTimeline({ defaults: { ease: 'inOut(2)' }, loop: true });

    tl.add(bars, {
      scaleX: [0, 1],
      opacity: [0, 1],
      duration: 520,
      delay: stagger(70),
    });

    if (sweep) {
      tl.add(sweep, { translateX: ['-30%', '130%'], opacity: [0, 0.5, 0], duration: 900 }, 260);
    }

    tl.add(bars, { opacity: 0.25, duration: 400, delay: stagger(28) }, '+=220');

    return () => {
      tl.pause();
      tl.revert();
    };
  }, [reduced, lines]);

  // Widths mimic real code: indented, uneven, a blank line in the middle.
  const widths = ['62%', '84%', '46%', '72%', '38%', '90%', '55%'];

  return (
    <div
      ref={root}
      className="relative w-full max-w-sm overflow-hidden px-2"
      role="status"
      aria-label="Compiling your program"
    >
      <div className="flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            data-bar
            className="h-2 origin-left rounded-full bg-ember/30"
            style={{ width: widths[i % widths.length], marginLeft: i % 3 === 1 ? '1.5rem' : 0 }}
          />
        ))}
      </div>
      <span
        data-sweep
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-ember/25 to-transparent"
      />
      <span className="sr-only">Compiling</span>
    </div>
  );
}
