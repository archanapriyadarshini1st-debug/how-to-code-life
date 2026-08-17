import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal, MaskLines } from '../ui/Reveal';
import Button from '../ui/Button';
import { EASE } from '../../lib/motion';
import { useReducedMotion, useTilt } from '../../lib/hooks';

const ERRORS = [
  {
    code: '404',
    title: 'Perfect life not found.',
    trace: ['at comparison (instagram.js:1:1)', 'at expectation (childhood.ts:12)', 'at You.render (life.tsx:∞)'],
    verdict: 'Good.',
    fix: 'Now build your own.',
  },
  {
    code: '500',
    title: 'Internal expectation error.',
    trace: ['at parents.hopes (inherited.js:4)', 'at society.timeline (age:27)', 'at You.compare (never.ts:1)'],
    verdict: 'Not your exception to catch.',
    fix: 'Throw it. Keep moving.',
  },
  {
    code: '408',
    title: 'Request timeout: the right moment.',
    trace: ['at waitForPerfectMoment (someday.js:∞)', 'at pending (forever.ts:0)'],
    verdict: 'It was never coming.',
    fix: 'Start unprepared.',
  },
  {
    code: '403',
    title: 'Forbidden: permission from others.',
    trace: ['at approval.request (peers.js:88)', 'at validation.await (external.ts:2)'],
    verdict: 'You already had access.',
    fix: 'Authenticate yourself.',
  },
];

function ErrorCard({ err, index, expanded, onToggle }: {
  err: typeof ERRORS[number]; index: number; expanded: boolean; onToggle: () => void;
}) {
  const tilt = useTilt<HTMLDivElement>(4);
  const reduced = useReducedMotion();

  return (
    <div ref={tilt} className="transition-transform duration-500 ease-out will-change-transform">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`group relative block w-full overflow-hidden rounded-lg border p-6 text-left transition-all duration-500 sm:p-7 ${
          expanded ? 'border-ember/50 bg-[#151311]' : 'border-white/10 bg-white/[0.025] hover:border-white/25'
        }`}
        data-cursor="link"
        data-cursor-label={expanded ? 'CLOSE' : 'TRACE'}
      >
        {/* scanline sweep on hover */}
        {!reduced && (
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-ember/[0.07] to-transparent"
                  style={{ animation: 'scan 2.6s linear infinite' }} />
          </span>
        )}

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="font-mono text-micro uppercase tracking-[0.18em] text-ember">
              ERROR {err.code}
            </span>
            <h3 className="mt-3 font-sans text-[1.35rem] font-medium leading-tight tracking-tight text-paper sm:text-[1.6rem]">
              {err.title}
            </h3>
          </div>
          <span
            aria-hidden
            className={`mt-1 shrink-0 font-mono text-lg text-paper/40 transition-transform duration-500 ${expanded ? 'rotate-45' : ''}`}
          >
            +
          </span>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-paper/35">stack trace</p>
                <ul className="mt-3 space-y-1.5">
                  {err.trace.map((t, i) => (
                    <motion.li
                      key={t}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.4 }}
                      className="font-mono text-[0.72rem] text-paper/50"
                    >
                      {t}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-[1.5rem] italic text-ember">{err.verdict}</span>
                  <span className="font-mono text-[0.78rem] text-paper/70">{err.fix}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <span aria-hidden className="mt-6 block font-mono text-[0.66rem] tabular-nums text-paper/20">
          {String(index + 1).padStart(2, '0')} / {String(ERRORS.length).padStart(2, '0')}
        </span>
      </button>
    </div>
  );
}

export default function ErrorState() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section
      id="chapter-04"
      aria-labelledby={`${uid}-t`}
      className="relative overflow-hidden bg-char py-section text-paper grain"
    >
      <div className="shell relative">
        {/* Chapter intro, dark variant */}
        <div id={`${uid}-t`}>
          <Reveal className="mb-7 flex items-center gap-4">
            <span className="font-mono text-micro tracking-[0.2em] text-ember">CH.04</span>
            <motion.span aria-hidden className="h-px bg-white/20"
              initial={{ width: 0 }} whileInView={{ width: 64 }} viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE, delay: 0.1 }} />
            <span className="font-mono text-micro uppercase tracking-[0.18em] text-paper/45">ERRORS</span>
          </Reveal>

          <MaskLines
            as="h2"
            lines={['ERRORS ARE PART', 'OF THE PROGRAM.']}
            className="font-sans text-h2 font-medium uppercase text-paper"
            delay={0.05}
          />

          <Reveal delay={0.18}>
            <p className="mt-8 max-w-prose text-lede text-paper/60">
              Nobody ships clean on the first run. Every failure leaves a stack trace —
              and a stack trace is just instructions written in a language you were never taught to read.
            </p>
          </Reveal>
        </div>

        {/* bento-ish asymmetric error grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ErrorCard err={ERRORS[0]} index={0} expanded={open === 0} onToggle={() => setOpen(open === 0 ? null : 0)} />
          </div>
          <div className="lg:col-span-5">
            <ErrorCard err={ERRORS[1]} index={1} expanded={open === 1} onToggle={() => setOpen(open === 1 ? null : 1)} />
          </div>
          <div className="lg:col-span-5">
            <ErrorCard err={ERRORS[2]} index={2} expanded={open === 2} onToggle={() => setOpen(open === 2 ? null : 2)} />
          </div>
          <div className="lg:col-span-7">
            <ErrorCard err={ERRORS[3]} index={3} expanded={open === 3} onToggle={() => setOpen(open === 3 ? null : 3)} />
          </div>
        </div>

        {/* the turn */}
        <div className="mt-20 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="font-mono text-micro uppercase tracking-[0.18em] text-ember">RECOVERED</p>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <MaskLines
              as="p"
              lines={['A failure is a', 'measurement, not', 'a verdict.']}
              className="font-display text-[clamp(1.8rem,3.4vw,3rem)] italic leading-[1.15] text-paper"
            />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-prose text-body text-paper/55">
                The program didn't stop because you're incapable. It stopped because it found
                something it couldn't handle yet. That's the whole message. Read it, patch it, run it again.
              </p>
              <div className="mt-8">
                <Button variant="ember" onClick={() => document.getElementById('chapter-05')?.scrollIntoView({ behavior: 'smooth' })}>
                  OPEN THE DEBUGGER
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
