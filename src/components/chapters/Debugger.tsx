import { useState, useMemo, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ChapterIntro from '../ui/ChapterIntro';
import Button from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { EASE } from '../../lib/motion';
import { useReducedMotion, useAnnounce } from '../../lib/hooks';

/* ════════════════════════════════════════════════════════════
   A real puzzle: find the buggy line, pick the correct patch.
   Three bugs. Wrong answers explain themselves. No dead ends.
   ════════════════════════════════════════════════════════════ */

interface Bug {
  line: number;              // index into source
  buggy: string;
  fixed: string;
  hint: string;
  options: { text: string; correct?: boolean; why: string }[];
}

const SOURCE = [
  'function improve() {',
  '    waitForPerfectMoment();',
  '    if (!readyEnough) return;',
  '    compareTo(everyoneElse);',
  '    return you;',
  '}',
];

const BUGS: Bug[] = [
  {
    line: 1,
    buggy: '    waitForPerfectMoment();',
    fixed: '    start();',
    hint: 'This call never resolves. It has no timeout and no return.',
    options: [
      { text: 'start();', correct: true, why: 'The moment is created by starting, not found by waiting.' },
      { text: 'waitForPerfectMoment().then(start);', why: 'Still blocked on a promise that never resolves.' },
      { text: 'setTimeout(start, 31536000000);', why: 'A year from now is the same bug with extra syntax.' },
    ],
  },
  {
    line: 2,
    buggy: '    if (!readyEnough) return;',
    fixed: '    if (!started) start();',
    hint: 'An early return that guards on a feeling nobody ever satisfies.',
    options: [
      { text: 'if (!started) start();', correct: true, why: 'Readiness is an output of starting, not a precondition.' },
      { text: 'if (!readyEnough) prepare();', why: 'Preparation becomes the new waiting room.' },
      { text: 'while (!readyEnough) study();', why: 'You just turned the guard into an infinite loop.' },
    ],
  },
  {
    line: 3,
    buggy: '    compareTo(everyoneElse);',
    fixed: '    compareTo(yesterdayYou);',
    hint: 'You are benchmarking against a machine with different hardware.',
    options: [
      { text: 'compareTo(yesterdayYou);', correct: true, why: 'The only benchmark running on identical hardware.' },
      { text: 'compareTo(bestPersonAlive);', why: 'You picked a worse baseline, not no baseline.' },
      { text: '// compareTo(everyoneElse);', why: 'Commenting it out hides it. You will uncomment it at 2am.' },
    ],
  },
];

export default function Debugger() {
  const reduced = useReducedMotion();
  const announce = useAnnounce();
  const uid = useId();

  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState<number[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  const current = useMemo(() => BUGS.find((b) => b.line === selected) ?? null, [selected]);
  const allSolved = solved.length === BUGS.length;

  const source = useMemo(
    () => SOURCE.map((ln, i) => {
      const bug = BUGS.find((b) => b.line === i);
      return bug && solved.includes(i) ? bug.fixed : ln;
    }),
    [solved],
  );

  const pick = useCallback((opt: Bug['options'][number], bug: Bug) => {
    if (opt.correct) {
      setSolved((s) => (s.includes(bug.line) ? s : [...s, bug.line]));
      setWrong(null);
      setSelected(null);
      announce(`Patched line ${bug.line + 1}. ${opt.why}`);
    } else {
      setWrong(opt.text);
      announce(`Not quite. ${opt.why}`);
    }
  }, [announce]);

  const reset = () => { setSolved([]); setSelected(null); setWrong(null); setRan(false); };

  return (
    <section id="chapter-05" aria-labelledby={`${uid}-t`} className="relative bg-surface py-section">
      <div className="shell">
        <div id={`${uid}-t`}>
          <ChapterIntro
            index="05"
            titleLines={["DON'T DELETE THE ERROR.", 'UNDERSTAND IT.']}
            size="compact"
            lede={<>Below is a small life algorithm. It compiles. It runs. It also quietly ruins decades. Find the three bugs.</>}
          />
        </div>

        <div className="mt-14 grid gap-6 lg:mt-18 lg:grid-cols-12 lg:gap-8">
          {/* ── EDITOR ── */}
          <div className="min-w-0 lg:col-span-7">
            <div className="overflow-hidden rounded-lg border border-line bg-[var(--color-code-bg)] shadow-raise">
              {/* chrome */}
              <div className="flex items-center justify-between border-b border-[var(--color-code-line)] bg-[var(--color-code-panel)] px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex gap-1.5" aria-hidden>
                    <i className="size-2 rounded-full bg-[var(--color-code-edge)]" />
                    <i className="size-2 rounded-full bg-[var(--color-code-edge)]" />
                    <i className="size-2 rounded-full bg-ember/70" />
                  </span>
                  <span className="ml-1 font-mono text-micro tracking-[0.1em] text-[var(--color-code-mute)]">improve.ts</span>
                </div>
                <span className="font-mono text-micro uppercase tracking-[0.14em] text-[var(--color-code-comment)]">
                  {solved.length}/{BUGS.length} PATCHED
                </span>
              </div>

              {/* code */}
              <div className="overflow-x-auto p-4 sm:p-6">
                <ul className="min-w-[22rem] font-mono text-[0.78rem] leading-[2] sm:text-[0.86rem]">
                  {source.map((ln, i) => {
                    const bug = BUGS.find((b) => b.line === i);
                    const isFixed = solved.includes(i);
                    const isSel = selected === i;
                    return (
                      <li key={i} className="relative">
                        {bug ? (
                          <button
                            onClick={() => { setSelected(isSel ? null : i); setWrong(null); }}
                            disabled={isFixed}
                            aria-expanded={isSel}
                            aria-label={`Line ${i + 1}${isFixed ? ', patched' : ', suspicious, inspect'}`}
                            className={`group flex w-full items-center gap-4 rounded-xs px-2 -mx-2 text-left transition-colors duration-300 ${
                              isFixed ? 'cursor-default bg-[var(--color-code-string)]/[0.08]'
                                : isSel ? 'bg-ember/[0.14]' : 'hover:bg-white/[0.05]'
                            }`}
                          >
                            <span className={`w-5 shrink-0 select-none text-right text-micro tabular-nums ${
                              isFixed ? 'text-[var(--color-code-string)]' : 'text-ember'}`}>
                              {i + 1}
                            </span>
                            <span className={`min-w-0 flex-1 whitespace-pre ${isFixed ? 'text-[var(--color-code-string)]' : 'text-[var(--color-code-text)]'}`}>
                              {ln}
                            </span>
                            <span aria-hidden className={`shrink-0 font-mono text-micro uppercase tracking-[0.1em] transition-opacity ${
                              isFixed ? 'text-[var(--color-code-string)]' : 'text-ember opacity-70 group-hover:opacity-100'}`}>
                              {isFixed ? '✓ fixed' : '⚠ bug'}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-4 px-2 -mx-2">
                            <span className="w-5 shrink-0 select-none text-right text-micro tabular-nums text-[var(--color-code-mute)]">{i + 1}</span>
                            <span className="whitespace-pre text-[var(--color-code-text)]">
                              {ln.split(/(\bfunction\b|\breturn\b|\bif\b)/).map((p, j) =>
                                /^(function|return|if)$/.test(p)
                                  ? <span key={j} className="font-medium text-[var(--color-code-keyword)]">{p}</span>
                                  : <span key={j}>{p}</span>)}
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* inspector drawer */}
              <AnimatePresence>
                {current && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
                    className="overflow-hidden border-t border-[var(--color-code-line)] bg-[var(--color-code-panel)]"
                  >
                    <div className="p-4 sm:p-6">
                      <p className="font-mono text-micro uppercase tracking-[0.14em] text-ember">
                        line {current.line + 1} diagnosis
                      </p>
                      <p className="mt-2.5 font-mono text-[0.78rem] leading-relaxed text-[var(--color-code-text)]">
                        // {current.hint}
                      </p>
                      <p className="mt-5 font-mono text-micro uppercase tracking-[0.14em] text-[var(--color-code-comment)]">
                        choose a patch
                      </p>
                      <div className="mt-3 space-y-2">
                        {current.options.map((o) => {
                          const isWrong = wrong === o.text;
                          return (
                            <div key={o.text}>
                              <button
                                onClick={() => pick(o, current)}
                                className={`w-full rounded-md border px-4 py-3 text-left font-mono text-[0.76rem] transition-all duration-300 ${
                                  isWrong
                                    ? 'border-ember/60 bg-ember/10 text-[var(--color-code-number)]'
                                    : 'border-[var(--color-code-edge)] bg-[var(--color-code-bg)] text-[var(--color-code-text)] hover:border-[var(--color-code-mute)] hover:bg-[var(--color-code-panel)]'
                                }`}
                              >
                                {o.text}
                              </button>
                              <AnimatePresence>
                                {isWrong && (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden pl-4 pt-2 font-mono text-micro leading-relaxed text-[var(--color-code-mute)]"
                                  >
                                    ↳ {o.why}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* console */}
              <div className="border-t border-[var(--color-code-line)] bg-[var(--color-code-bg)] px-4 py-3.5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="min-w-0 truncate font-mono text-[0.72rem] text-[var(--color-code-comment)]">
                    {allSolved
                      ? <span className="text-[var(--color-code-string)]">✓ 0 errors · improve() ready to run</span>
                      : selected !== null
                        ? <>› inspecting line {selected + 1}…</>
                        : <>› {BUGS.length - solved.length} problem{BUGS.length - solved.length === 1 ? '' : 's'} found. click a flagged line.</>}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    {solved.length > 0 && (
                      <button onClick={reset} className="font-mono text-micro uppercase tracking-[0.12em] text-[var(--color-code-comment)] transition-colors hover:text-[var(--color-code-text)]">
                        reset
                      </button>
                    )}
                    <button
                      onClick={() => { setRan(true); announce(allSolved ? 'improve() executed successfully.' : 'Cannot run. Bugs remain.'); }}
                      disabled={!allSolved}
                      className={`rounded-full px-3.5 py-1.5 font-mono text-micro uppercase tracking-[0.12em] transition-all ${
                        allSolved ? 'bg-ember text-white hover:brightness-110' : 'cursor-not-allowed bg-[var(--color-code-line)] text-[var(--color-code-comment)]'
                      }`}
                    >
                      ▶ run
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {ran && allSolved && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="mt-3 border-t border-[var(--color-code-line)] pt-3"
                    >
                      <p className="font-mono text-[0.72rem] leading-relaxed text-[var(--color-code-string)]">
                        &gt; improve()<br />
                        <span className="text-[var(--color-code-text)]">→ started. imperfectly. on time.</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── SIDE PANEL ── */}
          <aside className="min-w-0 lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-lg border border-line bg-paper p-6 sm:p-7">
                <span className="panel-label">PROGRESS</span>
                <div className="mt-5 space-y-3">
                  {BUGS.map((b, i) => {
                    const done = solved.includes(b.line);
                    return (
                      <div key={b.line} className="flex items-center gap-3">
                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-micro transition-colors ${
                          done ? 'border-ember bg-ember text-white' : 'border-line text-mute'}`}>
                          {done ? '✓' : i + 1}
                        </span>
                        <span className={`font-mono text-[0.74rem] transition-colors ${done ? 'text-char' : 'text-mute'}`}>
                          line {b.line + 1}
                        </span>
                        <span className="h-px flex-1 bg-line" />
                        <span className="font-mono text-micro uppercase tracking-[0.12em] text-mute">
                          {done ? 'patched' : 'open'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 h-1 overflow-hidden rounded-full bg-veil">
                  <motion.div
                    className="h-full rounded-full bg-ember"
                    animate={{ width: `${(solved.length / BUGS.length) * 100}%` }}
                    transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={allSolved ? 'done' : 'wip'}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="border-l-2 border-ember pl-6"
                >
                  <p className="text-[1.5rem] italic leading-snug text-char sm:text-[1.75rem]">
                    {allSolved
                      ? 'The bug was never the code. It was the waiting.'
                      : "You don't need a new life. You need a better iteration."}
                  </p>
                </motion.blockquote>
              </AnimatePresence>

              <Reveal>
                <p className="font-mono text-[0.72rem] leading-relaxed text-mute">
                  // Deleting an error hides it. Understanding it retires it permanently.
                </p>
              </Reveal>

              {allSolved && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}>
                  <Button variant="primary" onClick={() => document.getElementById('chapter-06')?.scrollIntoView({ behavior: 'smooth' })}>
                    COMMIT THE FIX
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
