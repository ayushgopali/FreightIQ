import React, { useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import Landing from "@/pages/Landing";
import ErrorBoundary from "@/components/ErrorBoundary";

const Console = React.lazy(() => import("@/pages/Console"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SmoothScroll />
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-[#0B0F1A]" />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/console" element={<Console />} />
            <Route path="/decide" element={<Console initialTab="decide" />} />
            <Route path="/ports" element={<Console initialTab="port-screen" />} />
            <Route path="/evidence" element={<Console initialTab="backtest" />} />
            <Route path="/method" element={<Console initialTab="methodology" />} />
            <Route path="/methodology" element={<Console initialTab="methodology" />} />
            <Route path="/demo" element={<Console initialTab="time-machine" />} />
            <Route path="/brief" element={<Console initialTab="methodology" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
