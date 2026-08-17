import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ChapterIntro from '../ui/ChapterIntro';
import CodeBlock from '../ui/CodeBlock';
import { Reveal } from '../ui/Reveal';
import Button from '../ui/Button';
import { EASE } from '../../lib/motion';
import { useAnnounce } from '../../lib/hooks';

type NodeId = string;
interface Node {
  id: NodeId;
  condition: string;
  prompt: string;
  options: { label: string; call: string; next: NodeId | null; brave?: boolean }[];
  code: string;
}

const TREE: Record<NodeId, Node> = {
  root: {
    id: 'root',
    condition: 'if (fear)',
    prompt: 'There is a thing you want. There is also fear. Both are real. Which one gets the return statement?',
    code: `if (fear) {\n    stay_safe();\n} else {\n    try();\n}`,
    options: [
      { label: 'stay_safe()', call: 'stay_safe', next: 'safe' },
      { label: 'try()', call: 'try', next: 'try', brave: true },
    ],
  },
  safe: {
    id: 'safe',
    condition: 'while (waiting)',
    prompt: 'Safe compiled fine. It always does. But the loop has no exit condition, and time keeps decrementing.',
    code: `while (waiting) {\n    scroll();\n    plan();\n    // never ships\n}`,
    options: [
      { label: 'keep_waiting()', call: 'wait', next: 'stuck' },
      { label: 'break', call: 'break', next: 'try', brave: true },
    ],
  },
  stuck: {
    id: 'stuck',
    condition: 'throw new RegretError()',
    prompt: 'Nothing broke. That is the problem. A life with no exceptions is usually a life with no attempts.',
    code: `// 5 years later\nconsole.log(regrets.length);\n// → the ones you didn't try`,
    options: [{ label: 'break', call: 'break', next: 'try', brave: true }],
  },
  try: {
    id: 'try',
    condition: 'try { ... } catch (e)',
    prompt: 'You ran it. Something will throw. That is expected behaviour, not a design flaw.',
    code: `try {\n    begin();\n} catch (e) {\n    learn(e);\n    begin();\n}`,
    options: [
      { label: 'learn(e)', call: 'learn', next: 'grow', brave: true },
      { label: 'quit()', call: 'quit', next: 'safe' },
    ],
  },
  grow: {
    id: 'grow',
    condition: 'return you',
    prompt: 'This is the only branch that changes the return value. Everything else returns the same person.',
    code: `function you() {\n    return iterate(you);\n}`,
    options: [],
  },
};

export default function ConditionTree() {
  const [path, setPath] = useState<NodeId[]>(['root']);
  const [log, setLog] = useState<string[]>([]);
  const announce = useAnnounce();
  const uid = useId();

  const current = TREE[path[path.length - 1]];
  const isEnd = current.options.length === 0;

  const choose = (call: string, next: NodeId | null) => {
    setLog((l) => [...l, call]);
    if (next) {
      setPath((p) => [...p, next]);
      announce(`Branch taken: ${call}. Now at ${TREE[next].condition}.`);
    }
  };

  const reset = () => { setPath(['root']); setLog([]); announce('Branch reset to the first condition.'); };

  return (
    <section id="chapter-02" aria-labelledby={`${uid}-t`} className="relative overflow-hidden bg-surface py-section">
      {/* faint branch lines in the background */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full opacity-[0.05]" preserveAspectRatio="none">
        <defs>
          <pattern id="branchp" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M0 60 H60 M60 60 V0 M60 60 V120" stroke="rgb(18,17,15)" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#branchp)" />
      </svg>

      <div className="shell relative">
        <div id={`${uid}-t`}>
          <ChapterIntro
            index="02"
            titleLines={['IF THIS,', 'THEN THAT.']}
            lede={<>Every decision is a conditional. You are always executing one branch and abandoning another. The only question is whether you wrote the condition or inherited it.</>}
          />
        </div>

        <div className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* ── BRANCH RUNNER ── */}
          <div className="lg:col-span-7">
            <div className="rounded-lg border border-line bg-paper p-6 shadow-lift sm:p-9">
              <div className="mb-7 flex items-center justify-between border-b border-line pb-4">
                <span className="panel-label">BRANCH RUNNER</span>
                <span className="font-mono text-micro tabular-nums text-mute">
                  DEPTH {String(path.length).padStart(2, '0')}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="font-mono text-[0.8rem] uppercase tracking-[0.12em] text-ember">
                    {current.condition}
                  </p>
                  <p className="mt-5 max-w-prose text-lede leading-snug text-char">
                    {current.prompt}
                  </p>

                  <div className="mt-8">
                    <CodeBlock code={current.code} tone="dark" showLines={false} compact />
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {current.options.map((o) => (
                      <Button
                        key={o.label}
                        variant={o.brave ? 'primary' : 'ghost'}
                        onClick={() => choose(o.call, o.next)}
                      >
                        {o.label}
                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </Button>
                    ))}
                    {isEnd && (
                      <Button variant="ghost" onClick={reset}>
                        ↺ RUN AGAIN
                      </Button>
                    )}
                  </div>

                  {isEnd && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                      className="mt-8 border-l-2 border-ember pl-5 text-[1.35rem] italic leading-snug text-char"
                    >
                      Both branches cost you something.<br />Only one of them pays you back.
                    </motion.p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── CALL STACK ── */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="mb-5 flex items-center justify-between">
                <span className="panel-label">CALL STACK</span>
                {log.length > 0 && (
                  <button onClick={reset} className="font-mono text-micro uppercase tracking-[0.12em] text-mute link-line">
                    clear
                  </button>
                )}
              </div>

              <ol className="relative space-y-0">
                <span aria-hidden className="absolute bottom-2 left-[0.3rem] top-2 w-px bg-line" />
                <AnimatePresence initial={false}>
                  {path.map((id, i) => {
                    const n = TREE[id];
                    const isCur = i === path.length - 1;
                    return (
                      <motion.li
                        key={id + i}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="relative flex gap-4 py-3.5"
                      >
                        <span className={`relative z-10 mt-1.5 size-[0.62rem] shrink-0 rounded-full border-2 transition-colors ${
                          isCur ? 'border-ember bg-paper' : 'border-line bg-surface'}`} />
                        <div className="min-w-0">
                          <p className={`font-mono text-[0.76rem] ${isCur ? 'text-char' : 'text-mute'}`}>
                            {n.condition}
                          </p>
                          {log[i] && (
                            <p className="mt-1 font-mono text-micro text-mute/70">
                              → {log[i]}()
                            </p>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ol>

              <Reveal delay={0.1}>
                <p className="mt-8 border-t border-line pt-6 font-mono text-[0.72rem] leading-relaxed text-mute">
                  // Fear is not a bug. It's a warning you're allowed to override.
                </p>
              </Reveal>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
