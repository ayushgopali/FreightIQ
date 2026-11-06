import React from "react";

export default function Marquee() {
  const items = [
    "PARADIP — DRAFT 14.5 M",
    "VIZAG — DRAFT 17.5 M",
    "GANGAVARAM — DRAFT 19.0 M",
    "GOPALPUR — DRAFT 10.5 M",
    "DHAMRA — DRAFT 18.0 M",
    "SAGAR-SANDHEADS — DRAFT 13.0 M",
    "HALDIA — DRAFT 11.5 M",
    "CAPESIZE · PANAMAX · ULTRAMAX · SUPRAMAX",
    "8-WEEK OUTLOOK · P10 → P90",
  ];
  const row = (ariaHidden) => (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {items.map((t) => (
        <span key={t + (ariaHidden ? "-b" : "")} className="flex items-center">
          <span className="font-mono text-xs md:text-sm tracking-[0.18em] text-dim px-6 whitespace-nowrap">
            {t}
          </span>
          <span className="h-1 w-1 rounded-full bg-radar/70 inline-block" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative border-y border-white/[0.06] bg-ink-850/60 py-4 overflow-hidden">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
