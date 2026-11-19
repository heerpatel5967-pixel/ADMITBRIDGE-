import {
  CollegeRecord,
  DegreeLevel,
  InstitutionTypeFilter,
  LocationFilter,
  ProgramStream,
  RawCollegeEntry,
} from '../types/college';

export const DEGREE_LEVEL_OPTIONS: DegreeLevel[] = [
  'Undergraduate',
  'Postgraduate',
];

export const LOCATION_FILTER_OPTIONS: LocationFilter[] = [
  'Jaipur',
  'Jodhpur',
  'Maharashtra',
  'Tamil Nadu',
  'Karnataka',
  'Uttar Pradesh',
  'Delhi NCR',
];

export const INSTITUTION_TYPE_OPTIONS: InstitutionTypeFilter[] = [
  'Private University',
  'Government/NIT/IIT',
  'Deemed University',
];

export const PROGRAM_STREAM_OPTIONS: ProgramStream[] = [
  'B.Tech',
  'BCA',
  'B.Sc',
  'M.Tech',
  'MBA',
  'MCA',
  'M.Sc',
];

const EXACT_PRELOADED_DATASET: RawCollegeEntry[] = [
  {
    id: 'muj-jaipur',
    name: 'Manipal University Jaipur (MUJ)',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Private University',
    portalUrl: 'https://muj.onlinemanipal.com/online-degree-courses-manipal-university-jaipur',
    ugCourses: ['B.Tech', 'BBA', 'BCA', 'B.Sc', 'B.Des', 'B.Com'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc'],
    entranceExams: ['MET', 'JEE Main', 'CUET', 'CAT', 'MAT', 'GATE'],
    feeRanges: {
      ugTotal: '₹4.7L – ₹19.7L',
      pgTotal: '₹3.5L – ₹11.5L',
    },
    placementHighlights: 'Avg ~₹7.5–8.5 LPA | Highest ~₹85–88 LPA',
    scholarshipInfo:
      'TMA Pai Merit Scholarship: 100% tuition waiver for 95%+ percentile in JEE Main/MET/Merit; 50% tuition waiver for 90%+ percentile; 25% tuition waiver for 85%+ percentile; 15% tuition waiver for 80%+ percentile.',
  },
  {
    id: 'lnmiit-jaipur',
    name: 'The LNM Institute of Information Technology (LNMIIT)',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Deemed / Private (Autonomous)',
    portalUrl: 'https://lnmiit.ac.in/admissions/',
    ugCourses: ['B.Tech (CSE, CCE, ECE, Mechanical)', 'B.Tech-M.Tech Dual Degree'],
    pgCourses: ['M.Tech', 'M.Sc'],
    entranceExams: ['JEE Main', 'GATE', 'CCMT', 'IIT JAM'],
    feeRanges: {
      ugTotal: '₹17.0L – ₹22.6L',
      pgTotal: '₹2.5L – ₹4.7L',
    },
    placementHighlights: 'Avg ~₹12.0–12.8 LPA | Highest ~₹55–1.24 Cr',
    scholarshipInfo:
      'LNMIIT Merit & MCM Scholarships: 50% tuition waiver for 98.5%+ JEE Main percentile; 25% tuition waiver for 96.5%+ percentile; 20% Merit-cum-Means tuition assistance for high CGPA.',
  },
  {
    id: 'jecrc-jaipur',
    name: 'JECRC University',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Private University',
    portalUrl: 'https://jecrcuniversity.edu.in/',
    ugCourses: ['B.Tech', 'BCA', 'BBA', 'B.Sc', 'B.Des'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc'],
    entranceExams: ['JEE Main', 'CUET', 'CAT', 'MAT', 'GATE'],
    feeRanges: {
      ugTotal: '₹3.0L – ₹9.9L',
      pgTotal: '₹2.2L – ₹5.1L',
    },
    placementHighlights: 'Avg ~₹4.2–6.0 LPA | Highest ~₹33 LPA',
    scholarshipInfo:
      'JU Merit Scholarship: 50% tuition fee waiver for 90%+ percentile in JEE Main/CUET/Merit; 25% tuition waiver for 80%+ percentile; 15% tuition waiver for 75%+ percentile.',
  },
  {
    id: 'amity-jaipur',
    name: 'Amity University Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Private University',
    portalUrl: 'https://www.amity.edu/jaipur/',
    ugCourses: ['B.Tech', 'BBA', 'BCA', 'B.Sc', 'B.Des', 'BA LLB'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc', 'LLM'],
    entranceExams: ['JEE Main', 'CUET', 'AMCAT', 'CAT', 'MAT', 'GATE'],
    feeRanges: {
      ugTotal: '₹5.2L – ₹13.4L',
      pgTotal: '₹2.5L – ₹8.9L',
    },
    placementHighlights: 'Avg ~₹5.0–5.6 LPA | Highest ~₹47.6–52.7 LPA',
    scholarshipInfo:
      'On-Admission Merit Scholarship: 100% tuition waiver for 95%+ in JEE Main/CUET/Merit; 50% tuition waiver for 90%+ percentile; 25% tuition waiver for 85%+ percentile.',
  },
  {
    id: 'poornima-jaipur',
    name: 'Poornima University',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Private University',
    portalUrl: 'https://poornima.edu.in/',
    ugCourses: ['B.Tech', 'BCA', 'BBA', 'B.Sc', 'B.Des'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc'],
    entranceExams: ['JEE Main', 'CUET', 'CAT', 'MAT', 'Merit-based'],
    feeRanges: {
      ugTotal: '₹2.8L – ₹6.1L',
      pgTotal: '₹1.8L – ₹5.0L',
    },
    placementHighlights: 'Avg ~₹3.6–6.0 LPA | Highest ~₹30–52.8 LPA',
    scholarshipInfo:
      'Shanti Education Merit Scholarship: 50% tuition waiver for 90%+ in Merit/JEE Main/CUET; 30% tuition waiver for 80%+ score; 15% tuition waiver for 70%+ score.',
  },
  {
    id: 'jklu-jaipur',
    name: 'JK Lakshmipat University (JKLU)',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Private University',
    portalUrl: 'https://jklu.edu.in/',
    ugCourses: ['B.Tech', 'B.Des', 'BBA'],
    pgCourses: ['M.Tech', 'M.Des', 'MBA'],
    entranceExams: ['JEE Main', 'CUET', 'JKDET', 'GATE', 'CAT', 'MAT'],
    feeRanges: {
      ugTotal: '₹11.2L – ₹11.9L',
      pgTotal: '₹3.6L – ₹19.2L',
    },
    placementHighlights: 'Avg ~₹6.0–8.1 LPA | Highest ~₹22.5–31 LPA',
    scholarshipInfo:
      'JKLU Merit Scholarship: 100% tuition waiver for 95%+ percentile in JEE Main/CUET/Merit; 75% tuition waiver for 90%+ percentile; 50% tuition waiver for 85%+ percentile; 25% tuition waiver for 78%+ percentile.',
  },
  {
    id: 'mnit-jaipur',
    name: 'Malaviya National Institute of Technology (MNIT)',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Government (NIT)',
    portalUrl: 'https://www.mnit.ac.in/',
    ugCourses: ['B.Tech', 'B.Arch'],
    pgCourses: ['M.Tech', 'MBA', 'M.Sc', 'M.Plan'],
    entranceExams: ['JEE Main', 'JoSAA', 'GATE', 'CCMT', 'CAT', 'IIT JAM'],
    feeRanges: {
      ugTotal: '₹5.0L – ₹6.7L',
      pgTotal: '₹1.8L – ₹4.8L',
    },
    placementHighlights: 'Avg ~₹11.0 LPA | Highest ~₹64 LPA',
    scholarshipInfo:
      'Central Sector & MCM Fee Remission: 25% merit-cum-means tuition support for 98%+ JEE Main; 100% tuition waiver for SC/ST/PwD & family income < ₹1L; 66% tuition remission for income ₹1L–₹5L; ₹12,400/mo GATE M.Tech stipend.',
  },
  {
    id: 'vit-vellore',
    name: 'Vellore Institute of Technology (VIT)',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: 'Private / Deemed University',
    portalUrl: 'https://viteee.vit.ac.in/',
    ugCourses: ['B.Tech', 'B.Des', 'BBA', 'BCA', 'B.Sc'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc'],
    entranceExams: ['VITEEE', 'VITMEE', 'GATE', 'CAT', 'XAT', 'MAT'],
    feeRanges: {
      ugTotal: '₹7.8L – ₹19.8L',
      pgTotal: '₹3.0L – ₹7.5L',
    },
    placementHighlights: 'Avg ~₹9.0–9.9 LPA | Highest ~₹88 LPA',
    scholarshipInfo:
      'GV School Development Programme (GVSDP): 100% tuition waiver for 98%+ percentile; 75% tuition waiver for 95%+ percentile; 50% tuition waiver for 90%+ percentile; 25% tuition waiver for 85%+ percentile.',
  },
  {
    id: 'srmist-chennai',
    name: 'SRM Institute of Science and Technology (SRMIST)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Private / Deemed University',
    portalUrl: 'https://www.srmist.edu.in/',
    ugCourses: ['B.Tech', 'B.Arch', 'BBA', 'BCA', 'B.Sc'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc'],
    entranceExams: ['SRMJEEE', 'JEE Main', 'GATE', 'CAT', 'MAT'],
    feeRanges: {
      ugTotal: '₹10.0L – ₹18.0L',
      pgTotal: '₹3.2L – ₹8.5L',
    },
    placementHighlights: 'Avg ~₹7.1 LPA | Highest ~₹52 LPA',
    scholarshipInfo:
      'SRM Founder’s Merit Scholarship: 100% tuition waiver for 97%+ percentile in JEE Main/SRMJEEE/Merit; 50% tuition waiver for 92%+ percentile; 25% tuition waiver for 85%+ percentile.',
  },
  {
    id: 'symbiosis-pune',
    name: 'Symbiosis International University (SIU)',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'Private / Deemed University',
    portalUrl: 'https://symbiosisonlinemba.ssodl.edu.in/',
    ugCourses: ['B.Tech', 'BBA', 'B.Sc', 'B.Des', 'BA LLB'],
    pgCourses: ['MBA', 'M.Tech', 'M.Sc', 'LLM'],
    entranceExams: ['SET', 'SITEEE', 'JEE Main', 'SNAP', 'GATE'],
    feeRanges: {
      ugTotal: '₹11.2L – ₹16.0L',
      pgTotal: '₹4.5L – ₹26.2L',
    },
    placementHighlights: 'MBA Avg ~₹20–28 LPA (SIBM) | B.Tech Avg ~₹8.5 LPA',
    scholarshipInfo:
      'SIU Merit & Global Scholarships: 50% academic fee waiver for 96%+ percentile in CAT/SNAP/JEE Main/Merit; 25% academic fee waiver for 90%+ percentile; Sports & Economically Backward waivers also available.',
  },
  {
    id: 'nmims-mumbai',
    name: "SVKM's NMIMS",
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Private / Deemed University',
    portalUrl: 'https://www.nmims.edu/',
    ugCourses: ['B.Tech', 'BBA', 'B.Com', 'B.Sc', 'B.Arch'],
    pgCourses: ['MBA', 'M.Tech', 'MCA', 'M.Sc'],
    entranceExams: ['NPAT', 'NMIMS CET', 'NMAT', 'GATE'],
    feeRanges: {
      ugTotal: '₹9.0L – ₹20.0L',
      pgTotal: '₹4.0L – ₹27.0L',
    },
    placementHighlights: 'MBA Avg ~₹25+ LPA | B.Tech Avg ~₹9.5 LPA',
    scholarshipInfo:
      'NMIMS Merit-cum-Means & Central Aid: 50% tuition waiver for 96%+ percentile in CAT/NMAT/JEE Main/NPAT; 25% tuition waiver for 90%+ percentile; PG M.Tech GATE stipend support.',
  },
  {
    id: 'mahe-manipal',
    name: 'Manipal Academy of Higher Education (MAHE)',
    city: 'Manipal',
    state: 'Karnataka',
    type: 'Private / Deemed University',
    portalUrl: 'https://www.manipal.edu/',
    ugCourses: ['B.Tech', 'B.Arch', 'BBA', 'B.Sc', 'Health Sciences'],
    pgCourses: ['M.Tech', 'MBA (TAPMI)', 'MCA', 'M.Sc'],
    entranceExams: ['MET', 'GATE', 'CAT', 'XAT', 'GMAT'],
    feeRanges: {
      ugTotal: '₹12.0L – ₹19.6L',
      pgTotal: '₹3.8L – ₹17.5L',
    },
    placementHighlights: 'Avg ~₹10.5–12.5 LPA | Highest ~₹51 LPA',
    scholarshipInfo:
      'Kalam-Pai & Freeship Merit Scholarship: 100% course fee waiver for 97%+ percentile in MET/JEE Main/CAT; 50% tuition waiver for 92%+ percentile; 20% tuition waiver for 85%+ percentile.',
  },
  {
    id: 'pes-bengaluru',
    name: 'PES University',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private University',
    portalUrl: 'https://pes.edu/',
    ugCourses: ['B.Tech', 'B.Des', 'BBA', 'B.Com', 'B.Sc'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc'],
    entranceExams: ['KCET', 'JEE Main', 'PESSAT', 'GATE', 'PGCET', 'CAT'],
    feeRanges: {
      ugTotal: '₹14.0L – ₹22.9L',
      pgTotal: '₹3.5L – ₹12.0L',
    },
    placementHighlights: 'Avg ~₹8.0–10.2 LPA | Highest ~₹65 LPA',
    scholarshipInfo:
      'Prof. CNR Rao & MRD Merit Scholarships: 50% tuition fee refund for 95%+ percentile in KCET/JEE Main/PESSAT; 40% tuition refund for 90%+ percentile; 25% tuition refund for 85%+ percentile.',
  },
  {
    id: 'amity-noida',
    name: 'Amity University Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    type: 'Private University',
    portalUrl: 'https://noida.amity.edu/admission-open/',
    ugCourses: ['B.Tech', 'BBA', 'BCA', 'B.Sc', 'B.Des', 'BA LLB'],
    pgCourses: ['M.Tech', 'MBA', 'MCA', 'M.Sc', 'LLM'],
    entranceExams: ['JEE Main', 'CUET', 'CAT', 'NMAT', 'MAT', 'GATE'],
    feeRanges: {
      ugTotal: '₹6.6L – ₹19.2L',
      pgTotal: '₹3.0L – ₹17.8L',
    },
    placementHighlights: 'Avg ~₹6.0–7.5 LPA | Highest ~₹61.7 LPA',
    scholarshipInfo:
      'Dr. Ashok K. Chauhan Merit Scholarship: 100% tuition waiver for 96%+ percentile in JEE Main/CAT/CUET/Merit; 50% tuition waiver for 92%+ percentile; 25% tuition waiver for 85%+ percentile.',
  },
  {
    id: 'iit-jodhpur',
    name: 'Indian Institute of Technology Jodhpur (IIT Jodhpur)',
    city: 'Jodhpur',
    state: 'Rajasthan',
    type: 'Government (IIT)',
    portalUrl: 'https://www.iitj.ac.in/',
    ugCourses: ['B.Tech', 'B.Sc-M.Sc Dual Degree'],
    pgCourses: ['M.Tech', 'M.Sc', 'MBA'],
    entranceExams: ['JEE Advanced', 'JoSAA', 'GATE', 'CCMT', 'IIT JAM', 'CAT'],
    feeRanges: {
      ugTotal: '₹8.0L – ₹9.5L',
      pgTotal: '₹1.5L – ₹5.5L',
    },
    placementHighlights: 'Avg ~₹18.0–21.0 LPA | Highest ~₹50–61 LPA',
    scholarshipInfo:
      'IIT Merit-cum-Means & Govt Remission: 25% MCM & Institute Free Studentship for 98%+ JEE Advanced; 100% tuition waiver for SC/ST/PwD & family income < ₹1L; 66% tuition remission for income ₹1L–₹5L; ₹12,400/mo GATE M.Tech stipend.',
  },
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay (IIT Bombay)',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Government (IIT)',
    portalUrl: 'https://www.iitb.ac.in/',
    ugCourses: ['B.Tech', 'B.S.'],
    pgCourses: ['M.Tech', 'M.Sc', 'MBA (SJMSOM)'],
    entranceExams: ['JEE Advanced', 'JoSAA', 'GATE', 'IIT JAM', 'CAT'],
    feeRanges: {
      ugTotal: '₹8.5L – ₹10.0L',
      pgTotal: '₹1.5L – ₹14.0L',
    },
    placementHighlights: 'Avg ~₹23.0–25.0 LPA | Highest ~₹1.6+ Cr',
    scholarshipInfo:
      'IIT Bombay MCM & Endowment Aid: 25% MCM tuition waiver for 99%+ JEE Advanced; 100% tuition waiver for SC/ST/PwD & income < ₹1L; 66% tuition remission for income ₹1L–₹5L; ₹12,400/mo GATE M.Tech assistantship.',
  },
  {
    id: 'iit-delhi',
    name: 'Indian Institute of Technology Delhi (IIT Delhi)',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Government (IIT)',
    portalUrl: 'https://home.iitd.ac.in/',
    ugCourses: ['B.Tech', 'B.Tech-M.Tech Dual Degree'],
    pgCourses: ['M.Tech', 'M.Sc', 'MBA (DMS)'],
    entranceExams: ['JEE Advanced', 'JoSAA', 'GATE', 'IIT JAM', 'CAT'],
    feeRanges: {
      ugTotal: '₹8.5L – ₹10.0L',
      pgTotal: '₹1.5L – ₹12.0L',
    },
    placementHighlights: 'Avg ~₹22.0–25.0 LPA | Highest ~₹1.5+ Cr',
    scholarshipInfo:
      'IIT Delhi MCM & Donor Scholarships: 25% MCM tuition waiver for 99%+ JEE Advanced; 100% tuition waiver for SC/ST/PwD & income < ₹1L; 66% tuition remission for income ₹1L–₹5L; ₹12,400/mo GATE M.Tech assistantship.',
  },
  {
    id: 'iit-madras',
    name: 'Indian Institute of Technology Madras (IIT Madras)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Government (IIT)',
    portalUrl: 'https://www.iitm.ac.in/',
    ugCourses: ['B.Tech', 'B.S. (Data Science / Electronic Systems)'],
    pgCourses: ['M.Tech', 'M.Sc', 'MBA (DoMS)'],
    entranceExams: ['JEE Advanced', 'JoSAA', 'GATE', 'IIT JAM', 'CAT'],
    feeRanges: {
      ugTotal: '₹8.5L – ₹10.0L',
      pgTotal: '₹1.5L – ₹10.0L',
    },
    placementHighlights: 'Avg ~₹21.0–24.0 LPA | Highest ~₹1.3+ Cr',
    scholarshipInfo:
      'IIT Madras MCM & Institute Aid: 25% MCM tuition waiver for 98.5%+ JEE Advanced; 100% tuition waiver for SC/ST/PwD & income < ₹1L; 66% tuition remission for income ₹1L–₹5L; ₹12,400/mo GATE M.Tech stipend.',
  },
];

function parseFirstLakhs(text: string): number {
  const match = text.match(/([\d.]+)\s*L/i);
  if (match) return Number(match[1]) || 0;
  const numMatch = text.match(/([\d.]+)/);
  return numMatch ? Number(numMatch[1]) || 0 : 0;
}

function parseAvgPackage(text: string): number {
  const match = text.match(/Avg\s*~?₹?([\d.]+)/i);
  if (match) return Number(match[1]) || 0;
  const fallback = text.match(/([\d.]+)/);
  return fallback ? Number(fallback[1]) || 0 : 0;
}

function deriveShortName(name: string): string {
  const paren = name.match(/\(([^)]+)\)/);
  if (paren && /^IIT\b/i.test(paren[1])) {
    return paren[1].trim();
  }
  if (paren && paren[1].length <= 16) {
    return `${name.split('(')[0].trim().slice(0, 14)} (${paren[1]})`;
  }
  return name.length > 26 ? `${name.slice(0, 24)}…` : name;
}

export function normalizeCollegeEntry(
  entry: RawCollegeEntry,
  source: 'preloaded' | 'custom' = 'preloaded'
): CollegeRecord {
  const locationTags: LocationFilter[] = [];
  if (entry.city.toLowerCase().includes('jaipur')) locationTags.push('Jaipur');
  if (entry.city.toLowerCase().includes('jodhpur')) locationTags.push('Jodhpur');
  if (entry.state === 'Maharashtra') locationTags.push('Maharashtra');
  if (entry.state === 'Tamil Nadu') locationTags.push('Tamil Nadu');
  if (entry.state === 'Karnataka') locationTags.push('Karnataka');
  if (entry.state === 'Uttar Pradesh') {
    locationTags.push('Uttar Pradesh');
    if (
      entry.city.toLowerCase().includes('noida') ||
      entry.city.toLowerCase().includes('ghaziabad')
    ) {
      locationTags.push('Delhi NCR');
    }
  }
  if (entry.state.toLowerCase().includes('delhi') || entry.city.toLowerCase().includes('delhi')) {
    if (!locationTags.includes('Delhi NCR')) locationTags.push('Delhi NCR');
  }

  const institutionTypeTags: InstitutionTypeFilter[] = [];
  const lowerType = entry.type.toLowerCase();
  if (lowerType.includes('government') || lowerType.includes('nit') || lowerType.includes('iit')) {
    institutionTypeTags.push('Government/NIT/IIT');
  }
  if (lowerType.includes('deemed')) {
    institutionTypeTags.push('Deemed University');
  }
  if (lowerType.includes('private')) {
    institutionTypeTags.push('Private University');
  }
  if (institutionTypeTags.length === 0) {
    institutionTypeTags.push('Private University');
  }

  const degreeLevels: DegreeLevel[] = [];
  if (entry.ugCourses.length > 0) degreeLevels.push('Undergraduate');
  if (entry.pgCourses.length > 0) degreeLevels.push('Postgraduate');

  const combinedCourses = [...entry.ugCourses, ...entry.pgCourses].join(' | ');
  const programs: ProgramStream[] = PROGRAM_STREAM_OPTIONS.filter((stream) =>
    combinedCourses.toLowerCase().includes(stream.toLowerCase())
  );

  return {
    ...entry,
    shortName: deriveShortName(entry.name),
    locationTags,
    institutionTypeTags,
    degreeLevels,
    programs,
    minUgFeeLakhs: parseFirstLakhs(entry.feeRanges?.ugTotal ?? ''),
    minPgFeeLakhs: parseFirstLakhs(entry.feeRanges?.pgTotal ?? ''),
    avgPackageNum: parseAvgPackage(entry.placementHighlights ?? ''),
    source,
  };
}

export const PRELOADED_COLLEGES: CollegeRecord[] = EXACT_PRELOADED_DATASET.map((entry) =>
  normalizeCollegeEntry(entry, 'preloaded')
);

export const SAMPLE_BROCHURE_TEXT = `BITS Pilani — Undergraduate & Postgraduate Admissions Brochure 2026-27
Location: Pilani, Rajasthan (Private / Deemed University)
Official Portal: https://www.bitsadmission.com/
UG Courses: B.Tech (B.E. CSE, ECE, EEE, Mechanical, Chemical), B.Pharm, M.Sc (Integrated)
PG Courses: M.Tech (M.E.), MBA (Business Analytics), M.Pharm
Entrance Exams Accepted: BITSAT, JEE Main, BITS HD, GATE, CAT, XAT, GMAT
UG Total Fee: ₹19.9L – ₹21.5L
PG Total Fee: ₹10.8L – ₹11.5L
Placements: Avg ~₹18.5–19.7 LPA | Highest ~₹60.8 LPA
Scholarships: Merit-cum-Need Scholarship: 80% tuition waiver for 98%+ percentile; 40% tuition waiver for 95%+ percentile; 25% tuition waiver for 90%+ percentile.`;
