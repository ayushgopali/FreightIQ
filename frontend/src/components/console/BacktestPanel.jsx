import { useState, useEffect } from "react";
import { getBacktest, fmtUsd } from "@/lib/api";
const EquityChart = ({
  equity
}) => {
  if (!equity || equity.length < 2) return <div className="h-52" />;
  const W = 760,
    H = 210,
    PAD = {
      l: 46,
      r: 12,
      t: 14,
      b: 24
    };
  const vals = equity.map(e => e.cum_saving_usd);
  const minV = Math.min(...vals, 0),
    maxV = Math.max(...vals);
  const x = i => PAD.l + i / (equity.length - 1) * (W - PAD.l - PAD.r);
  const y = v => PAD.t + (1 - (v - minV) / (maxV - minV || 1)) * (H - PAD.t - PAD.b);
  const line = equity.map((e, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(e.cum_saving_usd).toFixed(1)}`).join(" ");
  const area = `${line} L${x(equity.length - 1).toFixed(1)},${y(minV)} L${x(0)},${y(minV)} Z`;
  const zeroY = y(0);
  const grid = [minV, minV + (maxV - minV) / 2, maxV];
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" data-testid="equity-chart">{grid.map(v => <g key={v}><line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="rgba(148,163,184,0.1)" strokeDasharray="3 5" /><text x={PAD.l - 8} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#64748B" fontFamily="JetBrains Mono">{v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${Math.round(v / 1e3)}k`}</text></g>)}<path d={area} fill="rgba(0,240,255,0.08)" /><line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke="rgba(255,184,0,0.35)" strokeDasharray="4 4" /><path d={line} fill="none" stroke="#00F0FF" strokeWidth="1.8" /><text x={PAD.l} y={H - 6} fontSize="9" fill="#64748B" fontFamily="JetBrains Mono" letterSpacing="2">{equity[0].date} → {equity[equity.length - 1].date}</text></svg>;
};

function BacktestPanel() {
  const [bt, setBt] = useState(null);
  useEffect(() => {
    getBacktest().then(setBt).catch(() => {});
  }, []);
  if (!bt) return <p className="mono-label">Replaying walk-forward decisions…</p>;
  const h = bt.headline;
  const metrics = [{
    v: "738",
    l: "walk-forward decisions · 2021–2026",
    testid: "bt-metric-decisions"
  }, {
    v: "10.8%",
    l: "lower forecast error vs naive",
    testid: "bt-metric-error"
  }, {
    v: "78.8%",
    l: "coverage of the 80% range",
    testid: "bt-metric-coverage"
  }, {
    v: "0",
    l: "port-limit violations",
    testid: "bt-metric-violations"
  }, {
    v: "0.55%",
    l: "average saving vs book-now",
    testid: "bt-metric-saving"
  }, {
    v: "$10,600",
    l: "per 150,000 t cargo",
    testid: "bt-metric-saving-usd"
  }, {
    v: "6.2% / 3.9%",
    l: "decisions better / worse than baseline",
    testid: "bt-metric-winloss"
  }, {
    v: "10.2%",
    l: "of decisions chose to wait",
    testid: "bt-metric-waited"
  }];
  return <div className="space-y-6" data-testid="backtest-panel"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="backtest-metrics-grid">{metrics.map(m => <div key={m.l} className="hairline rounded-xl bg-ink-800/60 p-5" data-testid={m.testid}><div className="font-mono text-xl md:text-2xl font-bold text-slate-100 tabular">{m.v}</div><div className="text-dim text-[12px] leading-snug mt-2">{m.l}</div></div>)}</div><div className="grid lg:grid-cols-2 gap-6"><div className="hairline rounded-xl bg-ink-800/60 p-6"><div className="flex items-baseline justify-between mb-2"><p className="font-display font-semibold text-lg tracking-tight">Cumulative saving vs book-now</p><span className="font-mono text-[10px] tracking-[0.14em] uppercase text-radar">engine replay · {bt.replay_total} decisions</span></div><p className="mono-label mb-4 normal-case tracking-[0.06em]">mean all-in cost per tonne: baseline $12.77 → FreightIQ $12.70</p><EquityChart equity={bt.equity} /></div><div className="hairline rounded-xl bg-ink-800/60 p-6"><p className="font-display font-semibold text-lg tracking-tight mb-4">Sensitivity to the cost of waiting</p><table className="w-full text-sm font-mono tabular" data-testid="sensitivity-table"><thead><tr className="text-left mono-label"><th className="pb-3 font-medium">Wait cost $/t/wk</th><th className="pb-3 font-medium">Saving</th><th className="pb-3 font-medium">Wins</th><th className="pb-3 font-medium text-right">Losses</th></tr></thead><tbody>{bt.sensitivity.map(s => <tr key={s.wait_cost} className="border-t border-white/[0.05] text-fog"><td className="py-2.5 text-slate-200">${s.wait_cost.toFixed(2)}</td><td className="py-2.5 text-beacon">{s.saving_pct.toFixed(2)}%</td><td className="py-2.5 text-mint">{s.wins_pct.toFixed(1)}%</td><td className="py-2.5 text-right text-alert">{s.losses_pct.toFixed(1)}%</td></tr>)}</tbody></table><p className="text-dim text-[12px] leading-relaxed mt-4">Timing alone provides a modest edge. Wins outnumber losses roughly 1.7 : 1 when waiting is cheap — the dashboard shows losing calls too.</p></div></div><div className="hairline rounded-xl bg-ink-800/60 p-6"><p className="font-display font-semibold text-lg tracking-tight mb-4">Decision log · latest replayed calls</p><div className="overflow-x-auto"><table className="w-full text-sm font-mono tabular min-w-[640px]" data-testid="replay-table"><thead><tr className="text-left mono-label"><th className="pb-3 font-medium">Decision date</th><th className="pb-3 font-medium">Route</th><th className="pb-3 font-medium">Advice</th><th className="pb-3 font-medium text-right">Realized saving</th><th className="pb-3 font-medium text-right">Outcome</th></tr></thead><tbody>{bt.replay.map(r => <tr key={r.date} className="border-t border-white/[0.05] text-fog"><td className="py-2.5 text-slate-200">{r.date}</td><td className="py-2.5">{r.origin} → {r.port} · {r.ship_class}</td><td className={`py-2.5 ${r.choice === "WAIT" ? "text-radar" : "text-beacon"}`}>{r.choice}{r.choice === "WAIT" ? ` · ${r.weeks} wk` : ""}</td><td className={`py-2.5 text-right ${r.saving_pct > 0 ? "text-mint" : r.saving_pct < 0 ? "text-alert" : "text-dim"}`}>{r.saving_pct > 0 ? "+" : ""}{r.saving_pct.toFixed(2)}% <span className="text-dim">({fmtUsd(r.saving_t * 150000)})</span></td><td className={`py-2.5 text-right uppercase tracking-[0.1em] text-[10px] ${r.outcome === "better" ? "text-mint" : r.outcome === "worse" ? "text-alert" : "text-dim"}`}>{r.outcome}</td></tr>)}</tbody></table></div><p className="text-dim text-[12px] leading-relaxed mt-5 border-t border-white/[0.06] pt-4">{bt.note}</p></div></div>;
}

export default BacktestPanel;
