import { lazy, Suspense } from 'react';
import { SmoothScroll } from './lib/SmoothScroll';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Concept from './components/Concept';
import StageRail from './components/StageRail';
import VariableVisualizer from './components/chapters/VariableVisualizer';
import ConditionTree from './components/chapters/ConditionTree';
import LoopVisualizer from './components/chapters/LoopVisualizer';

/* Below-the-fold acts are split - the hero owns the first paint budget. */
const ErrorState   = lazy(() => import('./components/chapters/ErrorState'));
const Debugger     = lazy(() => import('./components/chapters/Debugger'));
const GitTimeline  = lazy(() => import('./components/chapters/GitTimeline'));
const DeploySection= lazy(() => import('./components/chapters/DeploySection'));
const LifeCompiler = lazy(() => import('./components/LifeCompiler'));
const FinalCTA     = lazy(() => import('./components/FinalCTA'));
const Footer       = lazy(() => import('./components/Footer'));

/** Reserves height so lazy boundaries never cause layout shift. */
const Hold = ({ h = '60svh' }: { h?: string }) => <div style={{ minHeight: h }} aria-hidden />;

export default function App() {
  return (
    <SmoothScroll>
      <a href="#main" className="sr-only-focusable btn btn-primary fixed left-4 top-4 z-[110]">
        Skip to content
      </a>
      <div id="a11y-live" aria-live="polite" aria-atomic="true" className="sr-only" />

      <Navbar />

      <main id="main">
        <Hero />
        <Concept />
        <StageRail />
        <VariableVisualizer />
        <ConditionTree />
        <LoopVisualizer />

        {/* One boundary per section, each reserving a realistic height, so
            mounting a lazy chunk never shifts the content below it. */}
        <Suspense fallback={<Hold h="100svh" />}><ErrorState /></Suspense>
        <Suspense fallback={<Hold h="100svh" />}><Debugger /></Suspense>
        <Suspense fallback={<Hold h="120svh" />}><GitTimeline /></Suspense>
        <Suspense fallback={<Hold h="190svh" />}><DeploySection /></Suspense>
        <Suspense fallback={<Hold h="110svh" />}><LifeCompiler /></Suspense>
        <Suspense fallback={<Hold h="90svh" />}><FinalCTA /></Suspense>
      </main>

      <Suspense fallback={<Hold h="78svh" />}>
        <Footer />
      </Suspense>
    </SmoothScroll>
  );
}
