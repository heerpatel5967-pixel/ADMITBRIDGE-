import React from 'react';
import { Check, ExternalLink, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  DEGREE_LEVEL_OPTIONS,
  INSTITUTION_TYPE_OPTIONS,
  LOCATION_FILTER_OPTIONS,
  PROGRAM_STREAM_OPTIONS,
} from '../data/colleges';
import {
  ActiveFilters,
  CollegeRecord,
  DegreeLevel,
  InstitutionTypeFilter,
  LocationFilter,
  ProgramStream,
} from '../types/college';

interface SidebarFiltersProps {
  colleges: CollegeRecord[];
  filteredColleges: CollegeRecord[];
  filters: ActiveFilters;
  onChangeFilters: (next: ActiveFilters) => void;
  onResetFilters: () => void;
  selectedCompareIds: string[];
  onToggleCompare: (id: string) => void;
  onInspectCollege: (college: CollegeRecord) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  eligibilityByCollege?: Map<string, { tier: 'Safe' | 'Target' | 'Reach' }>;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  colleges,
  filteredColleges,
  filters,
  onChangeFilters,
  onResetFilters,
  selectedCompareIds,
  onToggleCompare,
  onInspectCollege,
  mobileOpen,
  onCloseMobile,
  eligibilityByCollege,
}) => {
  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.degreeLevels.length > 0 ||
    filters.locations.length > 0 ||
    filters.institutionTypes.length > 0 ||
    filters.programs.length > 0;

  const toggleDegreeLevel = (level: DegreeLevel) => {
    const exists = filters.degreeLevels.includes(level);
    onChangeFilters({
      ...filters,
      degreeLevels: exists
        ? filters.degreeLevels.filter((d) => d !== level)
        : [...filters.degreeLevels, level],
    });
  };

  const toggleLocation = (loc: LocationFilter) => {
    const exists = filters.locations.includes(loc);
    onChangeFilters({
      ...filters,
      locations: exists
        ? filters.locations.filter((l) => l !== loc)
        : [...filters.locations, loc],
    });
  };

  const toggleInstitutionType = (type: InstitutionTypeFilter) => {
    const exists = filters.institutionTypes.includes(type);
    onChangeFilters({
      ...filters,
      institutionTypes: exists
        ? filters.institutionTypes.filter((t) => t !== type)
        : [...filters.institutionTypes, type],
    });
  };

  const toggleProgram = (prog: ProgramStream) => {
    const exists = filters.programs.includes(prog);
    onChangeFilters({
      ...filters,
      programs: exists
        ? filters.programs.filter((p) => p !== prog)
        : [...filters.programs, prog],
    });
  };

  const countForDegreeLevel = (level: DegreeLevel) =>
    colleges.filter((c) => c.degreeLevels.includes(level)).length;

  const countForLocation = (loc: LocationFilter) =>
    colleges.filter((c) => c.locationTags.includes(loc)).length;

  const countForInstitutionType = (type: InstitutionTypeFilter) =>
    colleges.filter((c) => c.institutionTypeTags.includes(type)).length;

  const countForProgram = (prog: ProgramStream) =>
    colleges.filter((c) => c.programs.includes(prog)).length;

  const onlyUgSelected =
    filters.degreeLevels.length === 1 && filters.degreeLevels[0] === 'Undergraduate';

  const sidebarBody = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-[#DCE4F2] dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#F5F7FF] to-white dark:from-slate-900 dark:to-slate-900 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] dark:text-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-[#2563EB] dark:text-slate-400" />
          <span>Filter Institutions</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">
        <div>
          <label htmlFor="college-search" className="sr-only">
            Search colleges, courses, or exams
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="college-search"
              type="text"
              value={filters.search}
              onChange={(e) => onChangeFilters({ ...filters, search: e.target.value })}
              placeholder="College, JEE, GATE, CAT, course..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#1E1B4B]/75 dark:text-slate-400 tracking-wide mb-2">
            Degree Level
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {DEGREE_LEVEL_OPTIONS.map((level) => {
              const active = filters.degreeLevels.includes(level);
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleDegreeLevel(level)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#EEF2FF] dark:bg-blue-950/60 border-[#2563EB] dark:border-blue-500 text-[#1E1B4B] dark:text-blue-200'
                      : 'bg-white dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#F8FAFF] dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="truncate">{level}</span>
                  <span className="font-mono tabular-nums text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                    {countForDegreeLevel(level)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#1E1B4B]/75 dark:text-slate-400 tracking-wide mb-2">
            Program Stream
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {PROGRAM_STREAM_OPTIONS.map((prog) => {
              const active = filters.programs.includes(prog);
              return (
                <button
                  key={prog}
                  type="button"
                  onClick={() => toggleProgram(prog)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#EEF2FF] dark:bg-blue-950/60 border-[#2563EB] dark:border-blue-500 text-[#1E1B4B] dark:text-blue-200'
                      : 'bg-white dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#F8FAFF] dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{prog}</span>
                  <span className="font-mono tabular-nums text-[11px] text-slate-400 dark:text-slate-500">
                    {countForProgram(prog)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-2">
            State / City
          </h3>
          <div className="space-y-1">
            {LOCATION_FILTER_OPTIONS.map((loc) => {
              const active = filters.locations.includes(loc);
              const count = countForLocation(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocation(loc)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        active
                          ? 'bg-blue-700 dark:bg-blue-600 border-blue-700 dark:border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </span>
                    <span className="truncate">{loc}</span>
                  </span>
                  <span className="font-mono tabular-nums text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-2">
            Institution Type
          </h3>
          <div className="space-y-1">
            {INSTITUTION_TYPE_OPTIONS.map((type) => {
              const active = filters.institutionTypes.includes(type);
              const count = countForInstitutionType(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleInstitutionType(type)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        active
                          ? 'bg-blue-700 dark:bg-blue-600 border-blue-700 dark:border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </span>
                    <span className="truncate">{type}</span>
                  </span>
                  <span className="font-mono tabular-nums text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              Matching Institutions
            </h3>
            <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
              {filteredColleges.length} / {colleges.length}
            </span>
          </div>

          {filteredColleges.length === 0 ? (
            <div className="py-6 px-3 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                No institutions match all selected filters.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredColleges.map((college) => {
                const isCompared = selectedCompareIds.includes(college.id);
                const chance = eligibilityByCollege?.get(college.id);
                return (
                  <div
                    key={college.id}
                    className="group p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onInspectCollege(college);
                          onCloseMobile();
                        }}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                            {college.shortName}
                          </span>
                          {chance && (
                            <span
                              className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                chance.tier === 'Safe'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : chance.tier === 'Target'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              }`}
                            >
                              {chance.tier}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {college.city} · {college.type}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300 mt-1 truncate">
                          {onlyUgSelected
                            ? `UG ${college.feeRanges.ugTotal}`
                            : `UG ${college.feeRanges.ugTotal} · PG ${college.feeRanges.pgTotal}`}
                        </div>
                      </button>
                      <label
                        title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer select-none ${
                          isCompared
                            ? 'bg-blue-700 dark:bg-blue-600 border-blue-700 dark:border-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => onToggleCompare(college.id)}
                          className="w-3 h-3 accent-blue-600 rounded cursor-pointer"
                        />
                        <span>Compare</span>
                      </label>
                    </div>

                    {college.portalUrl && (
                      <a
                        href={college.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        <span>Official / Admission Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-full overflow-hidden">
        {sidebarBody}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-80 max-w-[85vw] h-full z-10 shadow-xl">
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
};
