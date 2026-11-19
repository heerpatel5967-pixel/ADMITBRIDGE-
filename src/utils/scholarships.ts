import { CollegeRecord } from '../types/college';
import { ChanceMeExam, ChanceMeProfile } from './admissions';

export interface ScholarshipTier {
  minPercentile: number;
  discountPercent: number;
  label: string;
  condition: string;
}

export interface FeeReductionBreakdown {
  degreeLabel: string;
  originalRange: string;
  discountPercent: number;
  savingsRange: string;
  netFeeRange: string;
  estimatedMidSavingsLakhs: number;
}

export interface ScholarshipEvaluation {
  hasInfo: boolean;
  rawText: string;
  schemeName: string;
  meritSlabs: ScholarshipTier[];
  supplementaryAid: string[];
  hasUserScore: boolean;
  rawUserScore: number | null;
  normalizedPercentile: number | null;
  normalizationNote: string | null;
  matchedSlab: ScholarshipTier | null;
  nextSlab: { slab: ScholarshipTier; gap: number } | null;
  ugReduction: FeeReductionBreakdown | null;
  pgReduction: FeeReductionBreakdown | null;
  gateStipendEligible: boolean;
  gateStipendSummary: string | null;
  examAlignmentNote: string | null;
}

/**
 * Converts a Chance Me exam input into a 0–100 percentile-equivalent scale
 * so merit scholarship slabs across exams can be evaluated consistently.
 */
export function normalizeScoreToPercentile(
  exam: ChanceMeExam,
  rawScore: number
): { percentile: number; note: string | null } {
  if (exam === 'CUET') {
    if (rawScore > 100) {
      const pct = Math.min(100, Number(((rawScore / 800) * 100).toFixed(1)));
      return {
        percentile: pct,
        note: `CUET ${rawScore}/800 normalized to ~${pct.toFixed(1)}%ile`,
      };
    }
    return { percentile: Math.min(100, rawScore), note: null };
  }

  if (exam === 'GATE') {
    // Approximate GATE Score (out of 1000) to national percentile equivalence
    let pct: number;
    if (rawScore >= 750) {
      pct = 98 + Math.min(2, ((rawScore - 750) / 250) * 2);
    } else if (rawScore >= 600) {
      pct = 92 + ((rawScore - 600) / 150) * 6;
    } else if (rawScore >= 450) {
      pct = 82 + ((rawScore - 450) / 150) * 10;
    } else {
      pct = Math.max(0, (rawScore / 450) * 82);
    }
    const rounded = Number(Math.min(100, pct).toFixed(1));
    return {
      percentile: rounded,
      note: `GATE ${rawScore}/1000 ≈ ${rounded.toFixed(1)}%ile equivalent`,
    };
  }

  if (exam === 'IIT JAM') {
    // Approximate IIT JAM marks (out of 100) to percentile equivalence
    let pct: number;
    if (rawScore >= 60) {
      pct = 96 + Math.min(4, ((rawScore - 60) / 40) * 4);
    } else if (rawScore >= 40) {
      pct = 86 + ((rawScore - 40) / 20) * 10;
    } else {
      pct = Math.max(0, (rawScore / 40) * 86);
    }
    const rounded = Number(Math.min(100, pct).toFixed(1));
    return {
      percentile: rounded,
      note: `IIT JAM ${rawScore}/100 ≈ ${rounded.toFixed(1)}%ile equivalent`,
    };
  }

  return {
    percentile: Number(Math.min(100, Math.max(0, rawScore)).toFixed(1)),
    note: null,
  };
}

function parseScholarshipClauses(rawText: string): {
  schemeName: string;
  meritSlabs: ScholarshipTier[];
  supplementaryAid: string[];
} {
  const cleaned = rawText.trim();
  if (!cleaned) {
    return {
      schemeName: 'Institutional Merit & Financial Aid',
      meritSlabs: [],
      supplementaryAid: [],
    };
  }

  let schemeName = 'Merit & Tuition Waiver Scheme';
  let bodyText = cleaned;
  const colonIdx = cleaned.indexOf(':');
  if (colonIdx > 3 && colonIdx < 80) {
    schemeName = cleaned.slice(0, colonIdx).trim();
    bodyText = cleaned.slice(colonIdx + 1).trim();
  }

  const clauses = bodyText
    .split(/;|\.(?=\s+[A-Z0-9₹])/)
    .map((c) => c.trim().replace(/\.$/, ''))
    .filter(Boolean);

  const slabsByThreshold = new Map<number, ScholarshipTier>();
  const supplementaryAid: string[] = [];

  for (const clause of clauses) {
    // Check if clause mentions statutory / income / SC/ST / stipend rather than pure exam percentile
    const isIncomeOrCategory =
      /income|sc\/st|pwd|ews|stipend|\/mo|sports|economically|cgpa/i.test(clause);

    // Pattern 1: "<discount>% ... for/at/above/top <min>%..."
    const discountFirst = clause.match(
      /(\d{1,3})\s*%\s*(?:tuition|academic|course|merit|mcm)?\s*(?:fee\s*)?(?:waiver|remission|scholarship|reduction|discount|refund|off)?[^0-9]*?(?:for|at|>=|above|with)\s*(?:top\s*)?(\d{1,3}(?:\.\d+)?)\s*%/i
    );

    // Pattern 2: "<min>%+ (percentile/score/merit) ... <discount>% waiver/scholarship/off"
    const thresholdFirst = !discountFirst
      ? clause.match(
          /(?:>=|above|minimum|with|top)?\s*(\d{1,3}(?:\.\d+)?)\s*%\+?\s*(?:percentile|score|merit|marks|%ile)?[^0-9]*?(\d{1,3})\s*%\s*(?:tuition|academic|course|fee)?\s*(?:waiver|remission|scholarship|reduction|discount|refund|off)/i
        )
      : null;

    if (!isIncomeOrCategory && (discountFirst || thresholdFirst)) {
      const discountPercent = Number(discountFirst ? discountFirst[1] : thresholdFirst![2]);
      const minPercentile = Number(discountFirst ? discountFirst[2] : thresholdFirst![1]);

      if (
        Number.isFinite(discountPercent) &&
        Number.isFinite(minPercentile) &&
        discountPercent > 0 &&
        discountPercent <= 100 &&
        minPercentile >= 30 &&
        minPercentile <= 100
      ) {
        const existing = slabsByThreshold.get(minPercentile);
        if (!existing || discountPercent > existing.discountPercent) {
          slabsByThreshold.set(minPercentile, {
            minPercentile,
            discountPercent,
            label: `${discountPercent}% Fee Reduction`,
            condition: clause,
          });
        }
        continue;
      }
    }

    supplementaryAid.push(clause);
  }

  const meritSlabs = Array.from(slabsByThreshold.values()).sort(
    (a, b) => b.minPercentile - a.minPercentile
  );

  return { schemeName, meritSlabs, supplementaryAid };
}

function extractFeeBoundsLakhs(feeText: string): [number, number] | null {
  if (!feeText || /n\/a|not\s+listed|none/i.test(feeText)) return null;
  const matches = Array.from(feeText.matchAll(/([\d.]+)\s*L/gi)).map((m) => Number(m[1]));
  if (matches.length === 0) {
    const num = feeText.match(/([\d.]+)/);
    if (!num) return null;
    const val = Number(num[1]);
    return Number.isFinite(val) && val > 0 ? [val, val] : null;
  }
  const lo = matches[0];
  const hi = matches.length > 1 ? matches[matches.length - 1] : lo;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  return [lo, Math.max(lo, hi)];
}

function formatLakhsRange(lo: number, hi: number): string {
  const fmt = (n: number) => `₹${n.toFixed(1)}L`;
  if (Math.abs(hi - lo) < 0.05) return fmt(lo);
  return `${fmt(lo)} – ${fmt(hi)}`;
}

function computeFeeReduction(
  degreeLabel: string,
  feeText: string,
  discountPercent: number
): FeeReductionBreakdown | null {
  const bounds = extractFeeBoundsLakhs(feeText);
  if (!bounds) return null;

  const [lo, hi] = bounds;
  const factor = discountPercent / 100;
  const saveLo = lo * factor;
  const saveHi = hi * factor;
  const netLo = Math.max(0, lo - saveLo);
  const netHi = Math.max(0, hi - saveHi);

  return {
    degreeLabel,
    originalRange: feeText,
    discountPercent,
    savingsRange: formatLakhsRange(saveLo, saveHi),
    netFeeRange: formatLakhsRange(netLo, netHi),
    estimatedMidSavingsLakhs: Number((((saveLo + saveHi) / 2)).toFixed(1)),
  };
}

export function evaluateScholarshipEligibility(
  college: CollegeRecord,
  profile: ChanceMeProfile
): ScholarshipEvaluation {
  const rawText = (college.scholarshipInfo ?? '').trim();
  const { schemeName, meritSlabs, supplementaryAid } = parseScholarshipClauses(rawText);

  const trimmedScore = profile.score.trim();
  const parsedScore = trimmedScore ? Number(trimmedScore) : NaN;
  const hasUserScore = trimmedScore.length > 0 && Number.isFinite(parsedScore) && parsedScore >= 0;

  let normalizedPercentile: number | null = null;
  let normalizationNote: string | null = null;
  if (hasUserScore) {
    const norm = normalizeScoreToPercentile(profile.exam, parsedScore);
    normalizedPercentile = norm.percentile;
    normalizationNote = norm.note;
  }

  let matchedSlab: ScholarshipTier | null = null;
  let nextSlab: { slab: ScholarshipTier; gap: number } | null = null;

  if (normalizedPercentile !== null && meritSlabs.length > 0) {
    for (const slab of meritSlabs) {
      if (normalizedPercentile >= slab.minPercentile) {
        matchedSlab = slab;
        break;
      }
    }

    // Find next higher slab user hasn't unlocked yet
    const higherSlabs = meritSlabs.filter((s) => s.minPercentile > normalizedPercentile!);
    if (higherSlabs.length > 0) {
      const closestHigher = higherSlabs[higherSlabs.length - 1];
      nextSlab = {
        slab: closestHigher,
        gap: Number((closestHigher.minPercentile - normalizedPercentile).toFixed(1)),
      };
    }
  }

  const activeDiscount = matchedSlab?.discountPercent ?? 0;
  const ugReduction =
    activeDiscount > 0
      ? computeFeeReduction('Undergraduate (UG)', college.feeRanges.ugTotal, activeDiscount)
      : null;
  const pgReduction =
    activeDiscount > 0
      ? computeFeeReduction('Postgraduate (PG)', college.feeRanges.pgTotal, activeDiscount)
      : null;

  const mentionsGateStipend = /12,400|gate.*stipend|assistantship/i.test(rawText);
  const gateStipendEligible =
    mentionsGateStipend &&
    profile.exam === 'GATE' &&
    hasUserScore &&
    parsedScore >= 320;

  const gateStipendSummary = mentionsGateStipend
    ? '₹12,400/month M.Tech Teaching Assistantship (~₹2.98L total over 24 months for GATE-qualified entrants)'
    : null;

  let examAlignmentNote: string | null = null;
  if (hasUserScore) {
    const acceptsDirectly = college.entranceExams.some((e) => {
      const lower = e.toLowerCase();
      if (profile.exam === 'Merit') return lower.includes('merit') || lower.includes('cuet');
      if (profile.exam === 'IIT JAM') return lower.includes('jam');
      return lower.includes(profile.exam.toLowerCase());
    });
    if (!acceptsDirectly) {
      examAlignmentNote = `${college.shortName} primarily uses ${college.entranceExams
        .slice(0, 3)
        .join(', ')} for scholarships; estimate shown uses equivalent percentile.`;
    }
  }

  return {
    hasInfo: rawText.length > 0,
    rawText,
    schemeName,
    meritSlabs,
    supplementaryAid,
    hasUserScore,
    rawUserScore: hasUserScore ? parsedScore : null,
    normalizedPercentile,
    normalizationNote,
    matchedSlab,
    nextSlab,
    ugReduction,
    pgReduction,
    gateStipendEligible,
    gateStipendSummary,
    examAlignmentNote,
  };
}
