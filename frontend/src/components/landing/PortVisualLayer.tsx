import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CAMERA_KEYFRAMES } from '@/config/portFocus';

interface PortVisualLayerProps {
  scrollProgress: number; // 0 to 1 across the pinned scroll timeline
  activeBeat: number;     // 0 to 5
  beatProgress: number;   // 0 to 1 inside current beat
  decision?: any;
  isReducedMotion: boolean;
  onEnterTriggered?: boolean; // Phase C trigger
}

export const PortVisualLayer: React.FC<PortVisualLayerProps> = ({
  scrollProgress,
  activeBeat,
  beatProgress,
  decision,
  isReducedMotion,
  onEnterTriggered = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brightnessOverlayRef = useRef<HTMLDivElement>(null);

  const [isMainLoaded, setIsMainLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Single persistent camera state ref
  const cameraRef = useRef({
    panX: 0.0,
    panY: 0.0,
    zoom: 1.0,
    brightness: 0.15,
  });

  const targetCameraRef = useRef({
    panX: 0.0,
    panY: 0.0,
    zoom: 1.0,
    brightness: 0.15,
  });

  const parallaxRef = useRef({ x: 0, y: 0 });

  // Track viewport width
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pointer parallax (desktop only)
  useEffect(() => {
    if (isMobile || isReducedMotion) return;

    let rafId: number;
    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        parallaxRef.current = {
          x: (e.clientX / window.innerWidth - 0.5) * 3,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        };
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isMobile, isReducedMotion]);

  // Compute and update target camera into ref (Zero effect re-triggers!)
  useEffect(() => {
    if (onEnterTriggered) {
      targetCameraRef.current = {
        panX: 18.0,
        panY: -22.0,
        zoom: 1.5,
        brightness: 0.0,
      };
      return;
    }

    const p = Math.max(0, Math.min(1, scrollProgress));

    // Find active keyframe interval
    let kf = CAMERA_KEYFRAMES[0];
    for (let i = 0; i < CAMERA_KEYFRAMES.length; i++) {
      if (p >= CAMERA_KEYFRAMES[i].pStart && (p <= CAMERA_KEYFRAMES[i].pEnd || i === CAMERA_KEYFRAMES.length - 1)) {
        kf = CAMERA_KEYFRAMES[i];
        break;
      }
    }

    const segLen = Math.max(0.001, kf.pEnd - kf.pStart);
    const segT = Math.max(0, Math.min(1, (p - kf.pStart) / segLen));
    const easedT = segT < 0.5 ? 4 * segT * segT * segT : 1 - Math.pow(-2 * segT + 2, 3) / 2;

    let focusX = kf.focus[0];
    let focusY = kf.focus[1];
    let targetZoom = kf.zoom;
    let brightness = kf.brightnessStart ?? 1.0;

    if (kf.beat === 0) {
      brightness = 0.05 + (0.35 - 0.05) * easedT;
      focusX = 50;
      focusY = 50;
      targetZoom = 1.0;
    } else if (kf.beat === 1) {
      focusX = 50;
      focusY = 50;
      targetZoom = 1.0;
      brightness = 1.0;
    } else if (kf.beat === 4 && kf.focusEnd) {
      focusX = kf.focus[0] + (kf.focusEnd[0] - kf.focus[0]) * easedT;
      focusY = kf.focus[1] + (kf.focusEnd[1] - kf.focus[1]) * easedT;
      targetZoom = 1.4;
      brightness = 1.0;
    } else {
      const prevKf = CAMERA_KEYFRAMES[Math.max(0, kf.beat - 1)];
      const startFocusX = prevKf.beat === 4 && prevKf.focusEnd ? prevKf.focusEnd[0] : prevKf.focus[0];
      const startFocusY = prevKf.beat === 4 && prevKf.focusEnd ? prevKf.focusEnd[1] : prevKf.focus[1];

      focusX = startFocusX + (kf.focus[0] - startFocusX) * easedT;
      focusY = startFocusY + (kf.focus[1] - startFocusY) * easedT;
      targetZoom = prevKf.zoom + (kf.zoom - prevKf.zoom) * easedT;
      brightness = 1.0;
    }

    const finalZoom = isMobile ? Math.min(1.30, targetZoom) : targetZoom;
    const maxOffsetX = ((finalZoom - 1.0) / 2.0) * 100.0;
    const maxOffsetY = ((finalZoom - 1.0) / 2.0) * 100.0;

    const rawPanX = (50.0 - focusX) * finalZoom;
    const rawPanY = (50.0 - focusY) * finalZoom;

    targetCameraRef.current = {
      panX: Math.max(-maxOffsetX, Math.min(maxOffsetX, rawPanX)),
      panY: Math.max(-maxOffsetY, Math.min(maxOffsetY, rawPanY)),
      zoom: finalZoom,
      brightness,
    };
  }, [scrollProgress, isMobile, onEnterTriggered]);

  // SINGLE PERSISTENT REQUEST_ANIMATION_FRAME LOOP (Mounts Once!)
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const cam = cameraRef.current;
      const target = targetCameraRef.current;
      const parallax = parallaxRef.current;
      const smoothFactor = isReducedMotion ? 1.0 : 0.12;

      cam.panX += (target.panX - cam.panX) * smoothFactor;
      cam.panY += (target.panY - cam.panY) * smoothFactor;
      cam.zoom += (target.zoom - cam.zoom) * smoothFactor;
      cam.brightness += (target.brightness - cam.brightness) * smoothFactor;

      if (containerRef.current) {
        const finalX = cam.panX + parallax.x;
        const finalY = cam.panY + parallax.y;
        containerRef.current.style.transform = `translate3d(${finalX}%, ${finalY}%, 0) scale(${cam.zoom})`;
      }

      if (brightnessOverlayRef.current) {
        const blackOpacity = Math.max(0, Math.min(1, 1 - cam.brightness));
        brightnessOverlayRef.current.style.opacity = String(blackOpacity);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isReducedMotion]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030407] pointer-events-none select-none">
      {/* Zoom / Pan Camera Transform Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          transformOrigin: '50% 50%',
        }}
      >
        {/* Low-res Blurred Placeholder */}
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/media/port-night-mobile-placeholder.webp"
            type="image/webp"
          />
          <img
            src="/media/port-night-placeholder.webp"
            alt=""
            aria-hidden="true"
            width={isMobile ? 450 : 960}
            height={isMobile ? 600 : 540}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isMainLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        </picture>

        {/* Sharp Multi-Resolution Picture Element */}
        <picture>
          {/* Mobile 3:4 Crop Sources */}
          <source
            media="(max-width: 767px)"
            srcSet="/media/port-night-mobile-1200.avif 900w, /media/port-night-mobile-600.avif 450w"
            sizes="100vw"
            type="image/avif"
          />
          <source
            media="(max-width: 767px)"
            srcSet="/media/port-night-mobile-1200.webp 900w, /media/port-night-mobile-600.webp 450w"
            sizes="100vw"
            type="image/webp"
          />

          {/* Desktop 16:9 Sources */}
          <source
            srcSet="/media/port-night-3840.avif 3840w, /media/port-night-1920.avif 1920w, /media/port-night-960.avif 960w"
            sizes="100vw"
            type="image/avif"
          />
          <source
            srcSet="/media/port-night-3840.webp 3840w, /media/port-night-1920.webp 1920w, /media/port-night-960.webp 960w"
            sizes="100vw"
            type="image/webp"
          />
          <img
            src="/media/port-night-1920.webp"
            alt="Deepwater Container & Bulk Maritime Port Terminal at Night"
            width={3840}
            height={2160}
            loading="eager"
            decoding="async"
            onLoad={() => setIsMainLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isMainLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>

        {/* Lighthouse Rotating Beam */}
        <div
          className="absolute pointer-events-none will-change-transform"
          style={{
            left: '9.7%',
            top: '31.0%',
            width: '60vw',
            height: '220px',
            transformOrigin: '0% 50%',
          }}
        >
          <div
            className="w-full h-full animate-lighthouse-sweep"
            style={{
              background: 'radial-gradient(ellipse at 0% 50%, rgba(255, 248, 220, 0.45) 0%, rgba(255, 230, 160, 0.15) 30%, transparent 70%)',
              clipPath: 'polygon(0% 48%, 100% 0%, 100% 100%, 0% 52%)',
            }}
          />
        </div>

        {/* Moon Glow */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: '20.5%',
            top: '12.0%',
            width: '80px',
            height: '80px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 75%)',
          }}
        />
      </div>

      {/* Brightness Exposure Fade Overlay (Beat 0) */}
      <div
        ref={brightnessOverlayRef}
        className="absolute inset-0 pointer-events-none bg-[#030407] transition-opacity duration-75"
        style={{ opacity: 0.85 }}
      />
    </div>
  );
};

export default PortVisualLayer;
