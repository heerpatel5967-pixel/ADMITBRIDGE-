import React from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { ChanceMeExam, ChanceMeProfile, EligibilityResult } from '../utils/admissions';

const EXAM_OPTIONS: Array<{
  value: ChanceMeExam;
  label: string;
  placeholder: string;
  unitLabel: string;
  min: number;
  max: number;
  step: string;
}> = [
  {
    value: 'JEE Main',
    label: 'JEE Main (%ile)',
    placeholder: 'e.g. 92.5',
    unitLabel: '%ile',
    min: 0,
    max: 100,
    step: '0.1',
  },
  {
    value: 'JEE Advanced',
    label: 'JEE Advanced (%ile)',
    placeholder: 'e.g. 94.0',
    unitLabel: '%ile',
    min: 0,
    max: 100,
    step: '0.1',
  },
  {
    value: 'GATE',
    label: 'GATE (Score / 1000)',
    placeholder: 'e.g. 680',
    unitLabel: '/ 1000',
    min: 0,
    max: 1000,
    step: '1',
  },
  {
    value: 'IIT JAM',
    label: 'IIT JAM (Score / 100)',
    placeholder: 'e.g. 52',
    unitLabel: '/ 100',
    min: 0,
    max: 100,
    step: '0.5',
  },
  {
    value: 'CAT',
    label: 'CAT (%ile)',
    placeholder: 'e.g. 85',
    unitLabel: '%ile',
    min: 0,
    max: 100,
    step: '0.1',
  },
  {
    value: 'CUET',
    label: 'CUET (%ile or /800)',
    placeholder: 'e.g. 88',
    unitLabel: '%ile / 800',
    min: 0,
    max: 800,
    step: '1',
  },
  {
    value: 'Merit',
    label: 'Merit (12th / Grad %)',
    placeholder: 'e.g. 84',
    unitLabel: '%',
    min: 0,
    max: 100,
    step: '0.5',
  },
];

interface ChanceMeBarProps {
  profile: ChanceMeProfile;
  onChange: (next: ChanceMeProfile) => void;
  eligibilityByCollege: Map<string, EligibilityResult>;
  showViewDirectoryAction: boolean;
  onViewDirectory: () => void;
}

export const ChanceMeBar: React.FC<ChanceMeBarProps> = ({
  profile,
  onChange,
  eligibilityByCollege,
  showViewDirectoryAction,
  onViewDirectory,
}) => {
  const currentExamMeta =
    EXAM_OPTIONS.find((e) => e.value === profile.exam) ?? EXAM_OPTIONS[0];

  let safeCount = 0;
  let targetCount = 0;
  let reachCount = 0;

  if (profile.score.trim()) {
    for (const res of eligibilityByCollege.values()) {
      if (res.tier === 'Safe') safeCount++;
      else if (res.tier === 'Target') targetCount++;
      else reachCount++;
    }
  }

  const hasScore = profile.score.trim().length > 0;

  return (
    <section
      aria-label="Chance Me Eligibility Calculator"
      className="bg-[#EEF4FF] dark:bg-slate-900/80 border-b border-[#D8E2F3] dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 shrink-0 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-[#1E1B4B] dark:bg-blue-600 text-white whitespace-nowrap">
            Chance Me
          </span>

          {/* Exam Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="chance-me-exam" className="sr-only">
              Select Exam
            </label>
            <select
              id="chance-me-exam"
              value={profile.exam}
              onChange={(e) =>
                onChange({ ...profile, exam: e.target.value as ChanceMeExam })
              }
              className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-[#1E1B4B] dark:text-slate-100 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              {EXAM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Percentile / Score Input */}
          <div className="relative flex items-center">
            <label htmlFor="chance-me-score" className="sr-only">
              Percentile or Score
            </label>
            <input
              id="chance-me-score"
              type="number"
              min={currentExamMeta.min}
              max={currentExamMeta.max}
              step={currentExamMeta.step}
              value={profile.score}
              onChange={(e) => onChange({ ...profile, score: e.target.value })}
              placeholder={currentExamMeta.placeholder}
              className="w-36 pl-2.5 pr-14 py-1.5 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB]"
            />
            <span className="absolute right-2.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 pointer-events-none">
              {currentExamMeta.unitLabel}
            </span>
          </div>

          {/* Rajasthan Domicile Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={profile.rajasthanDomicile}
            onClick={() =>
              onChange({
                ...profile,
                rajasthanDomicile: !profile.rajasthanDomicile,
              })
            }
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              profile.rajasthanDomicile
                ? 'bg-blue-100/80 dark:bg-blue-950/60 border-[#2563EB] dark:border-blue-500 text-[#1E1B4B] dark:text-blue-200'
                : 'bg-white dark:bg-slate-800 border-[#CBD5E1] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span
              className={`w-7 h-4 rounded-full relative transition-colors shrink-0 ${
                profile.rajasthanDomicile
                  ? 'bg-[#2563EB] dark:bg-blue-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  profile.rajasthanDomicile ? 'left-3.5' : 'left-0.5'
                }`}
              />
            </span>
            <span>Rajasthan Domicile</span>
          </button>

          {hasScore && (
            <button
              type="button"
              onClick={() =>
                onChange({ ...profile, score: '', rajasthanDomicile: false })
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-slate-400 hover:text-[#1E1B4B] dark:hover:text-slate-100 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Live Match Tally & Quick Directory Jump */}
        <div className="flex items-center gap-3 text-xs">
          {hasScore ? (
            <div className="flex items-center gap-2 font-mono tabular-nums whitespace-nowrap">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                {safeCount} Safe
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-800">
                {targetCount} Target
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800">
                {reachCount} Reach
              </span>
            </div>
          ) : (
            <span className="text-indigo-900/75 dark:text-slate-400 hidden xl:inline font-medium">
              Enter your score to tag Safe / Target / Reach across campuses
            </span>
          )}

          {showViewDirectoryAction && (
            <button
              type="button"
              onClick={onViewDirectory}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
