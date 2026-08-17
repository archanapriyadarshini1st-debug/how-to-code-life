import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * Marquee
 *
 * Adapted from Watermelon UI's `marquee` (MIT, ui.watermelon.sh). Changes:
 *   - duration is a token-driven CSS var rather than three hardcoded presets
 *   - respects prefers-reduced-motion by pausing rather than disappearing
 *   - `aria-hidden` by default: a looping strip of text is decoration to a
 *     screen reader, and the same words are always available as real content
 *     nearby
 *
 * Used exactly ONCE on this page (taste-skill: marquee max one per page).
 */
interface Props extends ComponentPropsWithoutRef<'div'> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  repeat?: number;
  /** seconds for one full pass */
  duration?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  repeat = 3,
  duration = 48,
  ...props
}: Props) {
  return (
    <div
      {...props}
      aria-hidden
      className={cn(
        'group flex w-full max-w-full flex-row overflow-x-clip [--gap:3rem] [gap:var(--gap)]',
        className,
      )}
      style={{ ['--mq-duration' as string]: `${duration}s` }}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 flex-row items-center justify-around [gap:var(--gap)]',
            'motion-safe:animate-[mq_var(--mq-duration)_linear_infinite]',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
