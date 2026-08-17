# HOW TO CODE LIFE :)

**Learn to code. Learn to think. Learn to build a life.**

An interactive editorial experience that uses programming as a working model for life —
not as a poster metaphor. Variables are choices. Functions are habits. Errors are part of
the program.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typechecks, then builds to dist/
npm run preview  # serve the production build
```

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript + Vite | fast HMR, strict typing, tiny config |
| Styling | Tailwind CSS v3 + CSS custom properties | tokens live in CSS, utilities compose them |
| Scroll | Lenis, driven by the GSAP ticker | one rAF loop for the whole site |
| Scroll narrative | GSAP ScrollTrigger | pinning + horizontal scrub |
| Component motion | Framer Motion | variants, layout animation, `whileInView` |
| 3D | Three.js + React Three Fiber + Drei | the hero keyboard |

No component library, no UI kit — every component here is purpose-built for this design
system. Dependencies were added only where they genuinely earned their bytes.

---

## Design system

Tokens are defined once in `src/styles/index.css` and consumed everywhere. There is no
one-off styling.

**Color** — warm paper (`#F7F5F1`) → charcoal (`#121110`), with a single ember accent
(`#C75824`) used sparingly for state, emphasis and wayfinding. No gradients, no glass,
no neon.

**Type** — three faces, each with one job:
- `Inter Tight` — display headlines and UI
- `Instrument Serif` — italic editorial counterpoint (the "human" voice)
- `JetBrains Mono` — code, labels, metadata (the "machine" voice)

All sizes are fluid `clamp()` steps declared in `tailwind.config.js` (`micro` → `mega`).

**Spacing / radius / shadow / motion** — all tokenised. Easing is a single shared curve
(`cubic-bezier(0.16, 1, 0.3, 1)`) mirrored in `src/lib/motion.ts` so CSS and JS animations
feel like one hand made them.

**Components** — `.btn` (3 variants × 3 sizes), `.card`, `.field`, `.chip`, `.eyebrow`,
`.link-line`, `.code-surface`.

---

## Architecture

```
src/
├─ styles/index.css        design tokens + component layer
├─ lib/
│  ├─ hooks.ts             reduced-motion, media queries, magnetic, tilt,
│  │                       typewriter, count-up, scroll-lock, SR announce
│  ├─ motion.ts            shared easing / duration / variants
│  └─ SmoothScroll.tsx     Lenis provider + GSAP ticker integration
├─ components/
│  ├─ ui/                  Button, CodeBlock, Reveal, ChapterIntro
│  ├─ three/Keyboard.tsx   the 3D hero object
│  ├─ Navbar, Hero, Concept, StageRail, LifeCompiler, FinalCTA, Footer, Cursor
│  └─ chapters/            VariableVisualizer, ConditionTree, LoopVisualizer,
│                          ErrorState, Debugger, GitTimeline, DeploySection
└─ App.tsx                 composition + lazy boundaries
```

Everything below the fold is `React.lazy`, and each `Suspense` fallback reserves height,
so measured **CLS is 0.000** at every breakpoint.

---

## The interactions actually work

| Chapter | What you can really do |
|---|---|
| Hero | Press the **YOU** key (in 3D or via the labelled button) to transform CODE → LIFE |
| Stages | 8-stage execution order, pinned horizontal scrub on desktop |
| 01 Variables | Six sliders that drive a live visualization and regenerate real config code |
| 02 Conditions | A branching runner with a genuine call stack you can walk and reset |
| 03 Loops | A play/pause loop that counts iterations; click any node to jump |
| 04 Errors | Expandable stack traces with an empowering turn |
| 05 Debugging | Find 3 bugs, choose the right patch — wrong answers explain themselves, then RUN |
| 06 Git | Interactive version graph, expandable commit log |
| 07 Deploy | A staged deployment console |
| Playground | The **Life Compiler**: four sentences → a real tokenized program, with copy |

The Life Compiler genuinely parses input — it extracts verbs, converts phrases to
camelCase identifiers and emits a program whose shape changes with what you type.

---

## Accessibility

- Semantic landmarks, one `<h1>`, ordered headings, skip link
- Full keyboard operation; visible `:focus-visible` rings everywhere
- `aria-expanded` / `aria-pressed` / `aria-current` on all stateful controls
- A polite live region announces compiler results, patches and branch changes
- **`prefers-reduced-motion` is honoured throughout**: Lenis is torn down for native
  scroll, GSAP pinning is skipped, the typewriter resolves instantly, the custom cursor
  is disabled, and every reveal degrades to a plain fade — with no loss of content
- No text below ~11px; contrast holds on both paper and charcoal surfaces

## Performance & responsive

- Three.js is isolated in its own lazy chunk — it never blocks first paint
- The 3D canvas mounts on `requestIdleCallback`; lower DPR, no shadows/AA on mobile
- Animations use GPU-friendly transforms; pointer handlers are rAF-batched and passive
- Verified at 320 / 390 / 768 / 834 / 1280 / 1440px: zero horizontal overflow, zero
  console errors, CLS 0.000
- Mobile is designed, not shrunk: the horizontal rail becomes a vertical list, the nav
  becomes a full-screen sheet with scroll-lock and Escape-to-close
