import { useState, useEffect } from "react";
import { postTimeMachine, fmtRate, fmtUsd, fmtT } from "@/lib/api";
const LAST = "2026-08-16";
const shiftDate = weeksAgo => {
  const d = new Date(`${LAST}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - weeksAgo * 7);
  return d.toISOString().slice(0, 10);
};
function TimeMachinePanel({
  meta
}) {
  const [date, setDate] = useState(shiftDate(60));
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = d => {
    setBusy(true);
    postTimeMachine({
      date: d,
      cargo_t: 150000,
      port: "paradip",
      origin: "ZA-RBA",
      ship_class: "capesize"
    }).then(setRes).catch(() => {}).finally(() => setBusy(false));
  };
  useEffect(() => {
    load(shiftDate(60));
  }, []);
  const win = res?.outcome === "win";
  const outcomeStyle = {
    win: "text-mint border-mint/40 bg-mint/10",
    loss: "text-alert border-alert/40 bg-alert/10",
    flat: "text-dim border-white/15 bg-white/[0.04]"
  };
  const outcomeLabel = {
    win: "win",
    loss: "loss",
    flat: "flat"
  };
  return <div className="space-y-6" data-testid="time-machine-panel"><div className="hairline rounded-xl bg-ink-800/60 p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-display text-2xl font-bold tracking-tight">Advice time machine</h2><p className="text-fog text-sm mt-1.5 max-w-2xl">Replay the advice FreightIQ would have given on any past date — then see what actually happened, including the losses.</p></div><div className="flex flex-wrap items-center gap-3">{[[52, "1 yr back"], [104, "2 yrs back"], [208, "4 yrs back"]].map(([w, label]) => <button key={w} onClick={() => {
            const d = shiftDate(w);
            setDate(d);
            load(d);
          }} className="rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-dim hover:text-slate-100 hover:border-white/25 transition-colors">{label}</button>)}<input type="date" value={date} min="2021-04-01" max={shiftDate(10)} onChange={e => {
            setDate(e.target.value);
            load(e.target.value);
          }} data-testid="time-machine-date-scrubber" className="rounded-lg border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm font-mono text-slate-100 outline-none focus:border-radar/50" /></div></div></div>{res && <><div className="grid md:grid-cols-2 gap-6"><div className="hairline rounded-xl bg-ink-800/60 p-7 relative overflow-hidden" data-testid="tm-advice-card"><p className="mono-label text-radar mb-5">A · Advice on {res.advice_date}</p><div className="font-display text-4xl font-black tracking-tight text-beacon">{res.recommendation}{res.recommendation === "WAIT" && <span className="text-fog text-2xl font-semibold"> · {res.wait_weeks} wk</span>}</div><div className="mt-6 space-y-2.5 font-mono text-[13px] tabular text-fog"><div className="flex justify-between"><span>spot on date</span><span className="text-slate-200">{fmtRate(res.rate_on_date)}/t</span></div><div className="flex justify-between"><span>forecast band (P50)</span><span className="text-slate-200">{fmtRate(res.band)}/t</span></div><div className="flex justify-between"><span>advised saving</span><span className="text-radar">{res.advised_saving_pct.toFixed(2)}% · {fmtUsd(res.advised_saving_usd)}</span></div><div className="flex justify-between"><span>cargo</span><span className="text-slate-200">{fmtT(150000)} · Paradip</span></div></div></div><div className={`rounded-xl border p-7 ${win ? "border-mint/40 bg-mint/[0.05]" : res.outcome === "loss" ? "border-alert/40 bg-alert/[0.05]" : "border-white/10 bg-ink-800/60"}`} data-testid="tm-realized-card"><div className="flex items-center justify-between mb-5"><p className="mono-label text-fog">B · What actually happened · {res.realized_date}</p><span data-testid="tm-outcome-badge" className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase ${outcomeStyle[res.outcome] || outcomeStyle.flat}`}>{outcomeLabel[res.outcome] || "flat"}</span></div><div className={`font-display text-4xl font-black tracking-tight tabular ${win ? "text-mint" : res.outcome === "loss" ? "text-alert" : "text-fog"}`}>{res.realized_saving_pct > 0 ? "+" : ""}{res.realized_saving_pct.toFixed(2)}%</div><div className="font-mono text-sm text-fog mt-1 tabular">{res.realized_saving_usd > 0 ? "+" : "−"}{fmtUsd(Math.abs(res.realized_saving_usd))} on the cargo</div><div className="mt-6 space-y-2.5 font-mono text-[13px] tabular text-fog"><div className="flex justify-between"><span>route moved to</span><span className="text-slate-200">{fmtRate(res.realized_rate)}/t</span></div><div className="flex justify-between"><span>window held</span><span className="text-slate-200">{res.window_weeks} weeks</span></div></div></div></div><div className="hairline rounded-xl bg-ink-900/70 p-6 font-mono text-[13px] leading-relaxed text-fog" data-testid="tm-narrative"><span className="text-beacon">replay$</span> {res.narrative}</div></>}{busy && <p className="mono-label">Rewinding the market…</p>}</div>;
}

export default TimeMachinePanel;
