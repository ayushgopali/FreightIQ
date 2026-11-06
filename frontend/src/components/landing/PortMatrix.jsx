import React, { useState, useEffect } from "react";
import { Reveal, SectionHead } from "@/components/Reveal";
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
    label: "Exceeded",
    cls: "text-alert border-alert/40 bg-alert/10",
  },
};

export default function PortMatrix() {
  const [rows, setRows] = useState([]);
  const [cls, setCls] = useState("capesize");

  useEffect(() => {
    getPortScreen(150000)
      .then((d) => setRows(d.rows || []))
      .catch(() => {});
  }, []);

  const classes = [
    ["capesize", "Capesize"],
    ["panamax", "Panamax"],
    ["ultramax", "Ultramax"],
    ["supramax", "Supramax"],
  ];

  const visible = Object.fromEntries(
    classes.map(([code]) => [code, rows.filter((r) => r.class_code === code)])
  );

  const ports = (visible[cls] || []).map((r) => ({
    port_name: r.port_name,
    mvp: r.mvp,
    state: r.state,
    row: r,
  }));

  return (
    <section id="ports" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          index="05"
          eyebrow="Coverage"
          title={<>Seven ports. Limits decide ship choice.</>}
          sub="Draft, length and beam limits per port, applied as transparent hard rules. The MVP starts with Paradip and Vizag; the rest are already in the data layer."
        />

        <Reveal>
          <div className="flex flex-wrap gap-2 mb-8">
            {classes.map(([code, name]) => (
              <button
                key={code}
                data-testid={`port-matrix-class-${code}`}
                onClick={() => setCls(code)}
                className={`rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors border ${
                  cls === code
                    ? "bg-radar/15 border-radar/50 text-radar"
                    : "border-white/10 text-dim hover:text-slate-200 hover:border-white/25"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="hairline rounded-xl bg-ink-800/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]" data-testid="port-matrix-table">
                <thead>
                  <tr className="border-b border-white/[0.07] text-left">
                    {["Port", "Draft limit", "LOA limit", "Beam limit", "Usable load", "Screen"].map(
                      (h) => (
                        <th key={h} className="px-6 py-4 mono-label font-medium">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ports.map(({ port_name, mvp, state, row }) => {
                    const st = STATUS[row.status] || STATUS.feasible;
                    return (
                      <tr
                        key={port_name}
                        className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-slate-100 font-medium">{port_name}</span>
                          {mvp && (
                            <span className="ml-2 rounded-sm bg-beacon/15 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-beacon align-middle">
                              MVP
                            </span>
                          )}
                          <div className="mono-label normal-case tracking-[0.04em] mt-0.5">
                            {state}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-fog tabular">
                          {(row.draft_limit_m || 0).toFixed(1)} m
                        </td>
                        <td className="px-6 py-4 font-mono text-fog tabular">
                          {row.loa_limit_m} m
                        </td>
                        <td className="px-6 py-4 font-mono text-fog tabular">
                          {(row.beam_limit_m || 0).toFixed(1)} m
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-200 tabular">
                          {row.usable ? `${Number(row.usable).toLocaleString("en-US")} t` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.12em] uppercase ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {ports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-dim text-sm">
                        Screening the fleet…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
