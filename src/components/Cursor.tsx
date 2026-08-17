import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useIsCoarse } from '../lib/hooks';

/**
 * Bespoke cursor: a precise dot + a lagging ring that reads element intent
 * via [data-cursor]. Pointer-fine only; never shown on touch or reduced motion.
 */
export default function Cursor() {
  const reduced = useReducedMotion();
  const coarse = useIsCoarse();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<'idle' | 'link' | 'text' | 'drag' | 'key'>('idle');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced || coarse) {
      document.documentElement.classList.remove('has-cursor');
      return;
    }
    document.documentElement.classList.add('has-cursor');

    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!visible) setVisible(true);
      const t = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
      if (t) {
        setMode((t.dataset.cursor as typeof mode) || 'link');
        setLabel(t.dataset.cursorLabel || '');
      } else {
        const int = (e.target as HTMLElement)?.closest?.(
          'a,button,input,textarea,select,[role="button"],[tabindex]:not([tabindex="-1"])',
        );
        setMode(int ? 'link' : 'idle');
        setLabel('');
      }
    };
    const onOut = () => setVisible(false);
    const onOver = () => setVisible(true);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onOut);
    document.addEventListener('pointerenter', onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onOut);
      document.removeEventListener('pointerenter', onOver);
      document.documentElement.classList.remove('has-cursor');
    };
  }, [reduced, coarse, visible]);

  if (reduced || coarse) return null;

  const ringSize = mode === 'idle' ? 30 : mode === 'text' ? 8 : label ? 76 : 52;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms' }}>
      <div
        ref={ring}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-out"
        style={{
          width: ringSize, height: ringSize,
          borderColor: mode === 'idle' ? 'rgb(var(--c-mute) / 0.5)' : 'rgb(var(--c-ember))',
          background: label ? 'rgb(var(--c-ember))' : 'transparent',
          mixBlendMode: mode === 'idle' ? 'multiply' : 'normal',
        }}
      >
        {label && (
          <span className="whitespace-nowrap px-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white">
            {label}
          </span>
        )}
      </div>
      <div
        ref={dot}
        className="fixed left-0 top-0 rounded-full bg-char transition-opacity duration-200"
        style={{ width: 5, height: 5, opacity: mode === 'idle' ? 1 : 0 }}
      />
    </div>
  );
}
