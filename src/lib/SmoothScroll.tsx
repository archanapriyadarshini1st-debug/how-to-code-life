import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './hooks';

gsap.registerPlugin(ScrollTrigger);

type Ctx = { lenis: Lenis | null; scrollTo: (t: string | number, o?: object) => void; velocity: number };
const ScrollCtx = createContext<Ctx>({ lenis: null, scrollTo: () => {}, velocity: 0 });
export const useSmoothScroll = () => useContext(ScrollCtx);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [, force] = useState(0);
  const velRef = useRef(0);

  useEffect(() => {
    // Reduced motion → native scroll, no interpolation. Still fully usable.
    if (reduced) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      document.documentElement.style.removeProperty('scroll-behavior');
      ScrollTrigger.refresh();
      force((n) => n + 1);
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false, // native momentum on touch = better mobile feel
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: { velocity: number }) => {
      velRef.current = e.velocity;
      document.documentElement.style.setProperty(
        '--scroll-vel',
        String(Math.max(-1, Math.min(1, e.velocity / 30))),
      );
      ScrollTrigger.update();
    });

    // Drive Lenis from GSAP's ticker → one rAF loop for the whole site.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(500, 33);

    force((n) => n + 1);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Keep ScrollTrigger honest when fonts/images change layout.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  const scrollTo = (target: string | number, o: object = {}) => {
    const lenis = lenisRef.current;
    if (lenis) { lenis.scrollTo(target, { offset: -8, duration: 1.25, ...o }); return; }
    // Fallback path (reduced motion): native, instant-ish, still accessible.
    if (typeof target === 'number') { window.scrollTo({ top: target }); return; }
    document.querySelector(target)?.scrollIntoView({ block: 'start' });
  };

  return (
    <ScrollCtx.Provider value={{ lenis: lenisRef.current, scrollTo, velocity: velRef.current }}>
      {children}
    </ScrollCtx.Provider>
  );
}
