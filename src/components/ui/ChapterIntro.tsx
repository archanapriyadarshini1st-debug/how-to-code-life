import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MaskLines, Reveal } from './Reveal';
import { EASE } from '../../lib/motion';

interface Props {
  index: string;          // "01"
  kicker: string;         // "VARIABLES"
  titleLines: string[];   // ["WHAT ARE YOU", "MADE OF?"]
  /** step the display size down for long titles */
  size?: 'default' | 'compact';
  lede?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
}

/**
 * The consistent chapter opener. Same rhythm every time — the
 * repetition is what makes the site read like a book, not a deck.
 */
export default function ChapterIntro({
  index, kicker, titleLines, lede, align = 'left', tone = 'light', size = 'default',
}: Props) {
  const centered = align === 'center';
  return (
    <header className={`relative ${centered ? 'mx-auto max-w-measure text-center' : ''}`}>
      {/* meta row */}
      <Reveal className={`mb-7 flex items-center gap-4 ${centered ? 'justify-center' : ''}`}>
        <span className={`font-mono text-micro tracking-[0.2em] ${tone === 'dark' ? 'text-ember' : 'text-ember'}`}>
          CH.{index}
        </span>
        <motion.span
          aria-hidden
          className="h-px bg-line"
          initial={{ width: 0 }}
          whileInView={{ width: centered ? 44 : 64 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        />
        <span className="eyebrow">{kicker}</span>
      </Reveal>

      <MaskLines
        as="h2"
        lines={titleLines}
        className={`font-sans font-medium uppercase text-char ${
          size === 'compact'
            ? 'text-[clamp(1.75rem,1.1rem+2.2vw,3.25rem)] leading-[1.03] tracking-[-0.03em]'
            : 'text-h2'
        }`}
        delay={0.05}
      />

      {lede && (
        <Reveal delay={0.18} className={`mt-8 max-w-prose text-lede text-ink/80 ${centered ? 'mx-auto' : ''}`}>
          {lede}
        </Reveal>
      )}
    </header>
  );
}
