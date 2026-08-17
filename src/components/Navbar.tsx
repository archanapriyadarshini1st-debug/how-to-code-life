import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { EASE } from '../lib/motion';
import { useSmoothScroll } from '../lib/SmoothScroll';
import { useScrollLock, useMagnetic } from '../lib/hooks';

const LINKS = [
  { label: 'Concept', href: '#concept' },
  { label: 'Chapters', href: '#stages' },
  { label: 'Playground', href: '#playground' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  const { scrollTo } = useSmoothScroll();
  const { scrollY, scrollYProgress } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');
  const [onDark, setOnDark] = useState(false);
  const last = useRef(0);
  const ctaRef = useMagnetic<HTMLSpanElement>(0.3);

  useScrollLock(open);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setCondensed(y > 60);
    // hide on scroll-down, reveal on scroll-up - never traps the user
    if (!open) setHidden(y > 420 && y > last.current && y - last.current > 4);
    last.current = y;
  });

  // Scroll-spy. IntersectionObserver alone is ambiguous when several
  // sections straddle the viewport, so we pick the one covering a fixed
  // probe line - deterministic, and it matches what the user is reading.
  useEffect(() => {
    const ids = ['concept', 'stages', 'playground', 'about'];
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = window.innerHeight * 0.4;
      let best = '';
      let bestTop = -Infinity;
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        // section covers the probe line, or is the last one passed
        if (r.top <= probe && r.top > bestTop) { bestTop = r.top; best = '#' + id; }
      });
      setActive(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Detect whether the bar sits over a dark section → invert its colours.
  useEffect(() => {
    const darkIds = ['stages', 'chapter-04', 'chapter-07', 'final'];
    const check = () => {
      const probeY = 34; // just under the top edge of the bar
      const hit = darkIds.some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= probeY && r.bottom >= probeY;
      });
      setOnDark(hit);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  // Esc closes mobile menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (href: string) => { setOpen(false); window.setTimeout(() => scrollTo(href, { offset: -70 }), open ? 260 : 0); };

  return (
    <>
      {/* progress hairline */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-ember"
        style={{ scaleX: scrollYProgress }}
      />

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-0 z-40"
      >
        <nav
          aria-label="Primary"
          className={`shell flex items-center justify-between transition-all duration-500 ease-out ${
            condensed ? 'py-3' : 'py-5'
          }`}
        >
          {/* LOGO */}
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); go('#top'); }}
            className="group relative flex items-center gap-3 rounded-sm"
            aria-label="How to code life, back to top"
          >
            <motion.span
              animate={{ scale: condensed ? 0.9 : 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className={`origin-left font-mono text-micro font-medium uppercase leading-[1.25] tracking-[0.1em] transition-colors duration-500 ${onDark ? 'text-paper' : 'text-char'}`}
            >
              HOW TO<br />CODE LIFE{' '}
              <span className="inline-block text-ember transition-transform duration-500 ease-spring group-hover:rotate-[18deg]">:)</span>
            </motion.span>
          </a>

          {/* DESKTOP LINKS - pill container that materialises on scroll */}
          <div className="hidden items-center gap-1 md:flex">
            <motion.div
              className="flex items-center gap-1 rounded-full border px-1.5 py-1.5 transition-colors duration-500"
              animate={{
                backgroundColor: condensed
                  ? (onDark ? 'rgba(24,23,21,0.72)' : 'rgba(247,245,241,0.82)')
                  : 'rgba(247,245,241,0)',
                borderColor: condensed
                  ? (onDark ? 'rgba(255,255,255,0.14)' : 'rgb(214 209 199)')
                  : 'rgba(214,209,199,0)',
              }}
              style={{ backdropFilter: condensed ? 'blur(14px)' : 'none' }}
            >
              {LINKS.map((l) => {
                const on = active === l.href;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={(e) => { e.preventDefault(); go(l.href); }}
                    aria-current={on ? 'true' : undefined}
                    className="relative rounded-full px-4 py-2 font-mono text-micro uppercase tracking-[0.12em] transition-colors duration-300"
                  >
                    {on && (
                      <motion.span
                        layoutId="nav-pill"
                        className={`absolute inset-0 rounded-full ${onDark ? 'bg-paper' : 'bg-char'}`}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors ${on ? (onDark ? 'text-char' : 'text-paper') : (onDark ? 'text-paper/60 hover:text-paper' : 'text-mute hover:text-char')}`}>
                      {l.label}
                    </span>
                  </a>
                );
              })}
            </motion.div>

            <span ref={ctaRef} className="ml-2 inline-block will-change-transform">
              <a
                href="#chapter-05"
                onClick={(e) => { e.preventDefault(); go('#chapter-05'); }}
                className={`btn group px-5 py-2.5 text-micro ${onDark ? 'btn-ember' : 'btn-primary'}`}
              >
                START DEBUGGING
                <span aria-hidden className="transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
              </a>
            </span>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            className={`relative z-50 flex size-11 items-center justify-center rounded-full border backdrop-blur transition-colors md:hidden ${
              open || !onDark ? 'border-line bg-paper/80' : 'border-white/15 bg-char/70'
            }`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="relative block h-3 w-4">
              <motion.span
                className={`absolute left-0 block h-px w-full transition-colors ${open || !onDark ? 'bg-char' : 'bg-paper'}`}
                animate={{ top: open ? 5.5 : 1, rotate: open ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
              <motion.span
                className={`absolute left-0 block h-px w-full transition-colors ${open || !onDark ? 'bg-char' : 'bg-paper'}`}
                animate={{ top: open ? 5.5 : 10, rotate: open ? -45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </span>
          </button>
        </nav>
      </motion.header>

      {/* MOBILE SHEET - designed for mobile, not a shrunken desktop nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-paper md:hidden"
          >
            <motion.div
              className="flex h-full flex-col justify-between px-gutter pb-12 pt-28"
              initial="hidden" animate="show" exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
            >
              <ul className="space-y-1">
                {LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="overflow-hidden border-b border-line"
                  >
                    <a
                      href={l.href}
                      onClick={(e) => { e.preventDefault(); go(l.href); }}
                      className="flex items-baseline justify-between py-5"
                    >
                      <span className="font-sans text-[2rem] font-medium uppercase leading-none tracking-tight text-char">
                        {l.label}
                      </span>
                      <span className="font-mono text-micro text-mute">0{i + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: EASE }}>
                <a
                  href="#chapter-05"
                  onClick={(e) => { e.preventDefault(); go('#chapter-05'); }}
                  className="btn btn-primary w-full"
                >
                  START DEBUGGING <span aria-hidden>→</span>
                </a>
                <p className="mt-6 font-mono text-micro uppercase tracking-[0.14em] text-mute">
                  Built by curiosity. Debugged by experience.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
