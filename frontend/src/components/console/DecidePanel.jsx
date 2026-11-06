import { useState, useCallback, useEffect } from "react";
import ForecastChart from "@/components/ForecastChart";
import { postDecide, postForecast, fmtRate, fmtPct, fmtUsd, fmtT } from "@/lib/api";
const Field = ({
  label,
  children
}) => <div><label className="mono-label block mb-2">{label}</label>{children}</div>;

const selectCls = "w-full rounded-lg border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-radar/50 transition-colors appearance-none";
const Pill = ({
  status
}) => {
  const map = {
    feasible: ["Feasible", "text-mint border-mint/40 bg-mint/10"],
    part_loaded: ["Part-loaded", "text-beacon border-beacon/40 bg-beacon/10"],
    blocked: ["Blocked", "text-alert border-alert/40 bg-alert/10"]
  };
  const [label, cls] = map[status] || map.feasible;
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.1em] uppercase ${cls}`}>{label}</span>;
};

function DecidePanel({
  meta
}) {
  const [params, setParams] = useState({
    cargo_t: 150000,
    port: "paradip",
    origin: "ZA-RBA",
    ship_class: "capesize",
    window_weeks: 6,
    wait_cost_per_t_week: 0.03
  });
  const [dec, setDec] = useState(null);
  const [fc, setFc] = useState(null);
  const [err, setErr] = useState(false);
  const run = useCallback(async p => {
    setErr(false);
    try {
      const [d, f] = await Promise.all([postDecide(p), postForecast({
        origin: p.origin,
        ship_class: p.ship_class
      })]);
      setDec(d);
      setFc(f);
    } catch {
      setErr(true);
    }
  }, []);
  useEffect(() => {
    run(params);
    const t = setInterval(() => run(params), 1000 * 45);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => run(params), 450);
    return () => clearTimeout(t);
  }, [params]);
  const set = k => e => setParams(p => ({
    ...p,
    [k]: e.target.value
  }));
  const isWait = dec?.recommendation === "WAIT";
  return <div className="grid lg:grid-cols-[320px,1fr] gap-6" data-testid="decide-panel"><div className="hairline rounded-xl bg-ink-800/60 p-6 space-y-5 h-fit"><p className="font-display font-semibold text-lg tracking-tight">Voyage spec</p><Field label="Cargo (tonnes)"><input type="number" min={5000} max={400000} step={5000} value={params.cargo_t} onChange={set("cargo_t")} data-testid="input-cargo-quantity-input" className={selectCls + " font-mono tabular"} /></Field><Field label="Discharge port"><select value={params.port} onChange={set("port")} data-testid="input-port-select" className={selectCls}>{meta.ports.map(p => <option key={p.code} value={p.code}>{p.name}{p.mvp ? " · MVP" : ""}</option>)}</select></Field><Field label="Origin"><select value={params.origin} onChange={set("origin")} data-testid="input-origin-select" className={selectCls}>{meta.origins.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}</select></Field><Field label="Ship class"><select value={params.ship_class} onChange={set("ship_class")} data-testid="input-ship-class-select" className={selectCls}>{meta.ship_classes.map(c => <option key={c.code} value={c.code}>{c.name} · {c.dwt.toLocaleString("en-US")} dwt</option>)}</select></Field><Field label={`Laycan window · ${params.window_weeks} weeks`}><input type="range" min={2} max={8} value={params.window_weeks} onChange={e => setParams(p => ({
          ...p,
          window_weeks: Number(e.target.value)
        }))} data-testid="input-laycan-date-picker" className="w-full" /></Field><Field label="Cost of waiting ($/t/week)"><input type="number" min={0} max={0.2} step={0.01} value={params.wait_cost_per_t_week} onChange={e => setParams(p => ({
          ...p,
          wait_cost_per_t_week: Number(e.target.value)
        }))} data-testid="input-wait-cost-input" className={selectCls + " font-mono tabular"} /></Field><button data-testid="btn-run-decision-engine" onClick={() => run(params)} className="w-full rounded-lg bg-beacon py-3 text-sm font-semibold text-ink-900 hover:bg-amber-300 transition-colors">Run decision engine</button>{err && <p className="text-alert text-xs font-mono">Engine unreachable — retry.</p>}</div><div className="space-y-6"><div className="hairline rounded-xl bg-ink-800/60 p-6"><div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div><p className="font-display font-semibold text-lg tracking-tight">Forecast · 8-week horizon</p><p className="mono-label mt-1 normal-case tracking-[0.06em]">{dec ? `${fmtRate(dec.options[0].freight_p50)}/t spot · as of ${dec.asof}` : "—"}</p></div><div className="flex flex-wrap gap-2">{fc && <><span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase ${fc.gate.beats_naive ? "text-mint border-mint/40 bg-mint/10" : "text-beacon border-beacon/40 bg-beacon/10"}`}>{fc.gate.beats_naive ? `beats naive · ${fc.gate.model_mae_pct}% vs ${fc.gate.naive_mae_pct}%` : "naive fallback gate"}</span><span className="rounded-full border border-radar/40 bg-radar/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase text-radar">coverage {fc.coverage}%</span></>}</div></div>{<ForecastChart history={fc?.history || []} forecast={fc?.forecast || []} />}</div>{dec && <div className={`rounded-xl border p-6 md:p-7 ${isWait ? "border-radar/40 bg-radar/[0.06]" : "border-beacon/40 bg-beacon/[0.06]"}`} data-testid="recommendation-card"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="mono-label mb-2">Verdict · {dec.feasibility.ship_class} @ {dec.feasibility.port}</p><div className="flex flex-wrap items-center gap-3"><span data-testid="recommendation-card-badge" className={`font-display text-4xl md:text-5xl font-black tracking-tight ${isWait ? "text-radar" : "text-beacon"}`}>{dec.recommendation}</span>{isWait && <span className="font-mono text-lg text-fog">· {dec.wait_weeks} weeks</span>}<Pill status={dec.feasibility.status} /></div><p className="text-fog text-sm mt-3 max-w-lg">{isWait ? `Waiting ${dec.wait_weeks} weeks clears the ${dec.threshold_pct}% risk-adjusted bar on expected cost.` : "Waiting does not clear the 1% risk-adjusted bar. Book now at today's spot."}</p></div><div className="text-right"><p data-testid="recommendation-cost-savings-metric" className={`font-mono text-3xl font-bold tabular ${dec.saving_usd > 0 ? isWait ? "text-radar" : "text-mint" : "text-dim"}`}>{isWait ? `−${fmtPct(dec.saving_pct, 2)}` : "0.00%"}</p><p className="mono-label mt-1 normal-case tracking-[0.06em]">{isWait ? `≈ ${fmtUsd(dec.saving_usd)} on ${fmtT(dec.cargo_t)}` : "no clearing wait option"}</p><div className="mt-4 font-mono text-[12px] text-fog tabular leading-relaxed">expected {fmtRate(dec.expected_cost_t)}/t · worst {fmtRate(dec.worst_cost_t)}/t</div></div></div><div className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-4 border-t border-white/10 pt-5">{dec.drivers.map(d => <div key={d.name} className="flex gap-3"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${d.impact === "high" ? "bg-beacon" : d.impact === "medium" ? "bg-radar" : "bg-dim"}`} /><div><p className="text-sm text-slate-200 font-medium">{d.name}</p><p className="text-[12px] text-dim font-mono">{d.detail}</p></div></div>)}</div></div>}{dec && <div className="grid md:grid-cols-2 gap-6"><div className="hairline rounded-xl bg-ink-800/60 p-6"><p className="font-display font-semibold text-lg tracking-tight mb-4">Book-now vs wait</p><table className="w-full text-sm font-mono tabular" data-testid="options-table"><thead><tr className="text-left mono-label"><th className="pb-3 font-medium">Option</th><th className="pb-3 font-medium">P50</th><th className="pb-3 font-medium">P90</th><th className="pb-3 font-medium text-right">All-in $/t</th></tr></thead><tbody>{dec.options.map(o => {
                const chosen = isWait && o.kind === "wait" && o.weeks === dec.wait_weeks || !isWait && o.kind === "now";
                return <tr key={o.kind + o.weeks} className={`border-t border-white/[0.05] ${chosen ? "text-beacon" : "text-fog"}`}><td className="py-2.5">{o.kind === "now" ? "Book now" : `Wait ${o.weeks} wk`}{chosen && " ●"}</td><td className="py-2.5">{o.freight_p50.toFixed(2)}</td><td className="py-2.5 text-dim">{o.freight_p90.toFixed(2)}</td><td className="py-2.5 text-right">{o.mean.toFixed(2)}</td></tr>;
              })}</tbody></table><p className="mono-label mt-4 normal-case tracking-[0.06em]">all-in = freight × dwt/usable + demurrage + waiting cost</p></div><div className="hairline rounded-xl bg-ink-800/60 p-6"><p className="font-display font-semibold text-lg tracking-tight mb-4">Fleet screen · {dec.feasibility.port}</p><ul className="space-y-3" data-testid="fleet-screen-list">{dec.fleet.map(f => {
              var _f$usable;
              return <li key={f.code} className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-0"><div><p className="text-sm text-slate-200 font-medium">{f.ship_class}</p><p className="font-mono text-[11px] text-dim">{f.reasons[0] || `full load · ${(_f$usable = f.usable) === null || _f$usable === void 0 ? void 0 : _f$usable.toLocaleString("en-US")} t`}</p></div><Pill status={f.status} /></li>;
            })}</ul></div></div>}</div></div>;
}

export default DecidePanel;
