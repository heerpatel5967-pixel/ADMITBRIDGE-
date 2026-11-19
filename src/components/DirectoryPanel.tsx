import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  Layers,
  Target,
  TrendingUp,
} from 'lucide-react';
import { ActiveFilters, CollegeRecord } from '../types/college';
import {
  EligibilityResult,
  computeRoiMetrics,
} from '../utils/admissions';
import {
  extractAvgPackageLabel,
  getCampusBannerAsset,
} from '../utils/campusAssets';

export type SortOption =
  | 'default'
  | 'avg-desc'
  | 'ug-fee-asc'
  | 'pg-fee-asc'
  | 'payback-asc';

interface DirectoryPanelProps {
  colleges: CollegeRecord[];
  filters: ActiveFilters;
  selectedCompareIds: string[];
  onToggleCompare: (id: string) => void;
  shortlistIds: string[];
  onToggleShortlist: (id: string) => void;
  onInspectCollege: (college: CollegeRecord) => void;
  onOpenCompareDrawer: () => void;
  onResetFilters: () => void;
  eligibilityByCollege: Map<string, EligibilityResult>;
  sortBy: SortOption;
  onChangeSortBy: (next: SortOption) => void;
  isFiltering?: boolean;
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

const CampusBannerImage: React.FC<{ college: CollegeRecord }> = ({ college }) => {
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

const CollegeCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-hidden">
    <div className="w-full aspect-[16/9] skeleton-shimmer" />
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded-md skeleton-shimmer" />
        <div className="h-3.5 w-1/2 rounded-md skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-10 rounded-md skeleton-shimmer" />
        <div className="h-10 rounded-md skeleton-shimmer" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-9 w-36 rounded-lg skeleton-shimmer" />
        <div className="h-8 w-20 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  </div>
);

export const DirectoryPanel: React.FC<DirectoryPanelProps> = ({
  colleges,
  filters,
  selectedCompareIds,
  onToggleCompare,
  shortlistIds,
  onToggleShortlist,
  onInspectCollege,
  onOpenCompareDrawer,
  onResetFilters,
  eligibilityByCollege,
  sortBy,
  onChangeSortBy,
  isFiltering = false,
}) => {
  const activeDegreeFocus =
    filters.degreeLevels.length === 1 ? filters.degreeLevels[0] : 'ALL';

  const sortedColleges = useMemo(() => {
    const copy = [...colleges];
    if (sortBy === 'avg-desc') {
      return copy.sort((a, b) => b.avgPackageNum - a.avgPackageNum);
    }
    if (sortBy === 'ug-fee-asc') {
      return copy.sort((a, b) => a.minUgFeeLakhs - b.minUgFeeLakhs);
    }
    if (sortBy === 'pg-fee-asc') {
      return copy.sort((a, b) => a.minPgFeeLakhs - b.minPgFeeLakhs);
    }
    if (sortBy === 'payback-asc') {
      return copy.sort(
        (a, b) =>
          computeRoiMetrics(a, activeDegreeFocus).primary.paybackYears -
          computeRoiMetrics(b, activeDegreeFocus).primary.paybackYears
      );
    }
    return copy;
  }, [colleges, sortBy, activeDegreeFocus]);

  const filterKey = useMemo(
    () =>
      [
        filters.search,
        filters.degreeLevels.join(','),
        filters.locations.join(','),
        filters.institutionTypes.join(','),
        filters.programs.join(','),
        sortBy,
      ].join('|'),
    [filters, sortBy]
  );

  return (
    <div className="flex flex-col h-full bg-[#F4F7FC] dark:bg-slate-950 transition-colors">
      {/* Compact Toolbar */}
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 border-b border-[#DCE4F2] dark:border-slate-800 bg-[#F4F7FC]/95 dark:bg-slate-950/90 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Showing{' '}
            <span className="font-mono tabular-nums font-semibold text-[#1E1B4B] dark:text-slate-100">
              {sortedColleges.length}
            </span>{' '}
            {sortedColleges.length === 1 ? 'institution' : 'institutions'}
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

            <label
              htmlFor="directory-sort"
              className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
            >
              Sort by
            </label>
            <select
              id="directory-sort"
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="default">Curated Order</option>
              <option value="payback-asc">Fastest Fee Recovery (ROI)</option>
              <option value="avg-desc">Highest Avg Placement</option>
              <option value="ug-fee-asc">Lowest UG Fee</option>
              <option value="pg-fee-asc">Lowest PG Fee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Uncluttered Card Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          {isFiltering ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((idx) => (
                <CollegeCardSkeleton key={idx} />
              ))}
            </div>
          ) : sortedColleges.length === 0 ? (
            <div className="animate-fade-slide bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-10 text-center">
              <h2 className="text-base font-semibold text-[#1E1B4B] dark:text-slate-100">
                No institutions match the active filters
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
                Try clearing your search term or selecting a broader filter pill above.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              key={filterKey}
              className="animate-fade-slide grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {sortedColleges.map((college) => {
                const isCompared = selectedCompareIds.includes(college.id);
                const isShortlisted = shortlistIds.includes(college.id);
                const eligibility = eligibilityByCollege.get(college.id);
                const tierMeta = eligibility ? TIER_STYLES[eligibility.tier] : null;
                const TierIcon = tierMeta?.icon;
                const avgPackage = extractAvgPackageLabel(college.placementHighlights);
                const isGovt = college.institutionTypeTags.includes('Government/NIT/IIT');

                return (
                  <article
                    key={college.id}
                    className="group bg-white dark:bg-slate-900 border border-[#DCE4F2] dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-[0_12px_28px_-12px_rgba(37,99,235,0.16)] dark:hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.5)]"
                  >
                    <div>
                      {/* Campus Banner Image + Quick Shortlist Bookmark */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => onInspectCollege(college)}
                          className="block w-full text-left cursor-pointer focus:outline-none"
                          aria-label={`View full details for ${college.name}`}
                        >
                          <CampusBannerImage college={college} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleShortlist(college.id)}
                          title={
                            isShortlisted
                              ? 'Remove from My Shortlist'
                              : 'Save to My Shortlist'
                          }
                          aria-label={
                            isShortlisted
                              ? `Remove ${college.shortName} from My Shortlist`
                              : `Save ${college.shortName} to My Shortlist`
                          }
                          className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm border transition-all cursor-pointer ${
                            isShortlisted
                              ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                              : 'bg-white/92 dark:bg-slate-900/90 border-white/60 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          {isShortlisted ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                          <span>{isShortlisted ? 'Saved' : 'Shortlist'}</span>
                        </button>
                      </div>

                      {/* Card Body: Name, City/Type, Chance Me Pill, UG/PG Fees & Avg Package */}
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
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
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

                        {/* Uncluttered Fee & Placement Summary */}
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

                    {/* Minimal Card Footer: View Full Details + Compare Checkbox */}
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
