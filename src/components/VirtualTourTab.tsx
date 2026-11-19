import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Globe,
  Images,
  Loader2,
  MapPin,
  Move,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { CollegeRecord } from '../types/college';
import { getCampusBannerAsset } from '../utils/campusAssets';
import { CampusVirtualTourData } from '../utils/virtualTours';

interface VirtualTourTabProps {
  college: CollegeRecord;
  tourData: CampusVirtualTourData;
}

type TourViewMode = 'embed' | 'gallery';

export const VirtualTourTab: React.FC<VirtualTourTabProps> = ({ college, tourData }) => {
  const bannerAsset = getCampusBannerAsset(college);
  const hasEmbed = Boolean(tourData.embedUrl);

  const [viewMode, setViewMode] = useState<TourViewMode>(
    hasEmbed ? 'embed' : 'gallery'
  );
  const [activeStopIdx, setActiveStopIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isAutoPanning, setIsAutoPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null
  );
  const autoPanPhaseRef = useRef(0);

  // Reset tour state cleanly whenever inspected college switches
  useEffect(() => {
    const initialHasEmbed = Boolean(tourData.embedUrl);
    setViewMode(initialHasEmbed ? 'embed' : 'gallery');
    setActiveStopIdx(0);
    setIframeLoaded(false);
    setImgError(false);
    setIsAutoPanning(false);
  }, [college.id, tourData.embedUrl]);

  const currentStop = tourData.stops[activeStopIdx] ?? tourData.stops[0];

  // Sync camera pan/zoom defaults when switching stops
  useEffect(() => {
    if (!currentStop) return;
    setZoom(currentStop.defaultZoom);
    setPan({ x: currentStop.initialPanX, y: currentStop.initialPanY });
    setImgError(false);
  }, [activeStopIdx, currentStop]);

  // Smooth optional auto-pan sweep in gallery mode
  useEffect(() => {
    if (!isAutoPanning || viewMode !== 'gallery') return;
    setZoom((prev) => (prev < 1.3 ? 1.35 : prev));

    const timer = window.setInterval(() => {
      autoPanPhaseRef.current += 0.035;
      const nextX = Math.sin(autoPanPhaseRef.current) * 16;
      setPan((prev) => ({ x: Number(nextX.toFixed(2)), y: prev.y }));
    }, 45);

    return () => window.clearInterval(timer);
  }, [isAutoPanning, viewMode]);

  const clampPan = (x: number, y: number, currentZoom: number) => {
    const maxOffset = Math.max(0, (currentZoom - 1) * 32);
    return {
      x: Math.max(-maxOffset, Math.min(maxOffset, x)),
      y: Math.max(-maxOffset, Math.min(maxOffset, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1.02) return;
    setIsAutoPanning(false);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = (e.clientX - dragStartRef.current.x) * 0.14;
    const dy = (e.clientY - dragStartRef.current.y) * 0.14;
    setPan(clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy, zoom));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleZoomStep = (delta: number) => {
    setIsAutoPanning(false);
    setZoom((prev) => {
      const next = Number(Math.max(1, Math.min(2.2, prev + delta)).toFixed(2));
      setPan((currPan) => clampPan(currPan.x, currPan.y, next));
      return next;
    });
  };

  const handleResetView = () => {
    setIsAutoPanning(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCycleStop = (dir: -1 | 1) => {
    setIsAutoPanning(false);
    setActiveStopIdx((prev) => (prev + dir + tourData.stops.length) % tourData.stops.length);
  };

  return (
    <div className="space-y-5 animate-fade-slide">
      {/* Tour Controls & Official Tour Link Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E1B4B] dark:text-slate-100">
            <Compass className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="truncate">{tourData.tourLabel}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hasEmbed && viewMode === 'embed'
              ? 'Interactive tour loaded directly from the official campus portal'
              : 'Explore verified campus views with pan/zoom inspection controls'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasEmbed && (
            <div
              role="tablist"
              aria-label="Virtual tour view mode"
              className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'embed'}
                onClick={() => setViewMode('embed')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'embed'
                    ? 'bg-white dark:bg-slate-900 text-[#1E1B4B] dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Live 360° / Portal</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'gallery'}
                onClick={() => setViewMode('gallery')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'gallery'
                    ? 'bg-white dark:bg-slate-900 text-[#1E1B4B] dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                <span>Photo Gallery</span>
              </button>
            </div>
          )}

          {tourData.officialTourUrl && (
            <a
              href={tourData.officialTourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open Full Tour</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Immersive Stage */}
      {hasEmbed && viewMode === 'embed' && tourData.embedUrl ? (
        <div className="space-y-3">
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300 z-10 pointer-events-none">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xs font-medium">
                  Connecting to {college.shortName} virtual tour...
                </span>
              </div>
            )}
            <iframe
              key={tourData.embedUrl}
              src={tourData.embedUrl}
              title={`${college.name} Virtual Campus Tour`}
              allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking; autoplay"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIframeLoaded(true)}
              className="w-full h-full border-0 relative z-20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Viewing embedded stream from{' '}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {(() => {
                  try {
                    return new URL(tourData.embedUrl).hostname;
                  } catch {
                    return college.shortName;
                  }
                })()}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className="text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
            >
              Switch to interactive photo gallery
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Interactive Pan & Zoom Campus Gallery Viewport */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 select-none ${
              zoom > 1.02
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-default'
            }`}
          >
            {!currentStop?.imageSrc || imgError ? (
              <div
                className={`w-full h-full bg-gradient-to-br ${bannerAsset.fallbackGradient} flex flex-col items-center justify-center px-6 text-center`}
              >
                <Building2 className="w-10 h-10 text-white/70 mb-2" />
                <div className="text-sm font-semibold text-white">
                  {college.name}
                </div>
                <p className="text-xs text-white/75 mt-1">
                  Launch the official portal link above to explore campus facilities.
                </p>
              </div>
            ) : (
              <img
                src={currentStop.imageSrc}
                alt={currentStop.alt}
                referrerPolicy="no-referrer"
                draggable={false}
                onError={() => setImgError(true)}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
                  transition: isDragging
                    ? 'none'
                    : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="w-full h-full object-cover will-change-transform"
              />
            )}

            {/* Measured Bottom Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

            {/* Top Viewer Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-sm border border-white/15 text-[11px] font-mono tabular-nums text-white whitespace-nowrap">
                <span>
                  {String(activeStopIdx + 1).padStart(2, '0')} /{' '}
                  {String(tourData.stops.length).padStart(2, '0')}
                </span>
                {zoom > 1.02 && (
                  <>
                    <span className="text-white/40" aria-hidden="true">
                      ·
                    </span>
                    <Move className="w-3 h-3 text-blue-300" />
                    <span>Drag to pan ({zoom.toFixed(1)}x)</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 bg-slate-950/70 backdrop-blur-sm border border-white/15 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setIsAutoPanning((p) => !p)}
                  title={isAutoPanning ? 'Pause panoramic sweep' : 'Auto-pan campus sweep'}
                  aria-label={isAutoPanning ? 'Pause panoramic sweep' : 'Auto-pan campus sweep'}
                  className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isAutoPanning
                      ? 'bg-[#2563EB] text-white'
                      : 'text-white/85 hover:bg-white/15'
                  }`}
                >
                  {isAutoPanning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleZoomStep(-0.35)}
                  disabled={zoom <= 1}
                  title="Zoom out"
                  aria-label="Zoom out"
                  className="p-1.5 rounded-md text-white/85 hover:bg-white/15 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoomStep(0.35)}
                  disabled={zoom >= 2.2}
                  title="Zoom in"
                  aria-label="Zoom in"
                  className="p-1.5 rounded-md text-white/85 hover:bg-white/15 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  title="Reset view"
                  aria-label="Reset camera view"
                  className="p-1.5 rounded-md text-white/85 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Landmark Info + Prev/Next Stop Controls */}
            <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3 z-10">
              <div className="min-w-0 text-white">
                <div className="text-sm font-semibold leading-snug truncate">
                  {currentStop?.title}
                </div>
                <div className="text-xs text-slate-200 mt-0.5 line-clamp-2">
                  {currentStop?.subtitle}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCycleStop(-1)}
                  aria-label="Previous campus angle"
                  className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-950/90 text-white border border-white/15 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCycleStop(1)}
                  aria-label="Next campus angle"
                  className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-950/90 text-white border border-white/15 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Clickable Tour Stop Thumbnails */}
          <div className="grid grid-cols-3 gap-2.5">
            {tourData.stops.map((stop, idx) => {
              const active = idx === activeStopIdx;
              return (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => {
                    setIsAutoPanning(false);
                    setActiveStopIdx(idx);
                  }}
                  className={`group text-left rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    active
                      ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-[#EEF2FF]/60 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="relative h-16 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {stop.imageSrc ? (
                      <img
                        src={stop.imageSrc}
                        alt={stop.alt}
                        referrerPolicy="no-referrer"
                        style={{
                          transform: `scale(${Math.max(1, stop.defaultZoom * 0.9)}) translate(${stop.initialPanX * 0.5}%, ${stop.initialPanY * 0.5}%)`,
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${bannerAsset.fallbackGradient} flex items-center justify-center`}
                      >
                        <Building2 className="w-5 h-5 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <div
                      className={`text-[11px] font-semibold truncate ${
                        active
                          ? 'text-[#2563EB] dark:text-blue-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {stop.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Official 360° Tour Portal Launch Notice for Frame-Restricted Portals */}
          {!hasEmbed && tourData.officialTourUrl && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-semibold text-[#1E1B4B] dark:text-slate-100">
                  Interactive 360° Official Portal Experience
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {college.shortName} hosts its full interactive campus tour directly on its
                  institutional domain. Launch it in a full tab to walk through all blocks.
                </p>
              </div>
              <a
                href={tourData.officialTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E1B4B] dark:bg-blue-600 text-white hover:bg-indigo-950 dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Launch 360° Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Key Campus Zones & Landmarks */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <span>Key Campus Landmarks in {college.city}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-700 dark:text-slate-300">
          {tourData.highlights.map((item, idx) => (
            <div
              key={item}
              className="flex items-baseline gap-2 py-1 border-b border-slate-100 dark:border-slate-800/70"
            >
              <span className="font-mono tabular-nums text-[11px] font-semibold text-[#2563EB] dark:text-blue-400 shrink-0">
                0{idx + 1}.
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
