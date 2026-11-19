import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Plus, Save, Sparkles, X } from 'lucide-react';
import {
  normalizeCollegeEntry,
  SAMPLE_BROCHURE_TEXT,
} from '../data/colleges';
import { CollegeRecord, RawCollegeEntry } from '../types/college';

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCollege: (college: CollegeRecord, isEditExistingCustom: boolean) => void;
  editingCollege?: CollegeRecord | null;
}

export const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  isOpen,
  onClose,
  onSaveCollege,
  editingCollege = null,
}) => {
  const [brochureText, setBrochureText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [typeLabel, setTypeLabel] = useState('Private University');
  const [portalUrl, setPortalUrl] = useState('');
  const [ugCoursesText, setUgCoursesText] = useState('B.Tech, BCA, B.Sc');
  const [pgCoursesText, setPgCoursesText] = useState('M.Tech, MBA, MCA');
  const [entranceExamsText, setEntranceExamsText] = useState('JEE Main, GATE, CAT');
  const [ugTotalFee, setUgTotalFee] = useState('₹8.0L – ₹16.0L');
  const [pgTotalFee, setPgTotalFee] = useState('₹3.0L – ₹9.0L');
  const [placementHighlights, setPlacementHighlights] = useState(
    'Avg ~₹8.5 LPA | Highest ~₹35 LPA'
  );
  const [scholarshipInfo, setScholarshipInfo] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setParseError(null);
    setParseSuccess(false);
    setBrochureText('');

    if (editingCollege) {
      setName(editingCollege.name);
      setCity(editingCollege.city);
      setStateName(editingCollege.state);
      setTypeLabel(editingCollege.type);
      setPortalUrl(editingCollege.portalUrl);
      setUgCoursesText(editingCollege.ugCourses.join(', '));
      setPgCoursesText(editingCollege.pgCourses.join(', '));
      setEntranceExamsText(editingCollege.entranceExams.join(', '));
      setUgTotalFee(editingCollege.feeRanges.ugTotal);
      setPgTotalFee(editingCollege.feeRanges.pgTotal);
      setPlacementHighlights(editingCollege.placementHighlights);
      setScholarshipInfo(editingCollege.scholarshipInfo ?? '');
    } else {
      setName('');
      setCity('');
      setStateName('');
      setTypeLabel('Private University');
      setPortalUrl('');
      setUgCoursesText('B.Tech, BCA, B.Sc');
      setPgCoursesText('M.Tech, MBA, MCA');
      setEntranceExamsText('JEE Main, GATE, CAT');
      setUgTotalFee('₹8.0L – ₹16.0L');
      setPgTotalFee('₹3.0L – ₹9.0L');
      setPlacementHighlights('Avg ~₹8.5 LPA | Highest ~₹35 LPA');
      setScholarshipInfo('');
    }
  }, [isOpen, editingCollege]);

  if (!isOpen) return null;

  const isEditingExistingCustom = Boolean(
    editingCollege && editingCollege.source === 'custom'
  );

  const handleParseBrochure = async () => {
    if (brochureText.trim().length < 20) {
      setParseError('Please paste at least 20 characters of brochure text first.');
      return;
    }

    setParsing(true);
    setParseError(null);
    setParseSuccess(false);

    try {
      const response = await fetch('/api/parse-brochure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brochureText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse brochure.');
      }

      const c = data.college ?? {};
      setName(c.name || '');
      setCity(c.city || '');
      setStateName(c.state || '');
      setTypeLabel(c.type || 'Private University');
      setPortalUrl(c.portalUrl || '');
      setUgCoursesText(Array.isArray(c.ugCourses) ? c.ugCourses.join(', ') : '');
      setPgCoursesText(Array.isArray(c.pgCourses) ? c.pgCourses.join(', ') : '');
      setEntranceExamsText(
        Array.isArray(c.entranceExams) ? c.entranceExams.join(', ') : ''
      );
      setUgTotalFee(c.feeRanges?.ugTotal || 'N/A');
      setPgTotalFee(c.feeRanges?.pgTotal || 'N/A');
      setPlacementHighlights(c.placementHighlights || 'N/A');
      setScholarshipInfo(c.scholarshipInfo || '');
      setParseSuccess(true);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Unable to parse brochure.');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || city.trim().length < 2) {
      setParseError('Institution Name and City (at least 2 characters) are required.');
      return;
    }

    const parseCsv = (val: string, maxLen: number) =>
      val
        .split(',')
        .map((s) => s.trim().slice(0, maxLen))
        .filter(Boolean)
        .slice(0, 25);

    const rawPortal = portalUrl.trim();
    const normalizedPortalUrl =
      rawPortal && !/^https?:\/\//i.test(rawPortal)
        ? `https://${rawPortal}`
        : rawPortal;

    const targetId = isEditingExistingCustom && editingCollege
      ? editingCollege.id
      : editingCollege
        ? `${editingCollege.id}-custom-${Date.now()}`.slice(0, 128)
        : `custom-${Date.now()}`;

    const rawEntry: RawCollegeEntry = {
      id: targetId,
      name: name.trim().slice(0, 160),
      city: city.trim().slice(0, 80),
      state: (stateName.trim() || 'India').slice(0, 80),
      type: (typeLabel.trim() || 'Private University').slice(0, 80),
      portalUrl: normalizedPortalUrl.slice(0, 300),
      ugCourses: parseCsv(ugCoursesText, 100),
      pgCourses: parseCsv(pgCoursesText, 100),
      entranceExams: parseCsv(entranceExamsText, 60),
      feeRanges: {
        ugTotal: (ugTotalFee.trim() || 'N/A').slice(0, 60),
        pgTotal: (pgTotalFee.trim() || 'N/A').slice(0, 60),
      },
      placementHighlights: (placementHighlights.trim() || 'N/A').slice(0, 200),
      scholarshipInfo: scholarshipInfo.trim().slice(0, 500),
    };

    const normalized = normalizeCollegeEntry(rawEntry, 'custom');
    normalized.addedAt = editingCollege?.addedAt || new Date().toISOString();
    normalized.createdBy = editingCollege?.createdBy;

    onSaveCollege(normalized, isEditingExistingCustom);
    onClose();
  };

  const inputClass =
    'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {editingCollege
                ? isEditingExistingCustom
                  ? 'Edit College Brochure Entry'
                  : 'Customize & Save College Entry'
                : 'Add College Data from Brochure'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {editingCollege
                ? 'Update fees, courses, entrance exams, placements, or official portal URL.'
                : 'Paste any UG or PG university brochure to extract structured fees, courses, exams & portal URL live.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6"
        >
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="brochure-paste-input"
                className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Paste University Brochure / Admission Text</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setBrochureText(SAMPLE_BROCHURE_TEXT);
                  setParseError(null);
                }}
                className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline cursor-pointer"
              >
                Load sample brochure (BITS Pilani)
              </button>
            </div>

            <textarea
              id="brochure-paste-input"
              rows={5}
              value={brochureText}
              onChange={(e) => setBrochureText(e.target.value)}
              placeholder="Paste text containing university name, portal URL, UG/PG courses, entrance exams, fee ranges, and placement highlights..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Gemini AI extracts courses, fee ranges, entrance exams, placements & portal URL.
              </div>
              <button
                type="button"
                onClick={handleParseBrochure}
                disabled={parsing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting fields...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract with Gemini AI</span>
                  </>
                )}
              </button>
            </div>

            {parseError && (
              <div className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                {parseError}
              </div>
            )}
            {parseSuccess && (
              <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg px-3 py-2">
                Brochure parsed successfully. Review or adjust any field below and click Save to
                Portal.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              Structured Admission Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Institution Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Birla Institute of Technology & Science (BITS Pilani)"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Institution Type
                </label>
                <input
                  type="text"
                  value={typeLabel}
                  onChange={(e) => setTypeLabel(e.target.value)}
                  placeholder="e.g. Private / Deemed University"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pilani"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Rajasthan"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Official / Admission Portal URL
              </label>
              <input
                type="text"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder="https://www.bitsadmission.com/"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  UG Courses (comma-separated)
                </label>
                <input
                  type="text"
                  value={ugCoursesText}
                  onChange={(e) => setUgCoursesText(e.target.value)}
                  placeholder="B.Tech, BBA, BCA, B.Sc"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  PG Courses (comma-separated)
                </label>
                <input
                  type="text"
                  value={pgCoursesText}
                  onChange={(e) => setPgCoursesText(e.target.value)}
                  placeholder="M.Tech, MBA, MCA, M.Sc"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Accepted Entrance Exams (comma-separated)
              </label>
              <input
                type="text"
                value={entranceExamsText}
                onChange={(e) => setEntranceExamsText(e.target.value)}
                placeholder="BITSAT, JEE Main, GATE, CAT"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  UG Total Fee Range
                </label>
                <input
                  type="text"
                  value={ugTotalFee}
                  onChange={(e) => setUgTotalFee(e.target.value)}
                  placeholder="₹19.9L – ₹21.5L"
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  PG Total Fee Range
                </label>
                <input
                  type="text"
                  value={pgTotalFee}
                  onChange={(e) => setPgTotalFee(e.target.value)}
                  placeholder="₹10.8L – ₹11.5L"
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Placement Highlights
              </label>
              <input
                type="text"
                value={placementHighlights}
                onChange={(e) => setPlacementHighlights(e.target.value)}
                placeholder="Avg ~₹18.5–19.7 LPA | Highest ~₹60.8 LPA"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Scholarship Policy & Percentile Slabs
              </label>
              <textarea
                rows={2}
                value={scholarshipInfo}
                onChange={(e) => setScholarshipInfo(e.target.value)}
                placeholder="e.g. Merit Scholarship: 50% tuition waiver for 95%+ percentile; 25% waiver for 90%+ percentile"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-blue-700 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors cursor-pointer"
            >
              {editingCollege ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>
                {editingCollege ? 'Update College Entry' : 'Save to Portal Database'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
