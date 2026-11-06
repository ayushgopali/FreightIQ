import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

const ANCHORS = [
  { href: "#stakes", label: "The Stakes" },
  { href: "#engine", label: "Engine" },
  { href: "#ports", label: "Ports" },
  { href: "#record", label: "Record" },
];

export default function Nav() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const onLanding = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    if (window.__lenis) {
      window.__lenis.scrollTo(href, { offset: -72 });
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ink-900/85 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          {onLanding && (
            <nav className="hidden lg:flex items-center gap-7">
              {ANCHORS.map((a) => (
                <a
                  key={a.href}
                  href={a.href}
                  data-testid={`nav-anchor-${a.href.slice(1)}`}
                  onClick={(e) => go(e, a.href)}
                  className="text-[13px] text-fog hover:text-slate-100 transition-colors tracking-wide"
                >
                  {a.label}
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {pathname === "/console" ? (
            <Link
              to="/"
              data-testid="nav-landing-link"
              className="text-[13px] text-fog hover:text-slate-100 transition-colors"
            >
              Back to site
            </Link>
          ) : null}
          <Link
            to="/console"
            data-testid="nav-console-link"
            className="rounded-full bg-beacon px-4 py-2 text-[13px] font-semibold text-ink-900 hover:bg-amber-300 transition-colors"
          >
            Open Console
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
