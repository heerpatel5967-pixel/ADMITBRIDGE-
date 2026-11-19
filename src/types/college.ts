export type DegreeLevel = 'Undergraduate' | 'Postgraduate';

export type ProgramStream =
  | 'B.Tech'
  | 'BCA'
  | 'B.Sc'
  | 'M.Tech'
  | 'MBA'
  | 'MCA'
  | 'M.Sc';

export type LocationFilter =
  | 'Jaipur'
  | 'Jodhpur'
  | 'Maharashtra'
  | 'Tamil Nadu'
  | 'Karnataka'
  | 'Uttar Pradesh'
  | 'Delhi NCR';

export type InstitutionTypeFilter =
  | 'Private University'
  | 'Government/NIT/IIT'
  | 'Deemed University';

export interface FeeRanges {
  ugTotal: string;
  pgTotal: string;
}

export interface RawCollegeEntry {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  portalUrl: string;
  ugCourses: string[];
  pgCourses: string[];
  entranceExams: string[];
  feeRanges: FeeRanges;
  placementHighlights: string;
  scholarshipInfo?: string;
}

export interface CollegeRecord extends RawCollegeEntry {
  shortName: string;
  locationTags: LocationFilter[];
  institutionTypeTags: InstitutionTypeFilter[];
  degreeLevels: DegreeLevel[];
  programs: ProgramStream[];
  minUgFeeLakhs: number;
  minPgFeeLakhs: number;
  avgPackageNum: number;
  source: 'preloaded' | 'custom';
  addedAt?: string;
  createdBy?: string;
}

export interface ActiveFilters {
  search: string;
  degreeLevels: DegreeLevel[];
  locations: LocationFilter[];
  institutionTypes: InstitutionTypeFilter[];
  programs: ProgramStream[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}
