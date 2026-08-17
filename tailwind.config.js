/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // ── SPACING SYSTEM ────────────────────────────────────────────
    // 4px base, editorial rhythm. Named steps prevent one-off values.
    extend: {
      colors: {
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        veil: 'rgb(var(--c-veil) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        char: 'rgb(var(--c-char) / <alpha-value>)',
        ember: 'rgb(var(--c-ember) / <alpha-value>)',
        emberSoft: 'rgb(var(--c-ember-soft) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Tight Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // fluid editorial scale
        micro: ['0.7rem', { lineHeight: '1.3', letterSpacing: '0.14em' }],
        label: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
        body: ['clamp(0.975rem, 0.93rem + 0.22vw, 1.125rem)', { lineHeight: '1.62' }],
        lede: ['clamp(1.15rem, 1rem + 0.7vw, 1.6rem)', { lineHeight: '1.45' }],
        h3: ['clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h2: ['clamp(2rem, 1.4rem + 2.8vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        h1: ['clamp(2.75rem, 1.2rem + 7vw, 9.5rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        mega: ['clamp(3.25rem, 0.5rem + 11vw, 15rem)', { lineHeight: '0.84', letterSpacing: '-0.05em' }],
      },
      spacing: {
        gutter: 'var(--gutter)',
        section: 'clamp(6rem, 12vh, 11rem)',
      },
      maxWidth: { shell: '96rem', prose: '38rem', measure: '52rem' },
      borderRadius: { xs: '3px', sm: '6px', md: '10px', lg: '16px', xl: '24px' },
      boxShadow: {
        lift: '0 1px 2px rgb(18 17 15 / 0.04), 0 8px 24px -12px rgb(18 17 15 / 0.14)',
        raise: '0 2px 4px rgb(18 17 15 / 0.05), 0 24px 60px -28px rgb(18 17 15 / 0.28)',
        inset: 'inset 0 1px 0 rgb(255 255 255 / 0.6)',
        key: '0 1px 0 rgb(18 17 15/0.16), 0 3px 0 -1px rgb(18 17 15/0.08), 0 6px 14px -6px rgb(18 17 15/0.25)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        drift: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(1000%)' } },
        dash: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        blink: 'blink 1.05s steps(1) infinite',
        drift: 'drift 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
