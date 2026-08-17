import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from './ui/Button';
import { MaskLines, Reveal } from './ui/Reveal';
import { useReducedMotion } from '../lib/hooks';
import { useSmoothScroll } from '../lib/SmoothScroll';

const LINES = [
  'Perfect code doesn’t exist. Neither does a perfect life.',
  'Every failure leaves a stack trace.',
  'Commit often.',
  'Ship something.',
];

export default function FinalCTA() {
  const reduced = useReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 0.7], reduced ? [1, 1] : [0.94, 1]);

  return (
    <section
      id="final"
      ref={ref}
      aria-labelledby="final-t"
      className="relative w-full overflow-x-clip bg-char py-section text-paper grain"
    >
      {/* marquee of aphorisms — the one place repetition is the point */}
      <div className="relative mb-24 w-full max-w-full overflow-x-clip border-y border-white/10 py-5">
        <motion.div
          className="flex w-max gap-12 whitespace-nowrap will-change-transform"
          animate={reduced ? {} : { x: ['0%', '-50%'] }}
          transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}
        >
          {[...LINES, ...LINES, ...LINES, ...LINES].map((l, i) => (
            <span key={i} className="flex items-center gap-12 font-mono text-[0.76rem] uppercase tracking-[0.14em] text-paper/35">
              {l}
              <span aria-hidden className="text-ember">/</span>
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div style={{ scale }} className="shell relative text-center">
        <MaskLines
          as="h2"
          id="final-t"
          lines={['LIFE DOESN’T', 'COME WITH', 'SOURCE CODE.']}
          className="font-sans text-h1 font-medium uppercase leading-[0.9] text-paper"
        />

        <Reveal delay={0.25}>
          <p className="mx-auto mt-12 font-display text-[clamp(1.6rem,4vw,3rem)] italic text-ember">
            So write your own.
          </p>
        </Reveal>

        <Reveal delay={0.35}>
          <div className="mt-14 flex flex-col items-center gap-6">
            <Button variant="ember" size="lg" onClick={() => scrollTo('#playground')}>
              START WRITING
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Button>
            <button
              onClick={() => scrollTo('#top')}
              className="font-mono text-micro uppercase tracking-[0.14em] text-paper/40 link-line"
            >
              ↑ back to the top of the program
            </button>
          </div>
        </Reveal>

        {/* closing terminal line */}
        <Reveal delay={0.45}>
          <p className="mx-auto mt-20 max-w-md font-mono text-[0.72rem] leading-relaxed text-paper/30">
            <span className="text-ember">$</span> ./life --no-guarantees --run-anyway
            <br />
            <span className="inline-block pt-1">process started at {new Date().getFullYear()}. exit code: unknown.</span>
            <span aria-hidden className="ml-1 inline-block h-3 w-1.5 translate-y-[1px] bg-ember animate-blink" />
          </p>
        </Reveal>
      </motion.div>
    </section>
  );
}
