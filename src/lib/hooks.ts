import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   prefers-reduced-motion — reactive, the whole site reads this
   ───────────────────────────────────────────────────────────── */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/* ── Media query hook (tablet / mobile branching, not just shrinking) ── */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsCoarse = () => useMediaQuery('(pointer: coarse)');

/* ─────────────────────────────────────────────────────────────
   Magnetic pointer attraction — physical button behaviour.
   Disabled on touch + reduced motion. rAF-batched, GPU transform.
   ───────────────────────────────────────────────────────────── */
export function useMagnetic<T extends HTMLElement>(strength = 0.32, radius = 90) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const coarse = useIsCoarse();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || coarse) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let active = false;

    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 || active) {
        raf = requestAnimationFrame(loop);
      } else {
        el.style.transform = '';
        raf = 0;
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(r.width, r.height) / 2 + radius;
      if (dist < reach) {
        active = true;
        const falloff = 1 - dist / reach;
        tx = dx * strength * falloff;
        ty = dy * strength * falloff;
      } else if (active) {
        active = false; tx = 0; ty = 0;
      }
      kick();
    };
    const onLeave = () => { active = false; tx = 0; ty = 0; kick(); };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onLeave, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [strength, radius, reduced, coarse]);

  return ref;
}

/* ── Subtle 3D tilt for cards. Respects reduced motion + touch. ── */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const coarse = useIsCoarse();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || coarse) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
        raf = 0;
      });
    };
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf); raf = 0;
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max, reduced, coarse]);

  return ref;
}

/* ─────────────────────────────────────────────────────────────
   Typewriter that respects reduced motion (instant when reduced)
   ───────────────────────────────────────────────────────────── */
export function useTypewriter(text: string, opts: { speed?: number; start?: boolean; delay?: number } = {}) {
  const { speed = 26, start = true, delay = 0 } = opts;
  const reduced = useReducedMotion();
  const [out, setOut] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) { setOut(''); setDone(false); return; }
    if (reduced) { setOut(text); setDone(true); return; }
    setOut(''); setDone(false);
    let i = 0;
    let timer: number;
    const startT = window.setTimeout(function tick() {
      timer = window.setInterval(() => {
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) { window.clearInterval(timer); setDone(true); }
      }, speed);
    }, delay);
    return () => { window.clearTimeout(startT); window.clearInterval(timer); };
  }, [text, speed, start, delay, reduced]);

  return { out, done };
}

/* ── Count-up numbers on view ── */
export function useCountUp(target: number, active: boolean, dur = 1200) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduced) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, dur, reduced]);
  return v;
}

/* ── Body scroll lock (mobile menu / modals) ── */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

/* ── Announce to screen readers ── */
export function useAnnounce() {
  return useCallback((msg: string) => {
    const el = document.getElementById('a11y-live');
    if (el) { el.textContent = ''; window.setTimeout(() => { el.textContent = msg; }, 40); }
  }, []);
}
