import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { MaskedLine } from "@/components/Reveal";

const HERO_IMG = "https://images.unsplash.com/photo-1751970046974-6d5a27f23ce1?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000";

const Stats = [
  { v: "$340,000", l: "swing per $2/t of freight" },
  { v: "170,000 t", l: "one Capesize voyage" },
  { v: "7", l: "East Coast ports screened" },
  { v: "8 wk", l: "forecast horizon, P10–P90" },
];

const MiniBand = () => (
  <svg viewBox="0 0 240 90" className="w-full h-auto">
    <path d="M0,62 L30,58 L60,64 L90,50 L120,55" fill="none" stroke="#94A3B8" strokeWidth="1.6" />
    <path d="M120,55 L150,44 L180,38 L210,34 L240,28" fill="none" stroke="#FFB800" strokeWidth="1.8" />
    <path d="M120,55 L150,38 L180,28 L210,22 L240,14 L240,44 L210,48 L180,50 L150,52 L120,58 Z" fill="rgba(0,240,255,0.12)" />
    <path d="M120,55 L150,38 L180,28 L210,22 L240,14" fill="none" stroke="rgba(0,240,255,0.55)" strokeWidth="1" strokeDasharray="3 3" />
    <path d="M120,55 L150,52 L180,50 L210,48 L240,44" fill="none" stroke="rgba(0,240,255,0.55)" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="120" y1="8" x2="120" y2="82" stroke="rgba(241,245,249,0.25)" strokeDasharray="2 4" />
  </svg>
);

const Stat = ({ v, l, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className="border-l border-white/10 pl-4"
  >
    <div className="font-mono text-xl md:text-2xl font-semibold text-slate-100 tabular">{v}</div>
    <div className="mono-label mt-1.5 normal-case tracking-[0.08em] text-dim">{l}</div>
  </motion.div>
);

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col overflow-hidden noise" data-testid="hero-section">
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
        <img
          src={HERO_IMG}
          alt="Bulk carrier at sea, aerial view"
          className="h-full w-full object-cover [filter:saturate(0.35)_brightness(0.42)_contrast(1.15)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/78 to-ink-900/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-ink-900/70" />
      </motion.div>

      <div className="absolute inset-0 grid-overlay opacity-60" />
      <div className="absolute inset-0 glow-rad" />

      {/* Radar Graphic */}
      <div className="absolute right-[8%] top-[18%] hidden lg:block h-40 w-40 opacity-70">
        <div className="absolute inset-0 rounded-full border border-radar/25" />
        <div className="absolute inset-6 rounded-full border border-radar/20" />
        <div className="absolute inset-12 rounded-full border border-radar/15" />
        <div
          className="absolute inset-0 rounded-full radar-sweep"
          style={{ background: "conic-gradient(from 0deg, rgba(0,240,255,0.25) 0deg, rgba(0,240,255,0) 70deg)" }}
        />
        <span className="absolute left-1/2 top-1/3 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-beacon animate-ping" />
      </div>

      <div className="relative flex-1 flex items-center mx-auto w-full max-w-7xl px-5 md:px-8 pt-28 pb-16">
        <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
          <div className="lg:col-span-8">
            <MaskedLine delay={0.15}>
              <p className="mono-label text-radar mb-6">
                Novex Hackathon 2026 · Team Code Hunters · Logistics & Supply Chain
              </p>
            </MaskedLine>

            <h1 className="font-display font-black leading-[0.95] tracking-tight text-[13.5vw] sm:text-7xl lg:text-[6.2rem]">
              <MaskedLine delay={0.28}>Book now,</MaskedLine>
              <MaskedLine delay={0.42}>
                <span className="text-outline-beacon">or wait?</span>
              </MaskedLine>
            </h1>

            <MaskedLine delay={0.6}>
              <p className="mt-7 max-w-xl text-fog text-base md:text-lg leading-relaxed">
                FreightIQ turns the riskiest call in spot chartering into a calibrated decision — an 8-week forecast range per ship class, port feasibility screening, and a book-now vs wait verdict with worst-case cost explained.
              </p>
            </MaskedLine>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/console"
                data-testid="hero-launch-console-button"
                className="group rounded-full bg-beacon px-7 py-3.5 text-sm font-semibold text-ink-900 transition-transform hover:scale-[1.03] active:scale-95"
              >
                Launch the Console
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#record"
                data-testid="hero-explore-backtest-button"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.__lenis) {
                    window.__lenis.scrollTo("#record", { offset: -72 });
                  } else {
                    document.querySelector("#record")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="rounded-full hairline px-7 py-3.5 text-sm font-medium text-slate-200 hover:border-radar/40 hover:text-white transition-colors"
              >
                Explore the backtest record
              </a>
            </motion.div>
          </div>

          <motion.div style={{ y: cardY }} className="hidden lg:block lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="card-sheen hairline rounded-2xl bg-ink-800/70 backdrop-blur-md p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="mono-label text-slate-300">Decision · Paradip</p>
                <span className="rounded-full bg-beacon/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-beacon">
                  150,000 T · 6 WK
                </span>
              </div>

              <MiniBand />

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="font-mono text-2xl font-bold text-beacon tabular">BOOK NOW</div>
                  <div className="mono-label mt-1 normal-case tracking-[0.06em]">
                    wait does not clear the 1% bar
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-mint tabular">−0.55%</div>
                  <div className="mono-label normal-case tracking-[0.06em]">vs naive</div>
                </div>
              </div>

              <div className="mt-4 border-t border-white/[0.07] pt-3 font-mono text-[11px] text-dim tabular">
                capesize @ paradip · part-loaded ≈135,000 t usable
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="relative border-t border-white/[0.07] bg-ink-900/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Stats.map((s, i) => (
            <Stat key={s.v} v={s.v} l={s.l} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
