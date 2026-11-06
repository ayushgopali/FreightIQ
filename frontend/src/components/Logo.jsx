import React from "react";
import { Link } from "react-router-dom";

export const LogoMark = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect width="36" height="36" rx="8" fill="#0A0F18" />
    <path d="M6 27L18 6L30 27H6Z" stroke="#00F0FF" strokeWidth="2" strokeLinejoin="round" />
    <path d="M11 23L18 10L25 23H11Z" fill="#00F0FF" fillOpacity="0.18" stroke="#00F0FF" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="18" cy="18" r="2.6" fill="#FFB800" />
  </svg>
);

export default function Logo({ withWordmark = true }) {
  return (
    <Link to="/" data-testid="nav-logo-link" className="flex items-center gap-2.5 group">
      <LogoMark />
      {withWordmark && (
        <span className="font-display font-bold text-lg tracking-tight text-slate-100 group-hover:text-white transition-colors">
          Freight<span className="text-radar">IQ</span>
        </span>
      )}
    </Link>
  );
}
