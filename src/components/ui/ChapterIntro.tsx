import type { ReactNode } from 'react';
import { MaskLines, Reveal } from './Reveal';

interface Props {
  /** Kept for the anchor/ID contract and the nav, not rendered as a label. */
  index: string;
  titleLines: string[];
  /** step the display size down for long titles */
  size?: 'default' | 'compact';
  lede?: ReactNode;
  align?: 'left' | 'center';
}

/**
 * Chapter opener.
 *
 * Deliberately has NO eyebrow and NO "CH.01" meta row. Section-number
 * eyebrows are the single most recognisable AI-layout tell, and the
 * page already tells you where you are: the stage rail names the stage,
 * the nav tracks it, the footer indexes it. The headline is enough.
 *
 * Structure now comes from a hairline and generous space, not a label.
 */
export default function ChapterIntro({
  index, titleLines, lede, align = 'left', size = 'default',
}: Props) {
  const centered = align === 'center';
  return (
    <header
      data-chapter={index}
      className={`relative ${centered ? 'mx-auto max-w-measure text-center' : ''}`}
    >
      <MaskLines
        as="h2"
        lines={titleLines}
        className={`font-sans font-medium text-char ${
          size === 'compact'
            ? 'text-[clamp(1.75rem,1.1rem+2.2vw,3.1rem)] leading-[1.05] tracking-[-0.03em]'
            : 'text-h2'
        }`}
      />

      {lede && (
        <Reveal
          delay={0.12}
          className={`mt-7 max-w-prose text-lede text-ink/75 ${centered ? 'mx-auto' : ''}`}
        >
          {lede}
        </Reveal>
      )}
    </header>
  );
}
