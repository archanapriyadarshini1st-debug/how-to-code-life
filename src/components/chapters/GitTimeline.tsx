import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ChapterIntro from '../ui/ChapterIntro';
import { Reveal } from '../ui/Reveal';
import { EASE } from '../../lib/motion';
import { useReducedMotion, useAnnounce } from '../../lib/hooks';

type Op = 'commit' | 'branch' | 'merge' | 'revert' | 'refactor';

interface Node {
  v: string; op: Op; lane: 0 | 1; msg: string; detail: string;
}

const NODES: Node[] = [
  { v: 'v1.0', op: 'commit',   lane: 0, msg: 'initial commit',            detail: 'Someone else wrote most of this. Parents, school, hometown, luck. You inherited a codebase you did not choose.' },
  { v: 'v1.1', op: 'commit',   lane: 0, msg: 'add: first real opinion',   detail: 'The first line of code that was actually yours. Small. Badly formatted. Yours.' },
  { v: 'v1.2', op: 'branch',   lane: 1, msg: 'branch: the other path',    detail: 'You tried something that did not fit the main branch. Everyone called it a phase. It was a spike.' },
  { v: 'v1.3', op: 'revert',   lane: 1, msg: 'revert: that whole year',   detail: 'You rolled it back. The commit is still in history. That is the point. Reverting is not deleting.' },
  { v: 'v1.4', op: 'merge',    lane: 0, msg: 'merge: what you learned',   detail: 'The failed branch shipped something after all. Conflicts resolved manually, as always.' },
  { v: 'v1.9', op: 'refactor', lane: 0, msg: 'refactor: same life, less noise', detail: 'No new features. You just deleted what was never working. This is the most underrated release.' },
  { v: 'v2.0', op: 'commit',   lane: 0, msg: 'release: a version you recognise', detail: 'Not a different person. The same person, better organised, with fewer apologies in the changelog.' },
];

const OP_STYLE: Record<Op, { dot: string; text: string; label: string }> = {
  commit:   { dot: 'bg-char border-char',       text: 'text-char',  label: 'commit'   },
  branch:   { dot: 'bg-paper border-ember',     text: 'text-ember', label: 'branch'   },
  merge:    { dot: 'bg-ember border-ember',     text: 'text-ember', label: 'merge'    },
  revert:   { dot: 'bg-paper border-mute',      text: 'text-mute',  label: 'revert'   },
  refactor: { dot: 'bg-paper border-char',      text: 'text-char',  label: 'refactor' },
};

export default function GitTimeline() {
  const reduced = useReducedMotion();
  const announce = useAnnounce();
  const uid = useId();
  const [open, setOpen] = useState(0);

  const LANE_X = [96, 168];
  const ROW_H = 92;
  const height = NODES.length * ROW_H + 40;

  const path = NODES.map((n, i) => ({ x: LANE_X[n.lane], y: 40 + i * ROW_H, n, i }));

  return (
    <section id="chapter-06" aria-labelledby={`${uid}-t`} className="relative bg-paper py-section">
      <div className="shell">
        <div id={`${uid}-t`}>
          <ChapterIntro
            index="06"
            titleLines={['YOU ARE ALLOWED', 'TO CHANGE YOUR VERSION.']}
            size="compact"
            lede={<>Nobody ships v1.0 and calls it done. You are not stuck with the version you were handed. You are just behind on commits.</>}
          />
        </div>

        <div className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* ── GRAPH ── */}
          <div className="lg:col-span-5">
            <div className="relative overflow-x-auto">
              <svg
                width="100%" viewBox={`0 0 260 ${height}`} height={height}
                className="max-w-[260px]" role="img" aria-label="Version history graph"
              >
                {/* lane lines */}
                {path.map((p, i) => {
                  const next = path[i + 1];
                  if (!next) return null;
                  const same = p.x === next.x;
                  const d = same
                    ? `M${p.x} ${p.y} L${next.x} ${next.y}`
                    : `M${p.x} ${p.y} C${p.x} ${p.y + 34}, ${next.x} ${next.y - 34}, ${next.x} ${next.y}`;
                  return (
                    <motion.path
                      key={i} d={d} fill="none"
                      stroke={next.n.op === 'branch' || p.n.op === 'branch' ? 'var(--color-ember)' : 'var(--color-line)'}
                      strokeWidth="1.5"
                      strokeDasharray={p.n.op === 'revert' || next.n.op === 'revert' ? '4 4' : undefined}
                      initial={reduced ? undefined : { pathLength: 0 }}
                      whileInView={reduced ? undefined : { pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
                    />
                  );
                })}

                {/* nodes */}
                {path.map((p) => {
                  const on = open === p.i;
                  const st = OP_STYLE[p.n.op];
                  return (
                    <g key={p.i} transform={`translate(${p.x} ${p.y})`}>
                      {on && !reduced && (
                        <motion.circle
                          r={9} fill="none" stroke="var(--color-ember)" strokeWidth="1"
                          initial={{ r: 9, opacity: 0.7 }}
                          animate={{ r: [9, 20], opacity: [0.7, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                      <motion.circle
                        r={6}
                        initial={{ r: 6 }}
                        animate={{ r: on ? 8 : 6 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className={st.dot}
                        fill={st.dot.includes('bg-char') ? 'var(--color-char)' : st.dot.includes('bg-ember') ? 'var(--color-ember)' : 'var(--color-paper)'}
                        stroke={st.dot.includes('border-ember') ? 'var(--color-ember)' : st.dot.includes('border-mute') ? 'var(--color-mute)' : 'var(--color-char)'}
                        strokeWidth="2"
                      />
                      <text x={-18} y={4} textAnchor="end"
                            className={`font-mono text-[11px] ${on ? 'fill-[var(--color-char)]' : 'fill-[var(--color-mute)]'}`}>
                        {p.n.v}
                      </text>
                      <text x={22} y={4}
                            className={`font-mono text-[10.5px] uppercase ${on ? 'fill-[var(--color-ember)]' : 'fill-[var(--color-mute)]'}`}>
                        {st.label}
                      </text>
                      {/* hit area */}
                      <circle
                        r={18} fill="transparent" style={{ cursor: 'pointer' }}
                        onClick={() => { setOpen(p.i); announce(`${p.n.v}: ${p.n.msg}`); }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ── LOG ── */}
          <div className="lg:col-span-7">
            <ol className="space-y-0">
              {NODES.map((n, i) => {
                const on = open === i;
                const st = OP_STYLE[n.op];
                return (
                  <li key={n.v} className="border-b border-line first:border-t">
                    <button
                      onClick={() => setOpen(i)}
                      aria-expanded={on}
                      className="group flex w-full items-baseline gap-4 py-4 text-left sm:gap-6"
                    >
                      <span className="w-9 shrink-0 font-mono text-[0.72rem] tabular-nums text-mute">{n.v}</span>
                      <span className={`w-16 shrink-0 font-mono text-micro uppercase tracking-[0.1em] ${st.text}`}>
                        {st.label}
                      </span>
                      <span className={`min-w-0 flex-1 font-mono text-[0.78rem] transition-colors ${on ? 'text-char' : 'text-mute group-hover:text-ink'}`}>
                        {n.msg}
                      </span>
                      <span aria-hidden className={`shrink-0 text-mute transition-transform duration-300 ${on ? 'rotate-90 text-ember' : ''}`}>›</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.42, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-prose pb-6 pl-[3.25rem] text-body text-ink/75 sm:pl-[5.5rem]">
                            {n.detail}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>

            <Reveal delay={0.1}>
              <div className="mt-12 border-l-2 border-ember pl-6 sm:pl-8">
                <p className="text-[clamp(1.5rem,2.6vw,2.25rem)] italic leading-[1.25] text-char">
                  You don't need to become someone else.
                  <br />
                  Just keep committing.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
