import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookmarkCheck,
  BookmarkX,
  Building2,
  CheckCircle2,
  Compass,
  Layers,
  LogIn,
  Target,
  TrendingUp,
} from 'lucide-react';
import { CollegeRecord } from '../types/college';
import { EligibilityResult } from '../utils/admissions';
import {
  extractAvgPackageLabel,
  getCampusBannerAsset,
} from '../utils/campusAssets';

interface ShortlistPanelProps {
  colleges: CollegeRecord[];
  selectedCompareIds: string[];
  onToggleCompare: (id: string) => void;
  onToggleShortlist: (id: string) => void;
  onInspectCollege: (college: CollegeRecord) => void;
  onOpenCompareDrawer: () => void;
  onBrowseDirectory: () => void;
  eligibilityByCollege: Map<string, EligibilityResult>;
  isAuthenticated: boolean;
  onOpenSignIn: () => void;
}

const TIER_STYLES: Record<
  EligibilityResult['tier'],
  { badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Safe: {
    badge:
      'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  Target: {
    badge:
      'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Target,
  },
  Reach: {
    badge:
      'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: TrendingUp,
  },
};

const ShortlistBannerImage: React.FC<{ college: CollegeRecord }> = ({ college }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const asset = getCampusBannerAsset(college);

  useEffect(() => {
    setImgFailed(false);
  }, [asset.src]);

  if (!asset.src || imgFailed) {
    return (
      <div
        className={`w-full aspect-[16/9] bg-gradient-to-br ${asset.fallbackGradient} flex flex-col items-center justify-center px-4 text-center`}
      >
        <Building2 className="w-7 h-7 text-white/75 mb-1.5" />
        <span className="text-xs font-medium text-white/90 truncate max-w-full">
          {college.shortName}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
      <img
        src={asset.src}
        alt={asset.alt}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`w-full h-full object-cover ${asset.objectPositionClass ?? 'object-center'} transition-transform duration-300 ease-out group-hover:scale-[1.03]`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent pointer-events-none" />
      {!asset.hasEmbeddedSignage && (
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
          <span className="inline-block max-w-full truncate px-2.5 py-1 rounded-md bg-slate-950/75 backdrop-blur-sm text-white text-xs font-semibold border border-white/15">
            {college.name}
          </span>
        </div>
      )}
    </div>
  );
};

export const ShortlistPanel: React.FC<ShortlistPanelProps> = ({
  colleges,
  selectedCompareIds,
  onToggleCompare,
  onToggleShortlist,
  onInspectCollege,
  onOpenCompareDrawer,
  onBrowseDirectory,
  eligibilityByCollege,
  isAuthenticated,
  onOpenSignIn,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#F4F7FC] dark:bg-slate-950 transition-colors">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#EEF2FF] via-white to-[#ECFDF5]/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-b border-[#DCE4F2] dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shrink-0 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
              My Shortlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-mono tabular-nums text-[#1E1B4B] dark:text-slate-200 font-semibold">
                {colleges.length}
              </span>{' '}
              {colleges.length === 1 ? 'saved institution' : 'saved institutions'} ·{' '}
              {isAuthenticated
                ? 'Synced automatically to your Google account'
                : 'Saved in browser session · Sign in to sync across devices'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {selectedCompareIds.length >= 2 && (
              <button
                type="button"
                onClick={onOpenCompareDrawer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1E1B4B] dark:bg-blue-600 text-white hover:bg-indigo-950 dark:hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare ({selectedCompareIds.length}/3)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBrowseDirectory}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-5">
          {!isAuthenticated && (
            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed">
                <span className="font-semibold">Browsing as Guest:</span> Sign in with Google to
                save your shortlisted colleges, Chance Me exam scores, and AI counsellor chat
                history across sessions.
              </div>
              <button
                type="button"
                onClick={onOpenSignIn}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {colleges.length === 0 ? (
            <div className="animate-fade-slide bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-10 text-center">
              <BookmarkCheck className="w-8 h-8 text-[#2563EB] dark:text-blue-400 mx-auto mb-3" />
              <h2 className="text-base font-semibold text-[#1E1B4B] dark:text-slate-100">
                Your shortlist is empty
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5 max-w-md mx-auto">
                Tap Shortlist on any college card in the directory to track fees, eligibility, and
                placements side by side.
              </p>
              <button
                type="button"
                onClick={onBrowseDirectory}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Browse College Directory
              </button>
            </div>
          ) : (
            <div className="animate-fade-slide grid grid-cols-1 md:grid-cols-2 gap-5">
              {colleges.map((college) => {
                const isCompared = selectedCompareIds.includes(college.id);
                const eligibility = eligibilityByCollege.get(college.id);
                const tierMeta = eligibility ? TIER_STYLES[eligibility.tier] : null;
                const TierIcon = tierMeta?.icon;
                const avgPackage = extractAvgPackageLabel(college.placementHighlights);
                const isGovt = college.institutionTypeTags.includes('Government/NIT/IIT');

                return (
                  <article
                    key={college.id}
                    className="group bg-white dark:bg-slate-900 border border-[#DCE4F2] dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-[0_12px_28px_-12px_rgba(37,99,235,0.16)]"
                  >
                    <div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => onInspectCollege(college)}
                          className="block w-full text-left cursor-pointer"
                        >
                          <ShortlistBannerImage college={college} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleShortlist(college.id)}
                          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/92 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/80 transition-colors cursor-pointer"
                        >
                          <BookmarkX className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => onInspectCollege(college)}
                              className="text-left cursor-pointer"
                            >
                              <h2 className="text-base font-semibold text-[#1E1B4B] dark:text-slate-100 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors leading-snug">
                                {college.name}
                              </h2>
                            </button>
                            <div className="mt-1.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                                  isGovt
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                    : 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {college.city} · {college.type}
                              </span>
                            </div>
                          </div>

                          {eligibility && tierMeta && TierIcon && (
                            <span
                              title={eligibility.reason}
                              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${tierMeta.badge}`}
                            >
                              <TierIcon className="w-3.5 h-3.5 shrink-0" />
                              <span>{eligibility.tier}</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                          <div className="min-w-0 rounded-lg bg-[#F8FAFF] dark:bg-transparent border border-[#E8EEFA] dark:border-transparent p-2.5 dark:p-0">
                            <div className="text-[11px] font-medium text-indigo-900/70 dark:text-slate-400">
                              UG / PG Fee Summary
                            </div>
                            <div className="mt-1 space-y-0.5 font-mono tabular-nums text-xs text-slate-900 dark:text-slate-100">
                              <div className="truncate">
                                <span className="text-slate-500 dark:text-slate-400">UG </span>
                                <span className="font-semibold">{college.feeRanges.ugTotal}</span>
                              </div>
                              <div className="truncate">
                                <span className="text-slate-500 dark:text-slate-400">PG </span>
                                <span className="font-semibold">{college.feeRanges.pgTotal}</span>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 rounded-lg bg-emerald-50/60 dark:bg-transparent border border-emerald-200/70 dark:border-transparent p-2.5 dark:p-0">
                            <div className="text-[11px] font-medium text-emerald-900/75 dark:text-slate-400">
                              Avg Placement Package
                            </div>
                            <div className="mt-1 font-mono tabular-nums text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                              {avgPackage}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-[#F6F8FF] dark:bg-slate-900/60 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onInspectCollege(college)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-blue-600/15"
                      >
                        <span>View Full Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <label
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer select-none whitespace-nowrap ${
                          isCompared
                            ? 'bg-[#1E1B4B] dark:bg-blue-600 border-[#1E1B4B] dark:border-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-[#DCE4F2] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => onToggleCompare(college.id)}
                          className="w-3.5 h-3.5 accent-[#2563EB] rounded cursor-pointer"
                        />
                        <span>Compare</span>
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
