import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface LandingTopBarProps {
  verifiedPortCount?: number;
  totalPortCount?: number;
}

const NAV_LINKS = [
  { href: '#stakes', label: 'The Stakes' },
  { href: '#engine', label: 'Engine' },
  { href: '#ports', label: 'Ports' },
  { href: '#record', label: 'Record' },
  { href: '#faq', label: 'FAQ' },
  { to: '/demo', label: 'Demo' },
];

export const LandingTopBar: React.FC<LandingTopBarProps> = ({
  verifiedPortCount = 0,
  totalPortCount = 7,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trap focus & Escape key handling for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const scrollToAnchor = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E6E2D9] shadow-xs'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 h-[72px] flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 text-[#0B0F1A] font-semibold text-lg tracking-tight">
              <div className="w-8 h-8 rounded bg-[#1558C9] flex items-center justify-center text-white font-bold">
                F
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-[#0B0F1A]">FreightIQ</span>
            </Link>

            {/* Status Chip (Computed: Synthetic data · N of 7 port limits verified) */}
            <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F1EC] border border-[#E6E2D9] text-[#555B6A] font-mono text-[11px] font-medium tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Synthetic data · {verifiedPortCount} of {totalPortCount} port limits verified
            </span>
          </div>

          {/* Desktop Nav Links (One line at 1024px and up) */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollToAnchor(e, item.href)}
                  className="text-sm font-medium text-[#555B6A] hover:text-[#0B0F1A] transition-colors py-2"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to!}
                  className="text-sm font-medium text-[#555B6A] hover:text-[#0B0F1A] transition-colors py-2"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Console CTA & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <Link
              to="/console"
              className="landing-btn-primary"
              data-testid="topbar-open-console"
            >
              <span>Open Console</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded text-[#0B0F1A] hover:bg-black/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#FFFFFF] border-l border-[#E6E2D9] p-6 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E6E2D9]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#1558C9] text-white flex items-center justify-center font-bold text-sm">
                    F
                  </div>
                  <span className="font-heading font-bold text-lg text-[#0B0F1A]">FreightIQ</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#555B6A] hover:text-[#0B0F1A] min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Status in Mobile */}
              <div className="my-4 p-2.5 rounded bg-[#F3F1EC] text-[11px] font-mono text-[#555B6A]">
                Synthetic data · {verifiedPortCount} of {totalPortCount} port limits verified
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-3 mt-4">
                {NAV_LINKS.map((item) =>
                  item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => scrollToAnchor(e, item.href)}
                      className="px-3 py-2.5 rounded text-base font-medium text-[#0B0F1A] hover:bg-[#F3F1EC] transition-colors min-h-[44px] flex items-center"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.to!}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded text-base font-medium text-[#0B0F1A] hover:bg-[#F3F1EC] transition-colors min-h-[44px] flex items-center"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E6E2D9]">
              <Link
                to="/console"
                onClick={() => setMobileMenuOpen(false)}
                className="landing-btn-primary w-full text-center"
              >
                <span>Open Commercial Console</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
