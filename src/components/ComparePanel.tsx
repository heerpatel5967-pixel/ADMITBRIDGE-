import React from 'react';
import { ExternalLink, MessageSquare, Plus, X } from 'lucide-react';
import { CollegeRecord } from '../types/college';

interface ComparePanelProps {
  allColleges: CollegeRecord[];
  selectedIds: string[];
  onToggleCompare: (id: string) => void;
  onAddCompareId: (id: string) => void;
  onInspectCollege: (college: CollegeRecord) => void;
  onRunAiComparison: (collegesToCompare: CollegeRecord[]) => void;
}

export const ComparePanel: React.FC<ComparePanelProps> = ({
  allColleges,
  selectedIds,
  onToggleCompare,
  onAddCompareId,
  onInspectCollege,
  onRunAiComparison,
}) => {
  const selectedColleges = selectedIds
    .map((id) => allColleges.find((c) => c.id === id))
    .filter((c): c is CollegeRecord => Boolean(c));

  const availableToAdd = allColleges.filter((c) => !selectedIds.includes(c.id));

  return (
    <div className="flex flex-col h-full bg-[#F4F7FC] dark:bg-slate-950 transition-colors">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#EEF2FF] via-white to-[#ECFDF5]/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-b border-[#DCE4F2] dark:border-slate-800 px-5 sm:px-8 py-4 shrink-0 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
              Side-by-Side UG & PG Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Compare 2 to 3 institutions across UG & PG courses, total fees, fee recovery ROI,
              entrance exams, placements & admission portals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {selectedColleges.length < 3 && availableToAdd.length > 0 && (
              <div className="relative">
                <select
                  aria-label="Add college to compare"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) onAddCompareId(e.target.value);
                  }}
                  className="pl-3 pr-8 py-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="">+ Add institution ({selectedColleges.length}/3)</option>
                  {availableToAdd.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortName} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedColleges.length >= 2 && (
              <button
                type="button"
                onClick={() => onRunAiComparison(selectedColleges)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-700 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI for Verdict</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Comparison Matrix */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {selectedColleges.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                No colleges selected for comparison
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Click Compare on any college in the left sidebar or directory, or add institutions
                using the selector above.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {allColleges.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onAddCompareId(c.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{c.shortName}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-[#DCE4F2] dark:border-slate-800 rounded-xl overflow-hidden transition-colors shadow-sm shadow-indigo-950/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="border-b border-[#DCE4F2] dark:border-slate-800 bg-[#EEF4FF]/70 dark:bg-slate-800/60">
                      <th className="w-44 px-5 py-4 text-xs font-semibold text-[#1E1B4B]/75 dark:text-slate-400 align-top">
                        Metric / Parameter
                      </th>
                      {selectedColleges.map((c) => (
                        <th key={c.id} className="px-5 py-4 align-top min-w-[210px]">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <button
                                type="button"
                                onClick={() => onInspectCollege(c)}
                                className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-400 text-left cursor-pointer"
                              >
                                {c.shortName}
                              </button>
                              <div className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                                {c.city}, {c.state} · {c.type}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onToggleCompare(c.id)}
                              className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer"
                              aria-label={`Remove ${c.shortName} from comparison`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                    <tr>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Official Portal
                      </td>
                      {selectedColleges.map((c) => (
                        <td key={c.id} className="px-5 py-3.5">
                          {c.portalUrl ? (
                            <a
                              href={c.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors whitespace-nowrap"
                            >
                              <span>Official / Admission Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        UG Courses
                      </td>
                      {selectedColleges.map((c) => (
                        <td key={c.id} className="px-5 py-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                          {c.ugCourses.join(', ')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        PG Courses
                      </td>
                      {selectedColleges.map((c) => (
                        <td key={c.id} className="px-5 py-3.5 text-xs font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                          {c.pgCourses.join(', ')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        UG Total Fee Range
                      </td>
                      {selectedColleges.map((c) => (
                        <td
                          key={c.id}
                          className="px-5 py-3.5 font-mono tabular-nums text-xs font-semibold text-slate-900 dark:text-slate-100"
                        >
                          {c.feeRanges.ugTotal}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        PG Total Fee Range
                      </td>
                      {selectedColleges.map((c) => (
                        <td
                          key={c.id}
                          className="px-5 py-3.5 font-mono tabular-nums text-xs font-semibold text-slate-900 dark:text-slate-100"
                        >
                          {c.feeRanges.pgTotal}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Placement Highlights
                      </td>
                      {selectedColleges.map((c) => (
                        <td
                          key={c.id}
                          className="px-5 py-3.5 font-mono tabular-nums text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed"
                        >
                          {c.placementHighlights}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Entrance Exams
                      </td>
                      {selectedColleges.map((c) => (
                        <td key={c.id} className="px-5 py-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {c.entranceExams.join(' · ')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
