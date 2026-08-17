import { useMemo, useState, useId } from 'react';
import { motion } from 'motion/react';
import ChapterIntro from '../ui/ChapterIntro';
import CodeBlock from '../ui/CodeBlock';
import { EASE } from '../../lib/motion';
import { useReducedMotion, useAnnounce } from '../../lib/hooks';

type VarKey = 'sleep' | 'focus' | 'curiosity' | 'discipline' | 'people' | 'time';

const VARS: { key: VarKey; label: string; hint: string }[] = [
  { key: 'sleep', label: 'sleep', hint: 'the compiler needs rest to optimise' },
  { key: 'focus', label: 'focus', hint: 'single-threaded beats context-switching' },
  { key: 'curiosity', label: 'curiosity', hint: 'the only input that compounds for free' },
  { key: 'discipline', label: 'discipline', hint: 'runs the function when motivation returns null' },
  { key: 'people', label: 'people', hint: 'imported dependencies. choose carefully' },
  { key: 'time', label: 'time', hint: 'read-only. cannot be reassigned' },
];

const DEFAULTS: Record<VarKey, number> = {
  sleep: 6, focus: 4, curiosity: 8, discipline: 5, people: 6, time: 7,
};

export default function VariableVisualizer() {
  const reduced = useReducedMotion();
  const announce = useAnnounce();
  const [vals, setVals] = useState<Record<VarKey, number>>(DEFAULTS);
  const [touched, setTouched] = useState<VarKey | null>(null);
  const uid = useId();

  const total = useMemo(() => Object.values(vals).reduce((a, b) => a + b, 0), [vals]);
  const avg = total / VARS.length;

  const state = avg >= 7.5 ? 'COMPILING' : avg >= 5.5 ? 'STABLE' : avg >= 3.5 ? 'DEGRADED' : 'THRASHING';
  const stateColor = avg >= 7.5 ? 'text-ember' : avg >= 5.5 ? 'text-char' : 'text-mute';

  const set = (k: VarKey, v: number) => {
    setVals((p) => ({ ...p, [k]: v }));
    setTouched(k);
  };

  const code = useMemo(() => {
    const lines = VARS.map((v) => `    ${v.label}:${' '.repeat(11 - v.label.length)}${vals[v.key]},`);
    return `const you = {\n${lines.join('\n')}\n}\n\n// state: ${state}`;
  }, [vals, state]);

  return (
    <section
      id="chapter-01"
      aria-labelledby={`${uid}-title`}
      className="relative bg-paper py-section"
    >
      <div className="shell">
        <div id={`${uid}-title`}>
          <ChapterIntro
            index="01"
            titleLines={['WHAT ARE YOU', 'MADE OF?']}
            lede={
              <>
                Your habits, beliefs, environment and choices are variables.
                Most people never realise they're allowed to reassign them.
              </>
            }
          />
        </div>

        <div className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* ── CONTROLS ── */}
          <div className="lg:col-span-5">
            <div className="mb-6 flex items-baseline justify-between">
              <span className="panel-label">DECLARATIONS</span>
              <span className="font-mono text-micro text-mute">DRAG TO REASSIGN</span>
            </div>

            <ul className="space-y-1">
              {VARS.map((v) => {
                const val = vals[v.key];
                const pct = (val / 10) * 100;
                const isTime = v.key === 'time';
                return (
                  <li
                    key={v.key}
                    className="group relative border-b border-line py-4 transition-colors last:border-b-0 hover:border-mute/50"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <label
                        htmlFor={`${uid}-${v.key}`}
                        className="font-mono text-[0.82rem] text-char"
                      >
                        {v.label}
                        {isTime && <span className="ml-2 text-micro uppercase tracking-[0.12em] text-mute">const</span>}
                      </label>
                      <span className={`font-mono text-[0.82rem] tabular-nums transition-colors ${
                        touched === v.key ? 'text-ember' : 'text-mute'}`}>
                        {val}
                      </span>
                    </div>

                    <div className="relative mt-3 h-6">
                      {/* track */}
                      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                      {/* fill */}
                      <motion.span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-char"
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
                      />
                      {/* ticks */}
                      <span aria-hidden className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <i key={i} className={`block h-1.5 w-px ${i * 10 <= pct ? 'bg-char/25' : 'bg-line'}`} />
                        ))}
                      </span>
                      <input
                        id={`${uid}-${v.key}`}
                        type="range"
                        min={0} max={10} step={1}
                        value={val}
                        aria-describedby={`${uid}-${v.key}-hint`}
                        aria-valuetext={`${v.label} ${val} of 10`}
                        onChange={(e) => set(v.key, +e.target.value)}
                        onBlur={() => announce(`${v.label} set to ${val}. System ${state}.`)}
                        className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent
                                   [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none
                                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-char
                                   [&::-webkit-slider-thumb]:shadow-lift [&::-webkit-slider-thumb]:transition-transform
                                   hover:[&::-webkit-slider-thumb]:scale-125
                                   [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full
                                   [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-char"
                      />
                    </div>
                    <p id={`${uid}-${v.key}-hint`} className="mt-2 font-mono text-micro leading-relaxed text-mute opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
                      // {v.hint}
                    </p>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => { setVals(DEFAULTS); setTouched(null); announce('Variables reset to defaults.'); }}
              className="mt-7 font-mono text-micro uppercase tracking-[0.14em] text-mute link-line"
            >
              reset to defaults
            </button>
          </div>

          {/* ── VISUALIZATION ── */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 space-y-5">
              <div className="relative overflow-hidden rounded-lg border border-line bg-surface/60 p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <span className="panel-label">RUNTIME STATE</span>
                  <span className={`font-mono text-[0.74rem] uppercase tracking-[0.14em] ${stateColor}`}>
                    ● {state}
                  </span>
                </div>

                {/* radial/bar hybrid visualization */}
                <div className="flex h-52 items-end gap-2 sm:h-64 sm:gap-3">
                  {VARS.map((v, i) => {
                    const h = (vals[v.key] / 10) * 100;
                    const isActive = touched === v.key;
                    return (
                      <div key={v.key} className="flex h-full flex-1 flex-col justify-end gap-3">
                        <motion.div
                          className={`relative w-full rounded-t-sm ${isActive ? 'bg-ember' : 'bg-char'}`}
                          animate={{ height: `${Math.max(2, h)}%`, opacity: 0.35 + (vals[v.key] / 10) * 0.65 }}
                          transition={{ duration: reduced ? 0 : 0.55, ease: EASE, delay: reduced ? 0 : i * 0.015 }}
                        >
                          {/* breathing highlight */}
                          {!reduced && vals[v.key] > 7 && (
                            <motion.span
                              className="absolute inset-x-0 top-0 h-6 rounded-t-sm bg-gradient-to-b from-white/25 to-transparent"
                              animate={{ opacity: [0.3, 0.7, 0.3] }}
                              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                            />
                          )}
                        </motion.div>
                        <span className="origin-left -rotate-45 whitespace-nowrap font-mono text-micro uppercase tracking-[0.08em] text-mute sm:rotate-0 sm:text-center sm:text-micro">
                          {v.label.slice(0, 4)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* verdict line */}
                <div className="mt-7 border-t border-line pt-5">
                  <p className="font-mono text-[0.76rem] leading-relaxed text-ink/80">
                    {avg >= 7.5 && '// Everything is expensive to maintain. This one is worth it.'}
                    {avg >= 5.5 && avg < 7.5 && '// Stable. Not remarkable. Stable is a fine place to refactor from.'}
                    {avg >= 3.5 && avg < 5.5 && '// Running, but leaking. Check what you stopped doing.'}
                    {avg < 3.5 && '// Too many processes, not enough memory. Kill something.'}
                  </p>
                </div>
              </div>

              <CodeBlock code={code} filename="you.config.ts" tone="dark" showLines={false} compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
