import { useEffect, useRef, useState, useId } from 'react';
import { motion } from 'framer-motion';
import ChapterIntro from '../ui/ChapterIntro';
import CodeBlock from '../ui/CodeBlock';
import Button from '../ui/Button';
import { EASE } from '../../lib/motion';
import { useReducedMotion, useCountUp, useAnnounce } from '../../lib/hooks';

const STEPS = [
  { key: 'thought', label: 'THOUGHT', note: 'a flicker. costs nothing. means nothing yet.' },
  { key: 'action', label: 'ACTION', note: 'the thought gets a body.' },
  { key: 'repetition', label: 'REPETITION', note: 'the boring part. the only part that matters.' },
  { key: 'habit', label: 'HABIT', note: 'it stops needing your permission.' },
  { key: 'identity', label: 'IDENTITY', note: 'you stop doing it. you start being it.' },
];

export default function LoopVisualizer() {
  const reduced = useReducedMotion();
  const announce = useAnnounce();
  const uid = useId();
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const count = useCountUp(iterations, inView, 600);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    o.observe(el); return () => o.disconnect();
  }, []);

  useEffect(() => {
    if (!running) { window.clearInterval(timer.current); return; }
    timer.current = window.setInterval(() => {
      setActive((a) => {
        const next = (a + 1) % STEPS.length;
        if (next === 0) setIterations((i) => i + 1);
        return next;
      });
    }, reduced ? 2200 : 1250);
    return () => window.clearInterval(timer.current);
  }, [running, reduced]);

  const toggle = () => {
    setRunning((r) => { announce(r ? 'Loop paused.' : 'Loop running.'); return !r; });
  };

  const R = 104;
  const cx = 160, cy = 160;

  return (
    <section id="chapter-03" aria-labelledby={`${uid}-t`} className="relative bg-paper py-section">
      <div className="shell">
        <div id={`${uid}-t`}>
          <ChapterIntro
            index="03"
            kicker="LOOPS"
            titleLines={['WHAT YOU REPEAT', 'BECOMES YOU.']}
            lede={<>A habit is just a function you keep calling until you forget you're the one calling it.</>}
          />
        </div>

        <div ref={ref} className="mt-16 grid items-center gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          {/* ── THE LOOP ── */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
              <svg viewBox="0 0 320 320" className="size-full -rotate-90" role="img"
                   aria-label={`Loop diagram. Current stage: ${STEPS[active].label}`}>
                {/* track */}
                <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgb(var(--c-line))" strokeWidth="1" />
                {/* progress arc */}
                <motion.circle
                  cx={cx} cy={cy} r={R} fill="none"
                  stroke="rgb(var(--c-ember))" strokeWidth="1.5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * R}
                  animate={{ strokeDashoffset: 2 * Math.PI * R * (1 - (active + 1) / STEPS.length) }}
                  transition={{ duration: reduced ? 0 : 0.85, ease: EASE }}
                />
                {/* nodes */}
                {STEPS.map((s, i) => {
                  const a = (i / STEPS.length) * Math.PI * 2;
                  const x = cx + Math.cos(a) * R;
                  const y = cy + Math.sin(a) * R;
                  const on = i <= active;
                  const cur = i === active;
                  return (
                    <g key={s.key}>
                      <motion.circle
                        cx={x} cy={y} r={5}
                        initial={{ r: 5 }}
                        animate={{ r: cur ? 9 : 5 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        fill={on ? 'rgb(var(--c-ember))' : 'rgb(var(--c-paper))'}
                        stroke={on ? 'rgb(var(--c-ember))' : 'rgb(var(--c-line))'}
                        strokeWidth="1.5"
                      />
                      {cur && !reduced && (
                        <motion.circle
                          cx={x} cy={y} r={9} fill="none" stroke="rgb(var(--c-ember))" strokeWidth="1"
                          initial={{ r: 9, opacity: 0.6 }}
                          animate={{ r: [9, 22], opacity: [0.6, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* labels (outside svg for real text) */}
              {STEPS.map((s, i) => {
                const a = (i / STEPS.length) * Math.PI * 2 - Math.PI / 2;
                const lx = 50 + Math.cos(a) * 40;
                const ly = 50 + Math.sin(a) * 40;
                const on = i === active;
                return (
                  <button
                    key={s.key}
                    onClick={() => { setActive(i); setRunning(false); announce(`${s.label}: ${s.note}`); }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] transition-all duration-300"
                    style={{
                      left: `${lx}%`, top: `${ly}%`,
                      color: on ? 'rgb(var(--c-char))' : 'rgb(var(--c-mute))',
                      background: on ? 'rgb(var(--c-paper))' : 'transparent',
                      fontWeight: on ? 500 : 400,
                    }}
                    aria-pressed={on}
                    data-cursor="link"
                  >
                    {s.label}
                  </button>
                );
              })}

              {/* center readout */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-micro uppercase tracking-[0.16em] text-mute">iterations</span>
                <span className="font-sans text-[2.75rem] font-medium leading-none tabular-nums text-char">
                  {Math.round(count)}
                </span>
                <span className="mt-1 font-mono text-[0.67rem] uppercase tracking-[0.14em] text-ember">
                  {running ? 'RUNNING' : 'PAUSED'}
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <Button variant={running ? 'ghost' : 'primary'} size="sm" onClick={toggle}>
                {running ? '❚❚ PAUSE LOOP' : '▶ RUN LOOP'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActive(0); setIterations(0); setRunning(false); }}>
                ↺ RESET
              </Button>
            </div>
          </div>

          {/* ── READOUT ── */}
          <div className="lg:col-span-6">
            <ol className="space-y-0">
              {STEPS.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.key}>
                    <button
                      onClick={() => { setActive(i); setRunning(false); }}
                      className="group flex w-full items-start gap-5 border-b border-line py-5 text-left transition-colors hover:border-mute/50"
                      aria-current={on ? 'step' : undefined}
                    >
                      <span className={`mt-1 font-mono text-micro tabular-nums transition-colors ${on ? 'text-ember' : 'text-mute'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <motion.span
                          className="block font-sans font-medium uppercase leading-none tracking-tight text-char"
                          animate={{ fontSize: on ? '1.75rem' : '1.2rem', opacity: on ? 1 : 0.45 }}
                          transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                        >
                          {s.label}
                        </motion.span>
                        <motion.span
                          className="mt-2 block font-mono text-[0.72rem] leading-relaxed text-mute"
                          animate={{ opacity: on ? 1 : 0, height: on ? 'auto' : 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          {s.note}
                        </motion.span>
                      </span>
                      <span aria-hidden className={`mt-2 h-px transition-all duration-500 ${on ? 'w-8 bg-ember' : 'w-3 bg-line'}`} />
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-9">
              <CodeBlock
                filename="identity.loop.ts"
                tone="dark"
                showLines={false}
                code={`while (alive) {\n    think();\n    act();\n    repeat();   // ← ${iterations} so far\n}\n\n// identity is the residue`}
                highlight={[3]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
