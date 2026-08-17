import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '../ui/Button';
import { EASE } from '../../lib/motion';
import { useReducedMotion, useAnnounce } from '../../lib/hooks';
import ScrambleText from '../ui/ScrambleText';
import { useSmoothScroll } from '../../lib/SmoothScroll';

/**
 * The cinematic pause. The screen empties out, one statement remains.
 * Scroll-scrubbed on desktop; a calm, still composition when reduced.
 */
export default function DeploySection() {
  const reduced = useReducedMotion();
  const announce = useAnnounce();
  const { scrollTo } = useSmoothScroll();
  const ref = useRef<HTMLElement>(null);
  const [deployed, setDeployed] = useState(false);
  const [phase, setPhase] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const runScale = useTransform(scrollYProgress, [0.15, 0.5], reduced ? [1, 1] : [0.82, 1]);
  const runOpacity = useTransform(scrollYProgress, [0.12, 0.34, 0.72, 0.9], [0, 1, 1, 0]);
  const lineOpacity = useTransform(scrollYProgress, [0.42, 0.56], [0, 1]);
  const glow = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

  useEffect(() => {
    if (!deployed) return;
    const seq = [900, 1500, 2100];
    const timers = seq.map((t, i) => window.setTimeout(() => setPhase(i + 1), t));
    announce('Deploying. Build started.');
    return () => timers.forEach(clearTimeout);
  }, [deployed, announce]);

  return (
    <section
      ref={ref}
      id="chapter-07"
      aria-labelledby="deploy-title"
      className="relative min-h-[190svh] bg-char text-paper lg:min-h-[220svh]"
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* ambient ember bloom, driven by scroll */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 size-[46rem] max-w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: reduced ? 0.2 : glow,
            background: 'radial-gradient(circle, rgba(199,88,36,0.20) 0%, rgba(199,88,36,0.05) 42%, transparent 68%)',
          }}
        />

        <div className="shell relative w-full text-center">
          <motion.p
            className="eyebrow mb-10 text-paper/40"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            CH.07 — DEPLOY
          </motion.p>

          <motion.h2
            id="deploy-title"
            style={{ scale: runScale, opacity: runOpacity }}
            className="font-mono text-mega font-medium leading-none tracking-tight text-paper"
          >
            RUN<span className="text-ember">()</span>;
          </motion.h2>

          <motion.div style={{ opacity: reduced ? 1 : lineOpacity }} className="mt-14">
            <p className="mx-auto max-w-md text-lede leading-snug text-paper/70">
              Thinking is useful.
              <br />
              <span className="text-paper">Building is better.</span>
            </p>

            <div className="mt-12 flex flex-col items-center gap-5">
              <Button
                variant="ember"
                size="lg"
                onClick={() => { setDeployed(true); setPhase(0); }}
                disabled={deployed}
                aria-describedby="deploy-log"
              >
                {deployed ? 'DEPLOYING…' : 'DEPLOY YOURSELF'}
                {!deployed && <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
              </Button>

              {/* deployment console */}
              <div id="deploy-log" aria-live="polite" className="h-24 w-full max-w-sm">
                {deployed && (
                  <div className="rounded-md border border-white/12 bg-black/40 p-4 text-left font-mono text-[0.7rem] leading-relaxed backdrop-blur">
                    {[
                      '› building… no perfect version found. shipping anyway.',
                      '› uploading… fear detected. bundled as a warning, not an error.',
                      '› live. you are in production now.',
                    ].map((l, i) => (
                      <motion.p
                        key={l}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: phase > i ? 1 : 0.15, x: phase > i ? 0 : -6 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className={phase > i && i === 2 ? 'text-ember' : 'text-paper/60'}
                      >
                        {phase > i
                          ? <ScrambleText text={l} speed={12} churn={2} noiseClassName="text-paper/20" />
                          : l}
                      </motion.p>
                    ))}
                    {phase >= 3 && (
                      <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        onClick={() => scrollTo('#playground')}
                        className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-paper/50 link-line"
                      >
                        → open the compiler
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* corner ticks — subtle framing, no boxes */}
        <span aria-hidden className="absolute left-gutter top-[calc(var(--nav-h)+1rem)] h-8 w-px bg-white/15" />
        <span aria-hidden className="absolute bottom-10 right-gutter h-8 w-px bg-white/15" />
      </div>
    </section>
  );
}
