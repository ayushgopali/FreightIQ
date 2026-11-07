import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Play } from 'lucide-react';

export const SceneBand: React.FC = () => {
  return (
    <section className="relative py-32 md:py-48 flex items-center justify-center pointer-events-none">
      <div className="w-full max-w-[1000px] mx-auto px-6 text-center pointer-events-auto">
        <div className="landing-glass p-10 md:p-16 border border-[#E6E2D9] shadow-2xl bg-white/80 backdrop-blur-xl">
          <span className="landing-label text-[#1558C9] mb-4 block">
            Commercial Autonomy
          </span>
          <h2 className="landing-h2 text-[#0B0F1A] font-medium leading-[1.08] tracking-tight">
            Your cargo. Your timing. Your call.
          </h2>
          <p className="mt-6 text-base md:text-xl text-[#555B6A] max-w-xl mx-auto leading-relaxed font-normal">
            Every fixture recommendation is backed by traceable forward quantiles, physical port drafts, and zero-lookahead backtest transparency.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/console"
              className="landing-btn-primary text-base px-6 py-3"
              data-testid="scene-open-console"
            >
              <span>Open the Console</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              to="/demo"
              className="landing-btn-secondary text-base px-6 py-3"
              data-testid="scene-watch-demo"
            >
              <Play className="w-4 h-4 fill-current text-[#1558C9]" />
              <span>Watch the demo</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

