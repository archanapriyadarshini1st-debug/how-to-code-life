import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from './ui/Button';
import { EASE } from '../lib/motion';
import { useReducedMotion, useIsMobile, useTypewriter, useAnnounce } from '../lib/hooks';
import { useSmoothScroll } from '../lib/SmoothScroll';

const Keyboard = lazy(() => import('./three/Keyboard'));

const LIFE_CODE = `const life = {
    choices,
    habits,
    failures,
    dreams
}`;

export default function Hero() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const { scrollTo } = useSmoothScroll();
  const announce = useAnnounce();
  const sectionRef = useRef<HTMLElement>(null);

  const [progress, setProgress] = useState(0);
  const [transformed, setTransformed] = useState(false);
  const [mounted3D, setMounted3D] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  useEffect(() => scrollYProgress.on('change', setProgress), [scrollYProgress]);

  // Defer the 3D canvas until idle → first paint stays fast, no CLS.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const cb = () => setMounted3D(true);
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(cb); return () => (window as unknown as { cancelIdleCallback?: (i: number) => void }).cancelIdleCallback?.(id); }
    const t = window.setTimeout(cb, 380);
    return () => window.clearTimeout(t);
  }, []);

  const { out: typed } = useTypewriter(LIFE_CODE, { speed: 18, delay: 900 });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-22%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const onYou = () => {
    setTransformed((v) => {
      const next = !v;
      announce(next ? 'Interface transformed from code to life.' : 'Interface returned to code.');
      return next;
    });
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Your life is code"
      className="relative min-h-[100svh] w-full overflow-hidden bg-paper grain"
     
    >
      {/* ── 3D LAYER ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 lg:left-[38%]">
          {mounted3D && (
            <Suspense fallback={null}>
              <div className="pointer-events-auto h-full w-full">
                <Keyboard progress={progress} transformed={transformed} onYouPress={onYou} />
              </div>
            </Suspense>
          )}
        </div>
        {/* legibility scrim behind copy on small screens */}
        <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/72 to-paper/92 lg:hidden" />
        <div className="absolute inset-y-0 left-0 hidden w-[52%] bg-gradient-to-r from-paper via-paper/90 to-transparent lg:block" />
      </div>

      {/* ── COPY LAYER ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 flex min-h-[100svh] items-center pb-24 pt-[calc(var(--nav-h)+3rem)]"
      >
        <div className="shell grid w-full items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            {/* status line */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mb-8 flex flex-wrap items-center gap-3"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-60" style={{ animationDuration: '2.4s' }} />
                <span className="relative inline-flex size-1.5 rounded-full bg-ember" />
              </span>
              <span className="eyebrow">RUNTIME · THE PRESENT MOMENT</span>
            </motion.div>

            <h1 className="font-sans text-h1 font-medium uppercase text-char">
              {['YOUR LIFE', 'IS CODE.'].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                  <motion.span
                    className="block"
                    initial={reduced ? { opacity: 0 } : { y: '108%' }}
                    animate={reduced ? { opacity: 1 } : { y: '0%' }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.2 + i * 0.1 }}
                  >
                    {i === 1 ? (
                      <>IS <span className="font-display italic normal-case tracking-[-0.02em] text-ember">code</span>.</>
                    ) : line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.62 }}
              className="mt-8 max-w-md text-lede text-ink/75"
            >
              You're already writing it.<br />
              You just haven't learned<br className="hidden sm:block" /> the syntax.
            </motion.p>

            {/* live code element */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.8 }}
              className="mt-10 max-w-sm"
            >
              <div className="rounded-lg border border-line bg-[#141311] p-4 shadow-lift sm:p-5">
                <pre className="overflow-x-auto font-mono text-[0.78rem] leading-[1.85] text-[#DDD8CE] sm:text-[0.82rem]">
                  <code>
                    {typed.split('\n').map((ln, i, arr) => (
                      <div key={i} className="whitespace-pre">
                        {ln
                          .replace(/^(\s*)(const)\b/, '$1\u0000$2\u0000')
                          .split('\u0000')
                          .map((part, j) =>
                            part === 'const'
                              ? <span key={j} className="font-medium text-[#E08A54]">{part}</span>
                              : <span key={j} className={/^\s*(choices|habits|failures|dreams),?$/.test(part) ? 'text-[#C8C2B6]' : ''}>{part}</span>,
                          )}
                        {i === arr.length - 1 && (
                          <span className="ml-px inline-block h-[1.05em] w-[0.52em] translate-y-[0.16em] bg-ember animate-blink" />
                        )}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 1 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button variant="primary" size="lg" onClick={() => scrollTo('#chapter-01')}>
                START THE PROGRAM
                <span aria-hidden className="transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
              </Button>
              <Button variant="ghost" onClick={() => scrollTo('#stages')}>
                SCROLL TO DEBUG
                <span aria-hidden className="transition-transform duration-300 ease-out group-hover:translate-y-0.5">↓</span>
              </Button>
            </motion.div>
          </div>

        </div>
      </motion.div>

      {/* ── keyboard affordance for keyboard/touch users ── */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 lg:left-auto lg:right-gutter lg:translate-x-0">
        <button
          onClick={onYou}
          aria-pressed={transformed}
          className="group flex items-center gap-3 rounded-full border border-line bg-paper/85 px-4 py-2.5 backdrop-blur transition-colors hover:border-char/30"
          data-cursor="key"
          data-cursor-label="PRESS"
        >
          <kbd className={`rounded-xs px-2 py-1 font-mono text-[0.67rem] tracking-[0.1em] shadow-key transition-colors ${
            transformed ? 'bg-ember text-white' : 'bg-char text-paper'}`}>
            YOU
          </kbd>
          <span className="font-mono text-micro uppercase tracking-[0.14em] text-mute">
            {transformed ? 'LIFE' : 'CODE'} → {transformed ? 'CODE' : 'LIFE'}
          </span>
        </button>
      </div>

      {/* scroll indicator */}
      {!isMobile && (
        <motion.div
          aria-hidden
          className="absolute bottom-8 left-gutter z-20 hidden items-center gap-3 lg:flex"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
        >
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <motion.span
              className="absolute inset-x-0 top-0 h-3 bg-ember"
              animate={reduced ? {} : { y: ['-100%', '400%'] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
          <span className="font-mono text-micro uppercase tracking-[0.16em] text-mute">scroll</span>
        </motion.div>
      )}
    </section>
  );
}
