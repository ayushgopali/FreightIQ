import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import DecidePanel from "@/components/console/DecidePanel";
import PortScreenPanel from "@/components/console/PortScreenPanel";
import BacktestPanel from "@/components/console/BacktestPanel";
import TimeMachinePanel from "@/components/console/TimeMachinePanel";
import { getMeta } from "@/lib/api";

const TABS = [
  { id: "decide", label: "Decide" },
  { id: "port-screen", label: "Port Screen" },
  { id: "backtest", label: "Backtest" },
  { id: "time-machine", label: "Time Machine" },
];

export default function Console() {
  const [tab, setTab] = useState("decide");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    getMeta().then(setMeta).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-ink-900 text-slate-100">
      <header className="sticky top-0 z-40 bg-ink-900/90 backdrop-blur-md border-b border-white/[0.07]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="hidden md:inline-block rounded-full border border-beacon/40 bg-beacon/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-beacon uppercase">
              Synthetic data
            </span>
          </div>
          <Link
            to="/"
            data-testid="nav-landing-link"
            className="text-[13px] text-fog hover:text-slate-100 transition-colors"
          >
            Back to site
          </Link>
        </div>
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`console-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                tab === t.id ? "text-slate-100" : "text-dim hover:text-fog"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <motion.span
                  layoutId="console-tab-underline"
                  className="absolute inset-x-3 -bottom-px h-0.5 bg-beacon rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-10">
        {!meta && <p className="mono-label">Booting engine…</p>}
        {meta && tab === "decide" && <DecidePanel meta={meta} />}
        {meta && tab === "port-screen" && <PortScreenPanel meta={meta} />}
        {tab === "backtest" && <BacktestPanel />}
        {meta && tab === "time-machine" && <TimeMachinePanel meta={meta} />}
      </main>
    </div>
  );
}
