import { type ReactNode, useMemo } from 'react';

/* ── Minimal, dependency-free tokenizer. Enough for our pseudo-code,
      far lighter than shipping a full highlighter. ── */
const KEYWORDS = /\b(const|let|var|function|return|if|else|while|for|try|catch|throw|new|await|async|import|from|export|class|this|true|false|null|undefined|of|in|break|continue|typeof|do)\b/;

export type Tone = 'dark' | 'light';

function tokenize(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  // comment wins the whole tail
  const cIdx = line.indexOf('//');
  let body = line, comment = '';
  if (cIdx > -1) { body = line.slice(0, cIdx); comment = line.slice(cIdx); }

  const re = /("[^"]*"|'[^']*'|`[^`]*`|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*(?=\()|[A-Za-z_$][\w$]*|[{}()[\];,.]|\s+|[^\s])/g;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(body))) {
    const t = m[0];
    let cls = 'text-[#DDD8CE]';
    if (/^\s+$/.test(t)) { out.push(<span key={k++}>{t}</span>); continue; }
    if (/^["'`]/.test(t)) cls = 'text-[#9FBE8F]';
    else if (/^\d/.test(t)) cls = 'text-[#E2946A]';
    else if (KEYWORDS.test(t)) cls = 'text-[#E08A54] font-medium';
    else if (/^[A-Za-z_$][\w$]*$/.test(t) && body[re.lastIndex] === '(') cls = 'text-[#EFE9DE]';
    else if (/^[{}()[\];,.]$/.test(t)) cls = 'text-[#7C766B]';
    else if (/^[A-Za-z_$]/.test(t)) cls = 'text-[#C8C2B6]';
    out.push(<span key={k++} className={cls}>{t}</span>);
  }
  if (comment) out.push(<span key="c" className="text-[#6E6961] italic">{comment}</span>);
  return out;
}

interface Props {
  code: string;
  tone?: Tone;
  filename?: string;
  showLines?: boolean;
  caret?: boolean;
  highlight?: number[];
  className?: string;
  compact?: boolean;
}

export default function CodeBlock({
  code, tone = 'dark', filename, showLines = true, caret = false,
  highlight = [], className = '', compact = false,
}: Props) {
  const lines = useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);

  const shell = tone === 'dark'
    ? 'bg-[#141311] border-[#2A2724]'
    : 'bg-surface border-line';
  const gutter = tone === 'dark' ? 'text-[#4E4A44]' : 'text-mute/60';

  return (
    <figure className={`overflow-hidden rounded-lg border ${shell} ${className}`}>
      {filename && (
        <figcaption className={`flex items-center gap-2 border-b px-4 py-2.5 ${
          tone === 'dark' ? 'border-[#2A2724] bg-[#1A1815]' : 'border-line bg-veil'}`}>
          <span className="flex gap-1.5" aria-hidden>
            <i className="size-2 rounded-full bg-[#3C3833]" />
            <i className="size-2 rounded-full bg-[#3C3833]" />
            <i className="size-2 rounded-full bg-ember/70" />
          </span>
          <span className={`ml-1.5 font-mono text-micro tracking-[0.1em] ${
            tone === 'dark' ? 'text-[#8A847A]' : 'text-mute'}`}>
            {filename}
          </span>
        </figcaption>
      )}
      <pre className={`overflow-x-auto font-mono leading-[1.75] ${compact ? 'p-3.5 text-[0.72rem]' : 'p-4 text-[0.78rem] sm:p-5 sm:text-[0.84rem]'}`}>
        <code>
          {lines.map((ln, i) => (
            <div
              key={i}
              className={`flex ${highlight.includes(i) ? (tone === 'dark' ? 'bg-ember/[0.09] -mx-4 px-4 sm:-mx-5 sm:px-5' : 'bg-ember/[0.07] -mx-4 px-4') : ''}`}
            >
              {showLines && (
                <span className={`mr-4 hidden w-5 shrink-0 select-none text-right text-[0.7rem] tabular-nums sm:inline ${gutter}`}>
                  {i + 1}
                </span>
              )}
              <span className="min-w-0 flex-1 whitespace-pre">
                {ln.length ? tokenize(ln) : '\u00A0'}
                {caret && i === lines.length - 1 && (
                  <span className="ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.16em] bg-ember animate-blink" />
                )}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </figure>
  );
}
