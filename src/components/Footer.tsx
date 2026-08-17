import { Reveal } from './ui/Reveal';
import { useSmoothScroll } from '../lib/SmoothScroll';

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'CHAPTERS',
    links: [
      { label: '01 — Variables', href: '#chapter-01' },
      { label: '02 — Conditions', href: '#chapter-02' },
      { label: '03 — Loops', href: '#chapter-03' },
      { label: '04 — Errors', href: '#chapter-04' },
    ],
  },
  {
    title: '—',
    links: [
      { label: '05 — Debugging', href: '#chapter-05' },
      { label: '06 — Git', href: '#chapter-06' },
      { label: '07 — Deploy', href: '#chapter-07' },
      { label: '08 — Playground', href: '#playground' },
    ],
  },
];

export default function Footer() {
  const { scrollTo } = useSmoothScroll();

  return (
    <footer id="about" className="relative bg-paper pb-10 pt-section" aria-label="Site footer">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* identity */}
          <div className="lg:col-span-5">
            <Reveal>
              <p className="font-sans text-[clamp(1.6rem,3vw,2.4rem)] font-medium uppercase leading-[1.05] tracking-tight text-char">
                HOW TO<br />CODE LIFE{' '}
                <span className="inline-block text-ember">:)</span>
              </p>
              <p className="mt-7 max-w-xs font-display text-[1.25rem] italic leading-snug text-ink/70">
                Built by curiosity.
                <br />
                Debugged by experience.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-8 max-w-sm text-body text-ink/60">
                Learn to code. Learn to think. Learn to build a life.
              </p>
            </Reveal>
          </div>

          {/* nav columns */}
          {COLUMNS.map((col, ci) => (
            <nav key={ci} className="lg:col-span-2" aria-label={ci === 0 ? 'Chapters' : 'More chapters'}>
              <Reveal delay={0.06 * ci}>
                <p className="eyebrow mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        onClick={(e) => { e.preventDefault(); scrollTo(l.href, { offset: -70 }); }}
                        className="font-mono text-[0.74rem] text-mute transition-colors hover:text-char link-line"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </nav>
          ))}

          {/* colophon */}
          <div className="lg:col-span-3">
            <Reveal delay={0.14}>
              <p className="eyebrow mb-5">COLOPHON</p>
              <ul className="space-y-3 font-mono text-[0.72rem] text-mute">
                <li>Type — Inter Tight · Instrument Serif · JetBrains Mono</li>
                <li>Built with React, Three.js, GSAP &amp; Lenis</li>
                <li>Respects prefers-reduced-motion</li>
              </ul>
              <button
                onClick={() => scrollTo('#top')}
                className="mt-7 inline-flex items-center gap-2 font-mono text-micro uppercase tracking-[0.14em] text-char link-line"
              >
                ↑ back to top
              </button>
            </Reveal>
          </div>
        </div>

        {/* baseline */}
        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-mute">
            © {new Date().getFullYear()} — no rights reserved. fork it.
          </p>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-mute">
            <span className="text-ember">●</span> runtime: the present moment
          </p>
        </div>
      </div>
    </footer>
  );
}
