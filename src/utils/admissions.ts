import { CollegeRecord, DegreeLevel } from '../types/college';

export type ChanceMeExam =
  | 'JEE Main'
  | 'JEE Advanced'
  | 'GATE'
  | 'IIT JAM'
  | 'CAT'
  | 'CUET'
  | 'Merit';

export type EligibilityTier = 'Safe' | 'Target' | 'Reach';

export interface ChanceMeProfile {
  exam: ChanceMeExam;
  score: string;
  rajasthanDomicile: boolean;
}

export interface EligibilityResult {
  tier: EligibilityTier;
  reason: string;
  domicileApplied: boolean;
}

interface ExamCutoffPair {
  safe: number;
  target: number;
}

type CollegeCutoffMap = Record<ChanceMeExam, ExamCutoffPair>;

const COLLEGE_CUTOFFS: Record<string, CollegeCutoffMap> = {
  'iit-bombay': {
    'JEE Main': { safe: 99.6, target: 98.5 },
    'JEE Advanced': { safe: 98.5, target: 94.0 },
    GATE: { safe: 780, target: 690 },
    'IIT JAM': { safe: 68, target: 54 },
    CAT: { safe: 98.5, target: 95.0 },
    CUET: { safe: 99.5, target: 97.0 },
    Merit: { safe: 98, target: 95 },
  },
  'iit-delhi': {
    'JEE Main': { safe: 99.5, target: 98.2 },
    'JEE Advanced': { safe: 98.0, target: 93.0 },
    GATE: { safe: 760, target: 670 },
    'IIT JAM': { safe: 65, target: 52 },
    CAT: { safe: 98.0, target: 94.0 },
    CUET: { safe: 99.2, target: 96.5 },
    Merit: { safe: 98, target: 94 },
  },
  'iit-madras': {
    'JEE Main': { safe: 99.3, target: 97.8 },
    'JEE Advanced': { safe: 97.2, target: 91.5 },
    GATE: { safe: 750, target: 650 },
    'IIT JAM': { safe: 62, target: 50 },
    CAT: { safe: 96.5, target: 92.0 },
    CUET: { safe: 98.5, target: 95.0 },
    Merit: { safe: 97, target: 93 },
  },
  'iit-jodhpur': {
    'JEE Main': { safe: 97.8, target: 93.5 },
    'JEE Advanced': { safe: 89.0, target: 76.0 },
    GATE: { safe: 610, target: 490 },
    'IIT JAM': { safe: 48, target: 36 },
    CAT: { safe: 87.0, target: 76.0 },
    CUET: { safe: 95.0, target: 89.0 },
    Merit: { safe: 95, target: 89 },
  },
  'mnit-jaipur': {
    'JEE Main': { safe: 98.4, target: 96.2 },
    'JEE Advanced': { safe: 82.0, target: 68.0 },
    GATE: { safe: 670, target: 550 },
    'IIT JAM': { safe: 44, target: 33 },
    CAT: { safe: 85, target: 72 },
    CUET: { safe: 97, target: 92 },
    Merit: { safe: 96, target: 92 },
  },
  'lnmiit-jaipur': {
    'JEE Main': { safe: 95.5, target: 92.2 },
    'JEE Advanced': { safe: 76.0, target: 62.0 },
    GATE: { safe: 540, target: 430 },
    'IIT JAM': { safe: 38, target: 28 },
    CAT: { safe: 88, target: 76 },
    CUET: { safe: 94, target: 88 },
    Merit: { safe: 94, target: 88 },
  },
  'pes-bengaluru': {
    'JEE Main': { safe: 92.0, target: 83.0 },
    'JEE Advanced': { safe: 70.0, target: 56.0 },
    GATE: { safe: 510, target: 390 },
    'IIT JAM': { safe: 36, target: 26 },
    CAT: { safe: 78, target: 65 },
    CUET: { safe: 90, target: 80 },
    Merit: { safe: 88, target: 76 },
  },
  'mahe-manipal': {
    'JEE Main': { safe: 90.0, target: 79.0 },
    'JEE Advanced': { safe: 68.0, target: 54.0 },
    GATE: { safe: 490, target: 380 },
    'IIT JAM': { safe: 35, target: 25 },
    CAT: { safe: 85, target: 75 },
    CUET: { safe: 88, target: 76 },
    Merit: { safe: 86, target: 74 },
  },
  'vit-vellore': {
    'JEE Main': { safe: 89.0, target: 77.0 },
    'JEE Advanced': { safe: 66.0, target: 52.0 },
    GATE: { safe: 480, target: 360 },
    'IIT JAM': { safe: 34, target: 24 },
    CAT: { safe: 76, target: 64 },
    CUET: { safe: 86, target: 74 },
    Merit: { safe: 85, target: 72 },
  },
  'symbiosis-pune': {
    'JEE Main': { safe: 88.0, target: 77.0 },
    'JEE Advanced': { safe: 65.0, target: 50.0 },
    GATE: { safe: 460, target: 350 },
    'IIT JAM': { safe: 33, target: 23 },
    CAT: { safe: 90, target: 80 },
    CUET: { safe: 86, target: 74 },
    Merit: { safe: 84, target: 72 },
  },
  'nmims-mumbai': {
    'JEE Main': { safe: 88.0, target: 76.0 },
    'JEE Advanced': { safe: 65.0, target: 50.0 },
    GATE: { safe: 460, target: 350 },
    'IIT JAM': { safe: 33, target: 23 },
    CAT: { safe: 90, target: 80 },
    CUET: { safe: 86, target: 74 },
    Merit: { safe: 85, target: 72 },
  },
  'srmist-chennai': {
    'JEE Main': { safe: 83.0, target: 69.0 },
    'JEE Advanced': { safe: 58.0, target: 44.0 },
    GATE: { safe: 420, target: 320 },
    'IIT JAM': { safe: 30, target: 21 },
    CAT: { safe: 72, target: 58 },
    CUET: { safe: 82, target: 68 },
    Merit: { safe: 80, target: 66 },
  },
  'muj-jaipur': {
    'JEE Main': { safe: 81.0, target: 66.0 },
    'JEE Advanced': { safe: 55.0, target: 42.0 },
    GATE: { safe: 410, target: 310 },
    'IIT JAM': { safe: 28, target: 20 },
    CAT: { safe: 70, target: 56 },
    CUET: { safe: 78, target: 64 },
    Merit: { safe: 78, target: 64 },
  },
  'jklu-jaipur': {
    'JEE Main': { safe: 77.0, target: 61.0 },
    'JEE Advanced': { safe: 52.0, target: 38.0 },
    GATE: { safe: 380, target: 290 },
    'IIT JAM': { safe: 26, target: 18 },
    CAT: { safe: 68, target: 54 },
    CUET: { safe: 75, target: 60 },
    Merit: { safe: 75, target: 60 },
  },
  'amity-noida': {
    'JEE Main': { safe: 77.0, target: 61.0 },
    'JEE Advanced': { safe: 52.0, target: 38.0 },
    GATE: { safe: 380, target: 280 },
    'IIT JAM': { safe: 26, target: 18 },
    CAT: { safe: 68, target: 55 },
    CUET: { safe: 75, target: 60 },
    Merit: { safe: 74, target: 60 },
  },
  'amity-jaipur': {
    'JEE Main': { safe: 71.0, target: 54.0 },
    'JEE Advanced': { safe: 48.0, target: 34.0 },
    GATE: { safe: 340, target: 260 },
    'IIT JAM': { safe: 24, target: 16 },
    CAT: { safe: 60, target: 48 },
    CUET: { safe: 70, target: 56 },
    Merit: { safe: 70, target: 56 },
  },
  'jecrc-jaipur': {
    'JEE Main': { safe: 69.0, target: 50.0 },
    'JEE Advanced': { safe: 45.0, target: 32.0 },
    GATE: { safe: 330, target: 250 },
    'IIT JAM': { safe: 22, target: 15 },
    CAT: { safe: 58, target: 45 },
    CUET: { safe: 68, target: 54 },
    Merit: { safe: 68, target: 54 },
  },
  'poornima-jaipur': {
    'JEE Main': { safe: 63.0, target: 44.0 },
    'JEE Advanced': { safe: 40.0, target: 28.0 },
    GATE: { safe: 310, target: 230 },
    'IIT JAM': { safe: 20, target: 14 },
    CAT: { safe: 54, target: 40 },
    CUET: { safe: 64, target: 50 },
    Merit: { safe: 64, target: 50 },
  },
};

function getDefaultCutoffs(college: CollegeRecord): CollegeCutoffMap {
  const avg = college.avgPackageNum || 7;
  if (avg >= 18) {
    return {
      'JEE Main': { safe: 98.5, target: 95.0 },
      'JEE Advanced': { safe: 92.0, target: 80.0 },
      GATE: { safe: 680, target: 560 },
      'IIT JAM': { safe: 54, target: 40 },
      CAT: { safe: 94, target: 85 },
      CUET: { safe: 96, target: 90 },
      Merit: { safe: 96, target: 90 },
    };
  }
  if (avg >= 14) {
    return {
      'JEE Main': { safe: 96, target: 91 },
      'JEE Advanced': { safe: 80, target: 66 },
      GATE: { safe: 580, target: 470 },
      'IIT JAM': { safe: 42, target: 31 },
      CAT: { safe: 90, target: 80 },
      CUET: { safe: 92, target: 84 },
      Merit: { safe: 92, target: 84 },
    };
  }
  if (avg >= 9) {
    return {
      'JEE Main': { safe: 88, target: 76 },
      'JEE Advanced': { safe: 66, target: 52 },
      GATE: { safe: 470, target: 360 },
      'IIT JAM': { safe: 34, target: 24 },
      CAT: { safe: 80, target: 68 },
      CUET: { safe: 84, target: 72 },
      Merit: { safe: 82, target: 70 },
    };
  }
  return {
    'JEE Main': { safe: 74, target: 56 },
    'JEE Advanced': { safe: 50, target: 36 },
    GATE: { safe: 360, target: 270 },
    'IIT JAM': { safe: 25, target: 17 },
    CAT: { safe: 64, target: 50 },
    CUET: { safe: 72, target: 58 },
    Merit: { safe: 72, target: 58 },
  };
}

export function computeEligibilityTier(
  college: CollegeRecord,
  profile: ChanceMeProfile
): EligibilityResult | null {
  const raw = profile.score.trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  // Normalize CUET raw score (>100 up to 800) to percentile-equivalent
  const normalizedScore =
    profile.exam === 'CUET' && parsed > 100
      ? Math.min(100, (parsed / 800) * 100)
      : profile.exam === 'GATE'
        ? Math.min(1000, parsed)
        : Math.min(100, parsed);

  const cutoffs = COLLEGE_CUTOFFS[college.id] ?? getDefaultCutoffs(college);
  const { safe, target } = cutoffs[profile.exam];

  const isRajasthanCollege =
    college.state.toLowerCase().includes('rajasthan') ||
    college.city.toLowerCase().includes('jaipur');
  const isIit =
    college.type.toLowerCase().includes('iit') ||
    college.id.startsWith('iit-');

  // IITs use 100% All-India merit via JoSAA / COAP / JOAPS with no state domicile quota
  const domicileApplied = profile.rajasthanDomicile && isRajasthanCollege && !isIit;

  let effectiveSafe = safe;
  let effectiveTarget = target;

  if (domicileApplied) {
    if (profile.exam === 'GATE') {
      effectiveSafe = Math.max(200, safe - 25);
      effectiveTarget = Math.max(180, target - 25);
    } else if (profile.exam === 'IIT JAM') {
      effectiveSafe = Math.max(12, safe - 3);
      effectiveTarget = Math.max(10, target - 3);
    } else if (college.id === 'mnit-jaipur') {
      // Home State NIT JoSAA quota benefit
      effectiveSafe = Math.max(50, safe - 1.6);
      effectiveTarget = Math.max(45, target - 1.8);
    } else {
      // Rajasthan REAP / state domicile merit benefit
      effectiveSafe = Math.max(40, safe - 3.0);
      effectiveTarget = Math.max(35, target - 3.5);
    }
  }

  let tier: EligibilityTier;
  if (normalizedScore >= effectiveSafe) {
    tier = 'Safe';
  } else if (normalizedScore >= effectiveTarget) {
    tier = 'Target';
  } else {
    tier = 'Reach';
  }

  const acceptsDirectly = college.entranceExams.some((e) => {
    const lower = e.toLowerCase();
    if (profile.exam === 'Merit') {
      return lower.includes('merit') || lower.includes('cuet');
    }
    if (profile.exam === 'IIT JAM') {
      return lower.includes('jam');
    }
    return lower.includes(profile.exam.toLowerCase());
  });

  const reasonParts: string[] = [];
  if (domicileApplied) {
    reasonParts.push(
      college.id === 'mnit-jaipur' ? 'Rajasthan Home State Quota' : 'Rajasthan Domicile Boost'
    );
  } else if (profile.rajasthanDomicile && isRajasthanCollege && isIit) {
    reasonParts.push('All-India IIT merit (no state quota)');
  }
  if (!acceptsDirectly) {
    reasonParts.push(`Uses ${college.entranceExams.slice(0, 2).join('/')} primarily`);
  } else {
    reasonParts.push(`Accepts ${profile.exam}`);
  }

  return {
    tier,
    reason: reasonParts.join(' · '),
    domicileApplied,
  };
}

export interface RoiMetrics {
  feeLakhs: number;
  avgPackageLakhs: number;
  paybackYears: number;
  paybackLabel: string;
  barWidthPercent: number;
  tierLabel: 'Fast' | 'Balanced' | 'Extended';
  basisLabel: string;
  feeLabel: string;
  avgLabel: string;
}

function extractFeeRangeMidpoint(feeStr: string): number {
  const nums = Array.from(feeStr.matchAll(/([\d.]+)\s*L/gi)).map((m) => Number(m[1]));
  if (nums.length === 0) {
    const fallback = feeStr.match(/([\d.]+)/);
    return fallback ? Number(fallback[1]) || 6 : 6;
  }
  if (nums.length === 1) return nums[0];
  return (nums[0] + nums[nums.length - 1]) / 2;
}

function extractPlacementValues(text: string): {
  generalAvg: number;
  ugAvg: number | null;
  pgAvg: number | null;
} {
  let ugAvg: number | null = null;
  let pgAvg: number | null = null;

  const btechMatch = text.match(/B\.Tech\s+Avg\s*~?₹?([\d.]+)/i);
  if (btechMatch) ugAvg = Number(btechMatch[1]) || null;

  const mbaMatch = text.match(/(?:MBA|PG)\s+Avg\s*~?₹?([\d.]+)(?:[–-]([\d.]+))?/i);
  if (mbaMatch) {
    const lo = Number(mbaMatch[1]);
    const hi = mbaMatch[2] ? Number(mbaMatch[2]) : lo;
    pgAvg = (lo + hi) / 2;
  }

  const rangeMatch = text.match(/Avg\s*~?₹?([\d.]+)(?:[–-]([\d.]+))?/i);
  let generalAvg = 7.5;
  if (rangeMatch) {
    const lo = Number(rangeMatch[1]);
    const hi = rangeMatch[2] ? Number(rangeMatch[2]) : lo;
    generalAvg = (lo + hi) / 2;
  } else {
    const first = text.match(/([\d.]+)/);
    if (first) generalAvg = Number(first[1]) || 7.5;
  }

  return { generalAvg, ugAvg, pgAvg };
}

function buildPaybackSummary(
  feeLakhs: number,
  avgPackageLakhs: number,
  basisLabel: string
): RoiMetrics {
  const safeAvg = Math.max(1, avgPackageLakhs);
  const paybackYears = Number((feeLakhs / safeAvg).toFixed(2));
  const months = Math.max(1, Math.round(paybackYears * 12));

  const paybackLabel =
    paybackYears < 1
      ? `${paybackYears.toFixed(1)} yrs (~${months} mos)`
      : `${paybackYears.toFixed(1)} yrs`;

  // Bar fills cleanly from 14% to 100% representing fee relative to 3.0 yrs payback horizon
  const barWidthPercent = Math.round(Math.min(100, Math.max(14, (paybackYears / 3.0) * 100)));

  const tierLabel: 'Fast' | 'Balanced' | 'Extended' =
    paybackYears <= 0.9 ? 'Fast' : paybackYears <= 1.7 ? 'Balanced' : 'Extended';

  return {
    feeLakhs: Number(feeLakhs.toFixed(1)),
    avgPackageLakhs: Number(safeAvg.toFixed(1)),
    paybackYears,
    paybackLabel,
    barWidthPercent,
    tierLabel,
    basisLabel,
    feeLabel: `₹${feeLakhs.toFixed(1)}L`,
    avgLabel: `₹${safeAvg.toFixed(1)} LPA`,
  };
}

export function computeRoiMetrics(
  college: CollegeRecord,
  degreeFocus: 'ALL' | DegreeLevel = 'ALL'
): { primary: RoiMetrics; ug: RoiMetrics; pg: RoiMetrics } {
  const ugFee = extractFeeRangeMidpoint(college.feeRanges.ugTotal);
  const pgFee = extractFeeRangeMidpoint(college.feeRanges.pgTotal);
  const { generalAvg, ugAvg, pgAvg } = extractPlacementValues(college.placementHighlights);

  const resolvedUgAvg = ugAvg ?? generalAvg;
  const resolvedPgAvg = pgAvg ?? generalAvg;

  const ugMetrics = buildPaybackSummary(ugFee, resolvedUgAvg, 'UG Est.');
  const pgMetrics = buildPaybackSummary(pgFee, resolvedPgAvg, 'PG Est.');

  if (degreeFocus === 'Undergraduate') {
    return { primary: ugMetrics, ug: ugMetrics, pg: pgMetrics };
  }
  if (degreeFocus === 'Postgraduate') {
    return { primary: pgMetrics, ug: ugMetrics, pg: pgMetrics };
  }

  // Overall card view uses PG when PG has faster/high MBA/M.Tech ROI or balanced UG/PG benchmark
  const overallFee = Number(((ugFee + pgFee) / 2).toFixed(1));
  const overallAvg = Number(((resolvedUgAvg + resolvedPgAvg) / 2).toFixed(1));
  const overallMetrics = buildPaybackSummary(overallFee, overallAvg, 'Blended UG/PG');

  return { primary: overallMetrics, ug: ugMetrics, pg: pgMetrics };
}
