import React, { useState, useEffect } from "react";
import { getPortScreen } from "@/lib/api";

const STATUS = {
  feasible: {
    label: "Feasible",
    cls: "text-mint border-mint/40 bg-mint/10",
  },
  part_loaded: {
    label: "Part-loaded",
    cls: "text-beacon border-beacon/40 bg-beacon/10",
  },
  blocked: {
    label: "Blocked",
    cls: "text-alert border-alert/40 bg-alert/10",
  },
};

const selectCls =
  "rounded-lg border border-white/10 bg-ink-800 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-radar/50 transition-colors appearance-none";

export default function PortScreenPanel({ meta }) {
  const [rows, setRows] = useState([]);
  const [cargo, setCargo] = useState(150000);

  useEffect(() => {
    getPortScreen(cargo)
      .then((d) => setRows(d.rows || []))
      .catch(() => {});
  }, [cargo]);

  const classes = meta?.ship_classes || [];
  const ports = meta?.ports || [];

  return (
    <div data-testid="port-screen-panel">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Port feasibility matrix
          </h2>
          <p className="text-fog text-sm mt-1.5 max-w-2xl">
            Every ship class against every port's hard limits — draft, LOA, beam. Draft-limited ships are shown part-loaded with the usable tonnage; blocked ships never appear in advice.
          </p>
        </div>
        <label className="flex items-center gap-3">
          <span className="mono-label">Cargo t</span>
          <input
            type="number"
            min={5000}
            max={400000}
            step={5000}
            value={cargo}
            onChange={(e) => setCargo(Number(e.target.value))}
            data-testid="port-screen-cargo-input"
            className={selectCls + " font-mono tabular w-36"}
          />
        </label>
      </div>

      <div className="hairline rounded-xl bg-ink-800/60 overflow-hidden" data-testid="port-screen-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.07] text-left bg-ink-900/50">
                {[
                  "Port",
                  "Ship class",
                  "Draft limit",
                  "Draft loaded",
                  "LOA limit",
                  "Beam limit",
                  "Usable load",
                  "Status",
                ].map((h) => (
                  <th key={h} className="px-5 py-3.5 mono-label font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ports.flatMap((p) =>
                classes.map((c) => {
                  const row = rows.find((r) => r.port === p.code && r.class_code === c.code);
                  if (!row) return null;
                  const st = STATUS[row.status] || STATUS.feasible;
                  return (
                    <tr
                      key={`${p.code}-${c.code}`}
                      className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${
                        c.code === "capesize" ? "" : "text-fog"
                      }`}
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-slate-100 font-medium">{p.name}</span>
                        {p.mvp && (
                          <span className="ml-2 rounded-sm bg-beacon/15 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-beacon">
                            MVP
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono">{c.name}</td>
                      <td className="px-5 py-3 font-mono tabular">
                        {(row.draft_limit_m || 0).toFixed(1)} m
                      </td>
                      <td className="px-5 py-3 font-mono tabular">
                        {(row.draft_needed_m || 0).toFixed(1)} m
                      </td>
                      <td className="px-5 py-3 font-mono tabular">{row.loa_limit_m} m</td>
                      <td className="px-5 py-3 font-mono tabular">
                        {(row.beam_limit_m || 0).toFixed(1)} m
                      </td>
                      <td className="px-5 py-3 font-mono tabular">
                        {row.usable ? `${Number(row.usable).toLocaleString("en-US")} t` : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.1em] uppercase whitespace-nowrap ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-6 font-mono text-[11px] tracking-[0.1em] uppercase text-dim">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-mint" /> Feasible — full load accepted
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-beacon" /> Part-loaded — capped by draft limit
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-alert" /> Blocked — exceeds port draft/LOA/beam
        </span>
      </div>
    </div>
  );
}
