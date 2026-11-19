import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { CollegeRecord } from '../types/college';
import {
  ChanceMeProfile,
  EligibilityResult,
  computeRoiMetrics,
} from '../utils/admissions';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allColleges: CollegeRecord[];
  selectedIds: string[];
  onToggleCompare: (id: string) => void;
  onAddCompareId: (id: string) => void;
  onInspectCollege: (college: CollegeRecord) => void;
  chanceMeProfile: ChanceMeProfile;
  eligibilityByCollege: Map<string, EligibilityResult>;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  isOpen,
  onClose,
  allColleges,
  selectedIds,
  onToggleCompare,
  onAddCompareId,
  onInspectCollege,
  chanceMeProfile,
  eligibilityByCollege,
}) => {
  const selectedColleges = selectedIds
    .slice(0, 3)
    .map((id) => allColleges.find((c) => c.id === id))
    .filter((c): c is CollegeRecord => Boolean(c));

  const availableToAdd = allColleges.filter((c) => !selectedIds.includes(c.id));

  const [summaryMap, setSummaryMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeKeyRef = useRef<string>('');

  const cacheKey = `${selectedColleges.map((c) => c.id).join('|')}::${chanceMeProfile.exam}:${chanceMeProfile.score}:${chanceMeProfile.rajasthanDomicile}`;
  const currentSummary = summaryMap[cacheKey] ?? '';

  const fetchRecommendation = useCallback(
    async (force = false) => {
      if (selectedColleges.length < 2) return;
      if (!force && summaryMap[cacheKey]) return;

      activeKeyRef.current = cacheKey;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/compare-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            colleges: selectedColleges,
            chanceMeProfile,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to generate AI recommendation summary.');
        }
        if (activeKeyRef.current === cacheKey) {
          setSummaryMap((prev) => ({ ...prev, [cacheKey]: data.summary || '' }));
        }
      } catch (err) {
        if (activeKeyRef.current === cacheKey) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to generate AI recommendation summary.'
          );
        }
      } finally {
        if (activeKeyRef.current === cacheKey) {
          setLoading(false);
        }
      }
    },
    [cacheKey, chanceMeProfile, selectedColleges, summaryMap]
  );

  useEffect(() => {
    if (isOpen && selectedColleges.length >= 2 && !summaryMap[cacheKey]) {
      fetchRecommendation(false);
    }
  }, [isOpen, selectedColleges.length, cacheKey, summaryMap, fetchRecommendation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/45 dark:bg-black/75 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl transition-colors">
        {/* Drawer Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Multi-College Compare Drawer ({selectedColleges.length}/3)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side comparison of Fees, Avg Package, Entrance Exams, Official Portal Links
              & AI Recommendation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedColleges.length < 3 && availableToAdd.length > 0 && (
              <select
                aria-label="Add college to Compare Drawer"
                value=""
                onChange={(e) => {
                  if (e.target.value) onAddCompareId(e.target.value);
                }}
                className="pl-2.5 pr-7 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="">+ Add ({selectedColleges.length}/3)</option>
                {availableToAdd.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName} ({c.city})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close compare drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">
          {selectedColleges.length < 2 ? (
            <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Select at least 2 colleges to compare (up to 3)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Use the Compare checkboxes on college cards or pick institutions below to launch
                a side-by-side table and AI recommendation summary.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {availableToAdd.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onAddCompareId(c.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{c.shortName}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Side-by-Side Comparison Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                        <th className="w-40 px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 align-top">
                          Comparison Metric
                        </th>
                        {selectedColleges.map((c) => {
                          const chance = eligibilityByCollege.get(c.id);
                          return (
                            <th key={c.id} className="px-4 py-3.5 align-top min-w-[190px]">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onInspectCollege(c);
                                      onClose();
                                    }}
                                    className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-400 text-left cursor-pointer"
                                  >
                                    {c.shortName}
                                  </button>
                                  <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                                    {c.city} · {c.type}
                                  </div>
                                  {chance && (
                                    <span
                                      className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${
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
                                <button
                                  type="button"
                                  onClick={() => onToggleCompare(c.id)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 cursor-pointer shrink-0"
                                  aria-label={`Remove ${c.shortName}`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">
                          Total Fees (UG / PG)
                        </td>
                        {selectedColleges.map((c) => (
                          <td
                            key={c.id}
                            className="px-4 py-3 font-mono tabular-nums text-slate-900 dark:text-slate-100 space-y-1"
                          >
                            <div>
                              <span className="font-sans font-medium text-slate-500 dark:text-slate-400">
                                UG:{' '}
                              </span>
                              <span className="font-semibold">{c.feeRanges.ugTotal}</span>
                            </div>
                            <div>
                              <span className="font-sans font-medium text-slate-500 dark:text-slate-400">
                                PG:{' '}
                              </span>
                              <span className="font-semibold">{c.feeRanges.pgTotal}</span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">
                          Avg Package & Placements
                        </td>
                        {selectedColleges.map((c) => (
                          <td
                            key={c.id}
                            className="px-4 py-3 font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed"
                          >
                            {c.placementHighlights}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">
                          Est. Fee Recovery Time
                        </td>
                        {selectedColleges.map((c) => {
                          const roi = computeRoiMetrics(c, 'ALL');
                          return (
                            <td key={c.id} className="px-4 py-3 space-y-1.5">
                              <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                                UG {roi.ug.paybackLabel} · PG {roi.pg.paybackLabel}
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    roi.primary.tierLabel === 'Fast'
                                      ? 'bg-emerald-600 dark:bg-emerald-500'
                                      : roi.primary.tierLabel === 'Balanced'
                                        ? 'bg-blue-600 dark:bg-blue-500'
                                        : 'bg-amber-600 dark:bg-amber-500'
                                  }`}
                                  style={{ width: `${roi.primary.barWidthPercent}%` }}
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">
                          Entrance Exams
                        </td>
                        {selectedColleges.map((c) => (
                          <td
                            key={c.id}
                            className="px-4 py-3 text-slate-700 dark:text-slate-300 leading-relaxed"
                          >
                            {c.entranceExams.join(' · ')}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">
                          Official Portal Link
                        </td>
                        {selectedColleges.map((c) => (
                          <td key={c.id} className="px-4 py-3">
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
                              <span className="text-slate-400">Not listed</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI-Generated Recommendation Summary */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      AI Recommendation Summary
                    </h3>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => fetchRecommendation(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refresh Verdict</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2.5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-700 dark:text-blue-400" />
                    <span>
                      Comparing fees, ROI payback & entrance fit across {selectedColleges.length}{' '}
                      colleges...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchRecommendation(true)}
                      className="font-semibold underline shrink-0 cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : currentSummary ? (
                  <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed space-y-2.5">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children }) => (
                          <h4 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 mt-3 first:mt-0">
                            {children}
                          </h4>
                        ),
                        h3: ({ children }) => (
                          <h5 className="font-display text-xs font-semibold text-slate-900 dark:text-slate-100 mt-2.5 first:mt-0">
                            {children}
                          </h5>
                        ),
                        p: ({ children }) => (
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            {children}
                          </ul>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-slate-900 dark:text-white">
                            {children}
                          </strong>
                        ),
                        a: ({ href, children }) =>
                          href && /^https?:\/\//i.test(href) ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 no-underline whitespace-nowrap"
                            >
                              <span>{children}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span>{children}</span>
                          ),
                      }}
                    >
                      {currentSummary}
                    </ReactMarkdown>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
