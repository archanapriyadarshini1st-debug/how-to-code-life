import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Reveal, MaskLines } from './ui/Reveal';
import { useReducedMotion, useTilt } from '../lib/hooks';
import { EASE } from '../lib/motion';

/* The Rosetta stone: the whole metaphor, stated once, as a bento grid. */
const MAP: { term: string; life: string; note: string; span: string }[] = [
  { term: 'Variables',   life: 'choices',              note: 'Assigned young, mostly by other people. Reassignable at any time.', span: 'lg:col-span-5' },
  { term: 'Functions',   life: 'habits',               note: 'You call them so often you forgot they were written.', span: 'lg:col-span-4' },
  { term: 'Loops',       life: 'routines',             note: 'The shape of your week is the shape of your decade.', span: 'lg:col-span-3' },

  { term: 'Conditions',  life: 'decisions',            note: 'Every branch you take abandons another.', span: 'lg:col-span-3' },
  { term: 'Errors',      life: 'failures',             note: 'Expected. Instructive. Non-fatal, mostly.', span: 'lg:col-span-4' },
  { term: 'Debugging',   life: 'reflection',           note: 'Reading the trace instead of feeling the shame.', span: 'lg:col-span-5' },

  { term: 'Algorithms',  life: 'problem solving',      note: 'A method beats a mood.', span: 'lg:col-span-4' },
  { term: 'Git',         life: 'growth',               note: 'Every version of you is still in history.', span: 'lg:col-span-4' },
  { term: 'Commits',     life: 'small improvements',   note: 'Often. Boring. Compounding.', span: 'lg:col-span-4' },

  { term: 'Branches',    life: 'different paths',      note: 'Cheap to create. Expensive to never merge.', span: 'lg:col-span-3' },
  { term: 'Deploy',      life: 'taking action',        note: 'The only step that changes anything.', span: 'lg:col-span-3' },
  { term: 'Refactor',    life: 'improving what works', note: 'No new features. Less noise.', span: 'lg:col-span-3' },
  { term: 'Open source', life: 'learning from others', note: 'Someone already solved part of this. Read their code.', span: 'lg:col-span-3' },

  { term: 'Runtime',     life: 'the present moment',   note: 'The only place execution ever happens. Everything else is a plan or a memory.', span: 'lg:col-span-12' },
];

function MapCard({ item, i, wide = false }: { item: typeof MAP[number]; i: number; wide?: boolean }) {
  const tilt = useTilt<HTMLDivElement>(3.5);
  return (
    <motion.div
      ref={tilt}
      className={`group relative overflow-hidden rounded-lg border border-line bg-paper p-6 transition-[border-color,box-shadow] duration-500 hover:border-char/25 hover:shadow-lift sm:p-7 ${item.span} ${
        wide ? 'flex flex-col justify-center lg:flex-row lg:items-center lg:justify-between lg:gap-10' : 'flex flex-col justify-between'
      }`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: EASE, delay: (i % 4) * 0.06 }}
    >
      {/* pointer-follow wash */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(199,88,36,0.07), transparent 60%)' }}
      />
      <div className="relative">
        <span className="font-mono text-micro uppercase tracking-[0.16em] text-mute">
          {String(i + 1).padStart(2, '0')}
        </span>
        <h3 className="mt-4 font-mono text-[0.95rem] text-char">{item.term}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span aria-hidden className="font-mono text-[0.8rem] text-ember transition-transform duration-500 group-hover:translate-x-1">=</span>
          <span className="text-[1.35rem] italic leading-none text-char">{item.life}</span>
        </div>
      </div>
      <p className={`relative font-mono text-micro leading-relaxed text-mute ${wide ? 'mt-4 lg:mt-0 lg:max-w-sm lg:text-right' : 'mt-8'}`}>{item.note}</p>
    </motion.div>
  );
}

export default function Concept() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['8%', '-8%']);

  return (
    <section id="concept" aria-labelledby="concept-t" className="relative bg-surface py-section">
      <div className="shell">
        {/* editorial two-column opener */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <MaskLines
              as="h2"
              id="concept-t"
              lines={['LIFE BEHAVES', 'LIKE CODE.']}
              className="font-sans text-h2 font-medium uppercase text-char"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <motion.div style={{ y }}>
              <Reveal delay={0.1}>
                <p className="text-lede leading-snug text-ink/85">
                  Not as a metaphor you put on a poster. As a working model.
                </p>
                <p className="mt-6 max-w-prose text-body text-ink/70">
                  You have state. You have functions you call without thinking. You have
                  conditions you never wrote, inherited from people who never read them either.
                  You throw errors and call them personality. You have a history you can't delete
                  but can absolutely branch from.
                </p>
                <p className="mt-6 max-w-prose text-body text-ink/70">
                  Once you can see the structure, you can change it. That's the entire course.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-9 border-l-2 border-ember pl-6 text-[1.5rem] italic leading-snug text-char">
                  Your habits are just functions you keep calling.
                </p>
              </Reveal>
            </motion.div>
          </div>
        </div>

        {/* bento translation grid */}
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:auto-rows-[13rem] lg:grid-cols-12">
          {MAP.map((m, i) => <MapCard key={m.term} item={m} i={i} wide={i === MAP.length - 1} />)}
        </div>
      </div>
    </section>
  );
}
