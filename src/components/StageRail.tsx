import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion, useMediaQuery } from '../lib/hooks';
import { Reveal } from './ui/Reveal';
import ScrambleText from './ui/ScrambleText';

const STAGES = [
  { id: 'BOOT', note: 'you wake up inside a running process' },
  { id: 'INITIALIZE', note: 'variables get assigned — most of them by other people' },
  { id: 'RUN', note: 'the loop begins' },
  { id: 'ERROR', note: 'something throws' },
  { id: 'DEBUG', note: 'you read the stack trace instead of the shame' },
  { id: 'REFACTOR', note: 'same life, better structure' },
  { id: 'COMMIT', note: 'small, honest, frequent' },
  { id: 'DEPLOY', note: 'you stop rehearsing and ship' },
];

/**
 * Horizontal storytelling moment — the program's execution order.
 * Pinned + scrubbed on desktop, a clean vertical read on mobile.
 */
export default function StageRail() {
  const reduced = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (reduced || !isDesktop) return;
    const el = root.current, tr = track.current;
    if (!el || !tr) return;

    const ctx = gsap.context(() => {
      const distance = () => tr.scrollWidth - window.innerWidth + window.innerWidth * 0.12;

      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => setActiveIdx(Math.round(self.progress * (STAGES.length - 1))),
        },
      });

      // per-card entrance tied to horizontal position
      gsap.utils.toArray<HTMLElement>('[data-stage-card]').forEach((card) => {
        gsap.from(card, {
          opacity: 0.15, y: 40, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 88%', end: 'left 55%', scrub: true },
        });
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, isDesktop]);

  return (
    <section
      ref={root}
      id="stages"
      aria-label="The program: eight stages"
      className="relative overflow-hidden bg-char py-section text-paper lg:h-[100svh] lg:overflow-hidden lg:py-0"
    >
      <div className="relative z-10 lg:flex lg:h-full lg:flex-col lg:justify-center">
        <div className="shell mb-12 lg:mb-14">
          <Reveal className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <span className="font-mono text-micro uppercase tracking-[0.2em] text-ember">EXECUTION ORDER</span>
            <h2 className="font-sans text-h3 font-medium uppercase tracking-tight text-paper">
              Every life runs the same eight stages.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-prose font-mono text-[0.78rem] leading-relaxed text-paper/45">
              Not in order. Not once. The good ones just loop through faster.
            </p>
          </Reveal>
        </div>

        {/* DESKTOP — horizontal scrub */}
        <div className="hidden lg:block">
          <div ref={track} className="flex w-max items-stretch gap-6 px-gutter will-change-transform">
            {STAGES.map((s, i) => (
              <article
                key={s.id}
                data-stage-card
                className={`group relative flex w-[21rem] shrink-0 flex-col justify-between rounded-lg border p-7 transition-colors duration-500 ${
                  i === activeIdx ? 'border-ember/50 bg-white/[0.055]' : 'border-white/10 bg-white/[0.022]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`font-mono text-micro tracking-[0.16em] transition-colors duration-500 ${
                    i === activeIdx ? 'text-ember' : 'text-paper/30'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden className={`size-1.5 rounded-full transition-colors duration-500 ${
                    i === activeIdx ? 'bg-ember' : 'bg-paper/15'}`} />
                </div>
                <div className="mt-16">
                  <h3 className="font-sans text-[2rem] font-medium uppercase leading-none tracking-tight text-paper">
                    <ScrambleText text={s.id} speed={22} churn={4} noiseClassName="text-paper/25" />
                  </h3>
                  <p className="mt-4 font-mono text-[0.76rem] leading-relaxed text-paper/45">{s.note}</p>
                </div>
                {i < STAGES.length - 1 && (
                  <span aria-hidden className="absolute -right-6 top-1/2 w-6 -translate-y-1/2 border-t border-dashed border-white/12" />
                )}
              </article>
            ))}
          </div>

          {/* progress bar */}
          <div className="shell mt-12">
            <div className="flex items-center gap-4">
              <span className="font-mono text-micro tabular-nums text-paper/40">
                {String(activeIdx + 1).padStart(2, '0')} / {STAGES.length}
              </span>
              <div className="relative h-px flex-1 bg-white/12">
                <div
                  className="absolute inset-y-0 left-0 bg-ember transition-[width] duration-300 ease-out"
                  style={{ width: `${((activeIdx + 1) / STAGES.length) * 100}%` }}
                />
              </div>
              <span className="font-mono text-micro uppercase tracking-[0.14em] text-paper/40">
                {STAGES[activeIdx].id}
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET — intentional vertical list, not a squeezed rail */}
        <ol className="shell space-y-px lg:hidden">
          {STAGES.map((s, i) => (
            <li key={s.id}>
              <Reveal delay={i * 0.04} y={16}>
                <div className="flex items-baseline gap-5 border-b border-white/10 py-5">
                  <span className="font-mono text-micro tabular-nums text-ember">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-sans text-[1.4rem] font-medium uppercase leading-none tracking-tight text-paper">
                      {s.id}
                    </h3>
                    <p className="mt-2 font-mono text-[0.72rem] leading-relaxed text-paper/45">{s.note}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
