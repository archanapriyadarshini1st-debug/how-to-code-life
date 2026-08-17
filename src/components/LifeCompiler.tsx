import { useState, useId, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeBlock from './ui/CodeBlock';
import Button from './ui/Button';
import ChapterIntro from './ui/ChapterIntro';
import { EASE } from '../lib/motion';
import { useReducedMotion, useTypewriter, useAnnounce } from '../lib/hooks';

/* ════════════════════════════════════════════════════════════
   LIFE COMPILER — turns four honest sentences into pseudo-code.
   Real transformation logic: verbs are extracted, inputs become
   identifiers, and the emitted program changes shape with them.
   ════════════════════════════════════════════════════════════ */

interface Fields { goal: string; habit: string; fear: string; dream: string }

const PLACEHOLDERS: Fields = {
  goal: 'I want to build something',
  habit: 'reading before bed',
  fear: 'that I started too late',
  dream: 'work that outlives me',
};

const STOP = new Set(['i', 'a', 'an', 'the', 'to', 'want', 'wanna', 'my', 'me', 'that', 'of', 'is', 'am', 'be', 'for', 'and', 'it', 'in', 'on', 'with', 'something', 'more', 'better']);

function identify(input: string, fallback: string): string {
  const words = input.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
  if (!words.length) return fallback;
  const [first, ...rest] = words.slice(0, 3);
  return first + rest.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
}

function verbOf(input: string, fallback: string): string {
  const m = input.toLowerCase().match(/\b(build|make|write|learn|start|create|run|ship|study|train|paint|teach|move|leave|quit|save|read|code|design|sing|speak|draw|grow|heal|lift)\w*/);
  return m ? m[1] : fallback;
}

function compile(f: Fields): string {
  const goalV = verbOf(f.goal || PLACEHOLDERS.goal, 'build');
  const goalId = identify(f.goal || PLACEHOLDERS.goal, 'theThing');
  const habitId = identify(f.habit || PLACEHOLDERS.habit, 'smallDailyThing');
  const fearId = identify(f.fear || PLACEHOLDERS.fear, 'startedTooLate');
  const dreamId = identify(f.dream || PLACEHOLDERS.dream, 'workThatLasts');

  return `// compiled from four honest sentences

const ${dreamId} = Symbol('why');
let ${fearId} = true;   // it never fully resolves to false

function ${habitId}() {
    return consistency.add(1);
}

while (curious) {
    learn();
    ${goalV}(${goalId});
    fail();
    debug();

    if (${fearId}) {
        ${goalV}(${goalId});   // do it scared
    }

    ${habitId}();
    commit('small honest progress');
}

export default ${dreamId};`;
}

const FIELD_META: { key: keyof Fields; label: string; kw: string; help: string }[] = [
  { key: 'goal',  label: 'A GOAL',  kw: 'const',    help: 'what you want to make real' },
  { key: 'habit', label: 'A HABIT', kw: 'function', help: 'the small thing you can repeat' },
  { key: 'fear',  label: 'A FEAR',  kw: 'let',      help: 'the one that actually stops you' },
  { key: 'dream', label: 'A DREAM', kw: 'Symbol',   help: 'the reason underneath the reason' },
];

export default function LifeCompiler() {
  const reduced = useReducedMotion();
  const announce = useAnnounce();
  const uid = useId();
  const [f, setF] = useState<Fields>({ goal: '', habit: '', fear: '', dream: '' });
  const [output, setOutput] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [copied, setCopied] = useState(false);
  const outRef = useRef<HTMLDivElement>(null);

  const filled = Object.values(f).filter((v) => v.trim()).length;
  const source = useMemo(() => compile(f), [f]);

  const { out: typedOut } = useTypewriter(output ?? '', { speed: 6, start: !!output });

  const run = () => {
    setBuilding(true);
    setOutput(null);
    setCopied(false);
    window.setTimeout(() => {
      setOutput(source);
      setBuilding(false);
      announce('Compilation successful. Your program is ready.');
      outRef.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }, reduced ? 60 : 620);
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      announce('Copied to clipboard.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — non-critical */ }
  };

  return (
    <section id="playground" aria-labelledby={`${uid}-t`} className="relative bg-surface py-section">
      <div className="shell">
        <div id={`${uid}-t`}>
          <ChapterIntro
            index="08"
            kicker="PLAYGROUND"
            titleLines={['THE LIFE', 'COMPILER.']}
            lede={<>Write four honest sentences. Get back the program you're actually running. It won't be profound — it'll just be true.</>}
          />
        </div>

        <div className="mt-14 grid gap-8 lg:mt-18 lg:grid-cols-12 lg:gap-10">
          {/* ── INPUT ── */}
          <form
            className="lg:col-span-5"
            onSubmit={(e) => { e.preventDefault(); run(); }}
          >
            <div className="rounded-lg border border-line bg-paper p-6 shadow-lift sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <span className="eyebrow">SOURCE INPUT</span>
                <span className="font-mono text-micro tabular-nums text-mute">{filled}/4</span>
              </div>

              <div className="space-y-6">
                {FIELD_META.map((m) => (
                  <div key={m.key}>
                    <label
                      htmlFor={`${uid}-${m.key}`}
                      className="mb-2.5 flex items-baseline gap-2.5"
                    >
                      <span className="font-mono text-[0.67rem] uppercase tracking-[0.14em] text-ember">{m.kw}</span>
                      <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-char">{m.label}</span>
                    </label>
                    <input
                      id={`${uid}-${m.key}`}
                      type="text"
                      className="field"
                      placeholder={PLACEHOLDERS[m.key]}
                      value={f[m.key]}
                      maxLength={90}
                      onChange={(e) => setF((p) => ({ ...p, [m.key]: e.target.value }))}
                      aria-describedby={`${uid}-${m.key}-h`}
                    />
                    <p id={`${uid}-${m.key}-h`} className="mt-2 font-mono text-[0.64rem] text-mute">
                      // {m.help}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button type="submit" variant="primary" disabled={building}>
                  {building ? 'COMPILING…' : '▶ COMPILE'}
                </Button>
                {(filled > 0 || output) && (
                  <button
                    type="button"
                    onClick={() => { setF({ goal: '', habit: '', fear: '', dream: '' }); setOutput(null); }}
                    className="font-mono text-micro uppercase tracking-[0.14em] text-mute link-line"
                  >
                    clear
                  </button>
                )}
              </div>

              <p className="mt-5 font-mono text-[0.66rem] leading-relaxed text-mute">
                // Leave a field blank and the compiler fills in the honest default.
              </p>
            </div>
          </form>

          {/* ── OUTPUT ── */}
          <div ref={outRef} className="min-w-0 lg:col-span-7">
            <div className="sticky top-28">
              <div className="mb-4 flex items-center justify-between">
                <span className="eyebrow">OUTPUT — your.life.ts</span>
                {output && (
                  <button
                    onClick={copy}
                    className="font-mono text-micro uppercase tracking-[0.12em] text-mute link-line"
                  >
                    {copied ? '✓ copied' : 'copy'}
                  </button>
                )}
              </div>

              <div className="relative min-h-[26rem] overflow-hidden rounded-lg border border-line bg-[#141311]">
                <AnimatePresence mode="wait">
                  {building && (
                    <motion.div
                      key="building"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    >
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="size-1.5 rounded-full bg-ember"
                            animate={reduced ? {} : { opacity: [0.25, 1, 0.25] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
                          />
                        ))}
                      </div>
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[#8A847A]">
                        parsing your sentences
                      </p>
                    </motion.div>
                  )}

                  {!building && !output && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
                    >
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#57534E]">
                        awaiting input
                      </p>
                      <p className="mt-4 max-w-xs font-display text-[1.35rem] italic leading-snug text-[#8A847A]">
                        Every program starts with someone deciding to type something.
                      </p>
                      <span aria-hidden className="mt-6 inline-block h-4 w-2 bg-ember animate-blink" />
                    </motion.div>
                  )}

                  {!building && output && (
                    <motion.div
                      key="out"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <CodeBlock
                        code={typedOut || ' '}
                        tone="dark"
                        filename="your.life.ts"
                        showLines
                        caret={typedOut.length < output.length}
                        className="!rounded-none !border-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {output && typedOut.length >= output.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6"
                >
                  <p className="font-mono text-[0.72rem] text-mute">
                    ✓ compiled · 0 errors · <span className="text-ember">1 runtime required: you</span>
                  </p>
                  <button
                    onClick={() => document.getElementById('final')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })}
                    className="ml-auto font-mono text-micro uppercase tracking-[0.14em] text-char link-line"
                  >
                    what now →
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
