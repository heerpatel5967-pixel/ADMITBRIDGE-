import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export type QuickPresetId =
  | 'all'
  | 'jaipur'
  | 'iits'
  | 'govt'
  | 'private'
  | 'high-roi';

const QUICK_PILLS: Array<{ id: QuickPresetId; label: string }> = [
  { id: 'all', label: 'All Colleges' },
  { id: 'jaipur', label: 'Jaipur Hub' },
  { id: 'iits', label: 'IITs' },
  { id: 'govt', label: 'Govt / NIT' },
  { id: 'private', label: 'Private Universities' },
  { id: 'high-roi', label: 'High ROI' },
];

interface HeroSearchBannerProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activePreset: QuickPresetId;
  onSelectPreset: (preset: QuickPresetId) => void;
  totalMatching: number;
  onOpenMobileFilters?: () => void;
}

export const HeroSearchBanner: React.FC<HeroSearchBannerProps> = ({
  searchQuery,
  onSearchChange,
  activePreset,
  onSelectPreset,
  totalMatching,
  onOpenMobileFilters,
}) => {
  return (
    <section
      aria-label="Portal search and quick filters"
      className="bg-gradient-to-r from-[#EEF2FF] via-[#F8FAFC] to-[#ECFDF5]/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-b border-[#DCE4F2] dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 shrink-0 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Brand Title & Concise Tagline */}
          <div className="space-y-0.5 max-w-xl">
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#1E1B4B] dark:text-slate-100 text-balance">
              Find Your Best-Fit UG & PG Campus by Fees, Exams & ROI
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Compare {totalMatching} verified Indian institutions across JEE Advanced, JEE Main,
              GATE, IIT JAM, CAT & CUET pathways.
            </p>
          </div>

          {/* Unified Live Search Input */}
          <div className="flex items-center gap-2 w-full lg:w-[440px] shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-indigo-500 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search by college name, city, course, or entrance exam"
                placeholder="Search IIT, 'JEE Advanced', 'GATE', 'IIT JAM', 'Jaipur'..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-white/95 dark:bg-slate-800/90 border border-[#CBD5E1] dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-600/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {onOpenMobileFilters && (
              <button
                type="button"
                onClick={onOpenMobileFilters}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-[#1E1B4B] dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick One-Tap Filter Pills */}
        <div
          role="group"
          aria-label="Quick campus filters"
          className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-0.5"
        >
          {QUICK_PILLS.map((pill) => {
            const active = activePreset === pill.id;
            const inactiveColorMap: Record<QuickPresetId, string> = {
              all: 'bg-white/90 dark:bg-slate-800/80 border-[#CBD5E1] dark:border-slate-700 text-[#1E1B4B] dark:text-slate-300 hover:bg-indigo-50/70',
              jaipur:
                'bg-amber-50/90 dark:bg-slate-800/80 border-amber-200 dark:border-slate-700 text-amber-900 dark:text-slate-300 hover:bg-amber-100/80',
              iits: 'bg-violet-50/90 dark:bg-slate-800/80 border-violet-200 dark:border-slate-700 text-violet-900 dark:text-slate-300 hover:bg-violet-100/80',
              govt: 'bg-emerald-50/90 dark:bg-slate-800/80 border-emerald-200 dark:border-slate-700 text-emerald-900 dark:text-slate-300 hover:bg-emerald-100/80',
              private:
                'bg-indigo-50/90 dark:bg-slate-800/80 border-indigo-200 dark:border-slate-700 text-indigo-900 dark:text-slate-300 hover:bg-indigo-100/80',
              'high-roi':
                'bg-sky-50/90 dark:bg-slate-800/80 border-sky-200 dark:border-slate-700 text-sky-900 dark:text-slate-300 hover:bg-sky-100/80',
            };
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onSelectPreset(pill.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 border ${
                  active
                    ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-xs'
                    : inactiveColorMap[pill.id]
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
