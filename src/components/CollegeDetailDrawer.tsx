import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  Bookmark,
  BookmarkCheck,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileText,
  Info,
  MessageSquare,
  Pencil,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { CollegeRecord, DegreeLevel } from '../types/college';
import {
  ChanceMeProfile,
  EligibilityResult,
  computeRoiMetrics,
} from '../utils/admissions';
import { getCampusBannerAsset } from '../utils/campusAssets';
import { evaluateScholarshipEligibility } from '../utils/scholarships';
import { getCampusVirtualTour } from '../utils/virtualTours';
import { VirtualTourTab } from './VirtualTourTab';

interface CollegeDetailDrawerProps {
  college: CollegeRecord | null;
  onClose: () => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  isShortlisted: boolean;
  onToggleShortlist: (id: string) => void;
  onAskAiAboutCollege: (college: CollegeRecord) => void;
  onDeleteCustomCollege?: (id: string) => void;
  canManageColleges?: boolean;
  onEditCollege?: (college: CollegeRecord) => void;
  eligibility?: EligibilityResult | null;
  chanceMeProfile: ChanceMeProfile;
}

export const CollegeDetailDrawer: React.FC<CollegeDetailDrawerProps> = ({
  college,
  onClose,
  isCompared,
  onToggleCompare,
  isShortlisted,
  onToggleShortlist,
  onAskAiAboutCollege,
  onDeleteCustomCollege,
  canManageColleges = false,
  onEditCollege,
  eligibility,
  chanceMeProfile,
}) => {
  const [drawerTab, setDrawerTab] = useState<'overview' | 'virtual-tour'>('overview');
  const [levelTab, setLevelTab] = useState<'ALL' | DegreeLevel>('ALL');
  const [bannerError, setBannerError] = useState(false);

  useEffect(() => {
    setBannerError(false);
    setDrawerTab('overview');
  }, [college?.id]);

  if (!college) return null;

  const showUg = levelTab === 'ALL' || levelTab === 'Undergraduate';
  const showPg = levelTab === 'ALL' || levelTab === 'Postgraduate';
  const roi = computeRoiMetrics(college, 'ALL');
  const bannerAsset = getCampusBannerAsset(college);
  const virtualTour = getCampusVirtualTour(college);
  const scholarship = evaluateScholarshipEligibility(college, chanceMeProfile);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/45 dark:bg-black/75 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 h-full border-l border-[#E2E8F0] dark:border-slate-800 flex flex-col shadow-2xl transition-colors">
        {/* Campus Visual Header */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden bg-slate-900">
          {!bannerAsset.src || bannerError ? (
            <div
              className={`w-full h-full bg-gradient-to-br ${bannerAsset.fallbackGradient} flex items-center justify-center`}
            >
              <Building2 className="w-10 h-10 text-white/60" />
            </div>
          ) : (
            <img
              src={bannerAsset.src}
              alt={bannerAsset.alt}
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
              className={`w-full h-full object-cover ${bannerAsset.objectPositionClass ?? 'object-center'}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-lg bg-slate-950/60 text-white hover:bg-slate-950/85 backdrop-blur-sm transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3.5 left-6 right-6 text-white">
            <div className="text-xs text-slate-200">
              {college.city}, {college.state} · {college.type}
              {college.source === 'custom' ? ' · Brochure Entry' : ''}
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold leading-snug mt-0.5">
              {college.name}
            </h2>
          </div>
        </div>

        {/* Drawer Subheader: Eligibility & Official Portal CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {eligibility ? (
              <>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                    eligibility.tier === 'Safe'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : eligibility.tier === 'Target'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {eligibility.tier === 'Safe' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : eligibility.tier === 'Target' ? (
                    <Target className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5" />
                  )}
                  <span>{eligibility.tier}</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {eligibility.reason}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {college.degreeLevels.join(' & ')} Admissions Profile
              </span>
            )}
          </div>

          {college.portalUrl && (
            <a
              href={college.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Official / Admission Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Drawer Section Tabs (shown only when Virtual Tour is available for this college) */}
        {virtualTour && (
          <div
            role="tablist"
            aria-label="Institution details tabs"
            className="flex items-center gap-6 px-6 border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={drawerTab === 'overview'}
              onClick={() => setDrawerTab('overview')}
              className={`inline-flex items-center gap-1.5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 -mb-px ${
                drawerTab === 'overview'
                  ? 'border-[#2563EB] text-[#1E1B4B] dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Admissions & ROI</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={drawerTab === 'virtual-tour'}
              onClick={() => setDrawerTab('virtual-tour')}
              className={`inline-flex items-center gap-1.5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 -mb-px ${
                drawerTab === 'virtual-tour'
                  ? 'border-[#2563EB] text-[#1E1B4B] dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Virtual Tour</span>
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">
          {drawerTab === 'virtual-tour' && virtualTour ? (
            <VirtualTourTab college={college} tourData={virtualTour} />
          ) : (
            <>
          {/* Fee Ranges & Placement Highlights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">UG Total Fee Range</div>
              <div className="text-sm font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                {college.feeRanges.ugTotal}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">PG Total Fee Range</div>
              <div className="text-sm font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                {college.feeRanges.pgTotal}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Placement Highlights</div>
              <div className="text-sm font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1 leading-snug">
                {college.placementHighlights}
              </div>
            </div>
          </div>

          {/* ROI & Payback Period Indicator Breakdown */}
          <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              ROI & Fee Recovery Time Estimator
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Undergraduate (UG) Fee Recovery', metric: roi.ug },
                { title: 'Postgraduate (PG) Fee Recovery', metric: roi.pg },
              ].map(({ title, metric }) => (
                <div key={title} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {title}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {metric.paybackLabel} · {metric.tierLabel}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metric.tierLabel === 'Fast'
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : metric.tierLabel === 'Balanced'
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-amber-600 dark:bg-amber-500'
                      }`}
                      style={{ width: `${metric.barWidthPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    Midpoint Fee {metric.feeLabel} ÷ Avg Package {metric.avgLabel}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scholarship Eligibility & Fee Reduction Estimator */}
          <div className="space-y-3.5 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                  Scholarship Eligibility
                </h3>
              </div>

              {scholarship.hasInfo && (
                scholarship.hasUserScore ? (
                  scholarship.matchedSlab ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono tabular-nums whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{scholarship.matchedSlab.discountPercent}% Tuition Reduction Eligible</span>
                    </span>
                  ) : scholarship.gateStipendEligible ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>GATE Stipend Eligible</span>
                    </span>
                  ) : scholarship.meritSlabs.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Below Merit Slab</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Need / Statutory Aid
                    </span>
                  )
                ) : (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {scholarship.schemeName}
                  </span>
                )
              )}
            </div>

            {!scholarship.hasInfo ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                No merit scholarship policy has been recorded for this custom institution yet.
                {canManageColleges ? ' Click Edit below to add scholarship slab rules.' : ''}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Score Summary & Potential Fee Reduction Cards */}
                {scholarship.hasUserScore ? (
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#E2E8F0] dark:border-slate-700/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-slate-700 dark:text-slate-200 font-medium">
                        Evaluated for{' '}
                        <span className="font-semibold text-[#1E1B4B] dark:text-white">
                          {chanceMeProfile.exam}
                        </span>{' '}
                        score{' '}
                        <span className="font-mono tabular-nums font-semibold text-[#2563EB] dark:text-blue-400">
                          {chanceMeProfile.score}
                        </span>
                        {scholarship.normalizationNote && (
                          <span className="text-slate-500 dark:text-slate-400 font-normal">
                            {' '}
                            ({scholarship.normalizationNote})
                          </span>
                        )}
                      </div>
                      {scholarship.nextSlab && (
                        <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          +{scholarship.nextSlab.gap}%ile needed for{' '}
                          {scholarship.nextSlab.slab.discountPercent}% waiver
                        </span>
                      )}
                    </div>

                    {(scholarship.ugReduction || scholarship.pgReduction) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[scholarship.ugReduction, scholarship.pgReduction]
                          .filter((item): item is NonNullable<typeof item> => Boolean(item))
                          .map((item) => (
                            <div
                              key={item.degreeLabel}
                              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/70 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">
                                  {item.degreeLabel}
                                </span>
                                <span className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                                  −{item.discountPercent}%
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Potential Savings
                                </span>
                                <span className="text-sm font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                                  Save {item.savingsRange}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono tabular-nums">
                                <span className="text-slate-400 dark:text-slate-500 line-through">
                                  {item.originalRange}
                                </span>
                                <span className="font-semibold text-[#1E1B4B] dark:text-slate-200">
                                  Est. Net {item.netFeeRange}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : scholarship.meritSlabs.length > 0 && !scholarship.matchedSlab ? (
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        Lowest merit waiver starts at{' '}
                        <span className="font-mono tabular-nums font-semibold text-[#1E1B4B] dark:text-white">
                          {scholarship.meritSlabs[scholarship.meritSlabs.length - 1].minPercentile}%ile
                        </span>{' '}
                        ({scholarship.meritSlabs[scholarship.meritSlabs.length - 1].discountPercent}%
                        tuition reduction).
                      </div>
                    ) : null}

                    {scholarship.gateStipendEligible && scholarship.gateStipendSummary && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200">
                        <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{scholarship.gateStipendSummary}</span>
                      </div>
                    )}

                    {scholarship.examAlignmentNote && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{scholarship.examAlignmentNote}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#EEF4FF]/60 dark:bg-blue-950/20 border border-[#D8E2F3] dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300">
                    Enter your exam percentile or score in the{' '}
                    <span className="font-semibold text-[#1E1B4B] dark:text-blue-300">
                      Chance Me
                    </span>{' '}
                    bar at the top to calculate your eligible tuition waiver and estimated net fee.
                  </div>
                )}

                {/* Parsed Merit Slabs */}
                {scholarship.meritSlabs.length > 0 && (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {scholarship.meritSlabs.map((slab) => {
                      const isMatched =
                        scholarship.matchedSlab?.minPercentile === slab.minPercentile;
                      return (
                        <div
                          key={`${slab.minPercentile}-${slab.discountPercent}`}
                          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs transition-colors ${
                            isMatched
                              ? 'bg-emerald-50/75 dark:bg-emerald-950/35'
                              : 'bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isMatched
                                  ? 'bg-emerald-600 dark:bg-emerald-400'
                                  : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                            <span
                              className={`font-mono tabular-nums font-semibold shrink-0 ${
                                isMatched
                                  ? 'text-emerald-800 dark:text-emerald-300'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {slab.minPercentile}%+ %ile
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 truncate">
                              {slab.condition}
                            </span>
                          </div>
                          <span
                            className={`font-mono tabular-nums font-semibold whitespace-nowrap shrink-0 ${
                              isMatched
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-[#2563EB] dark:text-blue-400'
                            }`}
                          >
                            {slab.discountPercent}% Waiver
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Additional Income / Category / Stipend Aid */}
                {scholarship.supplementaryAid.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Additional Fee Remissions & Fellowships
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {scholarship.supplementaryAid.map((note) => (
                        <li key={note} className="flex items-start gap-2">
                          <span className="text-[#2563EB] dark:text-blue-400 mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accepted Entrance Exams */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              Accepted Entrance Exams
            </h3>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
              {college.entranceExams.join(' · ')}
            </p>
          </div>

          {/* UG & PG Courses Breakdown */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                Courses & Fee Structure
              </h3>
              <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                {(['ALL', 'Undergraduate', 'Postgraduate'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setLevelTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      levelTab === tab
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {tab === 'ALL' ? 'All Levels' : tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {showUg && (
                <div className="p-4 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Undergraduate Courses (UG)
                    </span>
                    <span className="text-xs font-mono tabular-nums font-semibold text-blue-800 dark:text-blue-400">
                      {college.feeRanges.ugTotal}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {college.ugCourses.length > 0
                      ? college.ugCourses.join(', ')
                      : 'No undergraduate courses listed.'}
                  </p>
                </div>
              )}

              {showPg && (
                <div className="p-4 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Postgraduate Courses (PG)
                    </span>
                    <span className="text-xs font-mono tabular-nums font-semibold text-blue-800 dark:text-blue-400">
                      {college.feeRanges.pgTotal}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {college.pgCourses.length > 0
                      ? college.pgCourses.join(', ')
                      : 'No postgraduate courses listed.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Portal Metadata & Direct Link Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Mapped Portal Streams
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-medium">
                {college.programs.length > 0 ? college.programs.join(', ') : 'General Programs'}
              </div>
            </div>
            <div>
              <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Official Domain
              </div>
              {college.portalUrl ? (
                <a
                  href={college.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 dark:text-blue-400 hover:underline break-all"
                >
                  {college.portalUrl}
                </a>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">Not provided</span>
              )}
            </div>
          </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleShortlist(college.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                isShortlisted
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isShortlisted ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleCompare(college.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                isCompared
                  ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isCompared && <Check className="w-4 h-4" />}
              <span>{isCompared ? 'Added to Compare' : 'Add to Compare'}</span>
            </button>

            {canManageColleges && onEditCollege && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditCollege(college);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {college.source === 'custom' && canManageColleges && onDeleteCustomCollege && (
              <button
                type="button"
                onClick={() => {
                  onDeleteCustomCollege(college.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onAskAiAboutCollege(college);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI Counsellor</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
