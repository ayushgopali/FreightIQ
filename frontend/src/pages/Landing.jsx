import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PortVisualLayer from '@/components/landing/PortVisualLayer';
import PortStoryBeats from '@/components/landing/PortStoryBeats';
import PhaseBSection from '@/components/landing/PhaseBSection';
import { getMeta, getBacktest, postDecide } from '@/lib/api';

const BEAT_BOUNDARIES = [0.0, 0.12, 0.30, 0.48, 0.66, 0.84, 1.0];

export default function Landing() {
  const navigate = useNavigate();
  const pinnedContainerRef = useRef(null);

  const [introSeen, setIntroSeen] = useState(() => {
    try {
      return sessionStorage.getItem('freightiq_intro_seen') === 'true';
    } catch {
      return false;
    }
  });

  const [storyState, setStoryState] = useState({
    scrollProgress: 0,
    activeBeat: 0,
    beatProgress: 0,
  });
  const { scrollProgress, activeBeat, beatProgress } = storyState;
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isWeakDevice, setIsWeakDevice] = useState(false);
  const [onEnterTriggered, setOnEnterTriggered] = useState(false);

  // Real backend figures
  const [meta, setMeta] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [decision, setDecision] = useState(null);

  // Check reduced motion & data saver / weak device
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    if (typeof navigator !== 'undefined') {
      const dataSaver = navigator.connection?.saveData === true;
      const weakCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
      const weakRam = navigator.deviceMemory && navigator.deviceMemory <= 2;
      setIsWeakDevice(Boolean(dataSaver || weakCpu || weakRam));
    }

    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fetch real data from backend
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [metaData, btData, decData] = await Promise.all([
          getMeta(),
          getBacktest(),
          postDecide({
            cargo_tonnes: 170000,
            origin_code: 'ZA-RBA',
            dest_code: 'paradip',
            ship_class: 'capesize',
          }),
        ]);
        if (mounted) {
          setMeta(metaData);
          setBacktest(btData);
          setDecision(decData);
        }
      } catch (err) {
        console.warn('Backend unavailable, using calibrated fallbacks:', err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Scroll listener for pinned story length (desktop 600vh, mobile 500vh)
  const lastProgRef = useRef(-1);
  useEffect(() => {
    if (introSeen) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!pinnedContainerRef.current) return;
          const container = pinnedContainerRef.current;
          const scrollY = window.scrollY;
          const totalPinnedHeight = container.offsetHeight - window.innerHeight;

          if (totalPinnedHeight > 0) {
            const rawProg = Math.max(0, Math.min(1, scrollY / totalPinnedHeight));

            if (Math.abs(lastProgRef.current - rawProg) >= 0.002 || rawProg === 0 || rawProg === 1) {
              lastProgRef.current = rawProg;

              // Once user scrolls past beat 5 into Phase B, remember completion
              if (rawProg >= 0.98) {
                try {
                  sessionStorage.setItem('freightiq_intro_seen', 'true');
                } catch {}
              }

              // Determine active beat and beat-relative progress
              let beat = 0;
              while (beat < BEAT_BOUNDARIES.length - 2 && rawProg >= BEAT_BOUNDARIES[beat + 1]) {
                beat++;
              }

              const bStart = BEAT_BOUNDARIES[beat];
              const bEnd = BEAT_BOUNDARIES[beat + 1];
              const bProg = Math.max(0, Math.min(1, (rawProg - bStart) / (bEnd - bStart)));

              setStoryState({
                scrollProgress: rawProg,
                activeBeat: beat,
                beatProgress: bProg,
              });
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [introSeen]);

  // Keyboard navigation: Esc to skip, Down/PageDown to advance
  useEffect(() => {
    if (introSeen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkipIntro();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (pinnedContainerRef.current && window.scrollY < pinnedContainerRef.current.offsetHeight) {
          const totalPinnedHeight = pinnedContainerRef.current.offsetHeight - window.innerHeight;
          const currentBeatNext = Math.min(5, activeBeat + 1);
          const targetY = totalPinnedHeight * ((BEAT_BOUNDARIES[currentBeatNext] + BEAT_BOUNDARIES[Math.min(BEAT_BOUNDARIES.length - 1, currentBeatNext + 1)]) / 2);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (pinnedContainerRef.current && window.scrollY < pinnedContainerRef.current.offsetHeight) {
          const currentBeatPrev = Math.max(0, activeBeat - 1);
          const targetY = (pinnedContainerRef.current.offsetHeight - window.innerHeight) * ((BEAT_BOUNDARIES[currentBeatPrev] + BEAT_BOUNDARIES[currentBeatPrev + 1]) / 2);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeBeat, introSeen]);

  // Phase C: Enter Site Handler
  const handleEnterSite = () => {
    try {
      sessionStorage.setItem('freightiq_intro_seen', 'true');
    } catch {}

    if (isReducedMotion) {
      navigate('/decide');
      return;
    }

    setOnEnterTriggered(true);
    // Smooth 600ms zoom toward water & plunge through dark into /decide
    setTimeout(() => {
      navigate('/decide');
    }, 600);
  };

  // Skip Intro Handler
  const handleSkipIntro = () => {
    try {
      sessionStorage.setItem('freightiq_intro_seen', 'true');
    } catch {}
    setIntroSeen(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleReplayStory = () => {
    try {
      sessionStorage.removeItem('freightiq_intro_seen');
    } catch {}
    setIntroSeen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <main className="landing relative bg-[#030407] min-h-screen text-[#F4F7FB] selection:bg-[#D4FF24] selection:text-[#0B0F1A]">
      {/* Plunge transition overlay (fades through pitch black during Phase C) */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none bg-[#030407] transition-opacity duration-600 ${
          onEnterTriggered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* PHASE A: PINNED SCROLL STORY CONTAINER (Shown when introSeen is false) */}
      {!introSeen && (
        <div
          ref={pinnedContainerRef}
          data-testid="pinned-story-container"
          className="relative w-full h-[500vh] md:h-[600vh]"
        >
          {/* Fixed Visual Viewport */}
          <div
            className={`fixed inset-0 z-0 overflow-hidden ${
              scrollProgress >= 1 ? 'pointer-events-none opacity-0' : 'opacity-100'
            } transition-opacity duration-300`}
            aria-hidden={scrollProgress >= 1}
          >
            <PortVisualLayer
              scrollProgress={scrollProgress}
              activeBeat={activeBeat}
              beatProgress={beatProgress}
              decision={decision}
              isReducedMotion={isReducedMotion || isWeakDevice}
              onEnterTriggered={onEnterTriggered}
            />

            <PortStoryBeats
              activeBeat={activeBeat}
              beatProgress={beatProgress}
              onSkipIntro={handleSkipIntro}
              onEnterSite={handleEnterSite}
              meta={meta}
              backtest={backtest}
              decision={decision}
            />
          </div>
        </div>
      )}

      {/* PHASE B: FULL UNPINNED LANDING PAGE */}
      <div className={`transition-opacity duration-300 ${onEnterTriggered ? 'opacity-0' : 'opacity-100'}`}>
        <PhaseBSection
          meta={meta}
          backtest={backtest}
          onEnterSite={handleEnterSite}
          onReplayStory={handleReplayStory}
          isIntroSeen={introSeen}
        />
      </div>
    </main>
  );
}
