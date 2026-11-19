import amityJaipurCampus from '../assets/images/real_amity_jaipur.jpg';
import amityNoidaCampus from '../assets/images/real_amity_noida.jpg';
import iitBombayCampus from '../assets/images/real_iit_bombay.jpg';
import iitDelhiCampus from '../assets/images/real_iit_delhi.jpg';
import iitJodhpurCampus from '../assets/images/real_iit_jodhpur.jpg';
import iitMadrasCampus from '../assets/images/real_iit_madras.jpg';
import jecrcJaipurCampus from '../assets/images/real_jecrc_jaipur.jpg';
import jkluJaipurCampus from '../assets/images/real_jklu_jaipur.jpg';
import lnmiitJaipurCampus from '../assets/images/real_lnmiit_jaipur.jpg';
import maheManipalCampus from '../assets/images/real_mahe_manipal.webp';
import mnitJaipurCampus from '../assets/images/real_mnit_jaipur.jpg';
import mujJaipurCampus from '../assets/images/real_muj_jaipur.jpg';
import nmimsMumbaiCampus from '../assets/images/real_nmims_mumbai.jpg';
import pesBengaluruCampus from '../assets/images/real_pes_bengaluru.jpg';
import poornimaJaipurCampus from '../assets/images/real_poornima_jaipur.jpg';
import srmistChennaiCampus from '../assets/images/real_srmist_chennai.jpg';
import symbiosisPuneCampus from '../assets/images/real_symbiosis_pune.jpg';
import vitVelloreCampus from '../assets/images/real_vit_vellore.jpg';
import { CollegeRecord } from '../types/college';

export interface CampusBannerAsset {
  src: string;
  alt: string;
  fallbackGradient: string;
  hasEmbeddedSignage: boolean;
  objectPositionClass?: string;
}

const SPECIFIC_COLLEGE_BANNERS: Record<string, CampusBannerAsset> = {
  'muj-jaipur': {
    src: mujJaipurCampus,
    alt: 'Manipal University Jaipur Dome Building and terracotta entrance gates',
    fallbackGradient: 'from-amber-900 via-stone-800 to-indigo-950',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'lnmiit-jaipur': {
    src: lnmiitJaipurCampus,
    alt: 'The LNM Institute of Information Technology (LNMIIT) Jaipur aerial campus and central plaza',
    fallbackGradient: 'from-indigo-950 via-slate-800 to-blue-900',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'jecrc-jaipur': {
    src: jecrcJaipurCampus,
    alt: 'JECRC University Jaipur academic blocks and central fountain lawn',
    fallbackGradient: 'from-amber-900 via-stone-800 to-indigo-950',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'amity-jaipur': {
    src: amityJaipurCampus,
    alt: 'Amity University Jaipur Aravalli campus with Amity University hillside landmark',
    fallbackGradient: 'from-amber-900 via-stone-800 to-indigo-950',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-center',
  },
  'poornima-jaipur': {
    src: poornimaJaipurCampus,
    alt: 'Poornima University Jaipur campus building and sports ground',
    fallbackGradient: 'from-amber-900 via-stone-800 to-indigo-950',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'jklu-jaipur': {
    src: jkluJaipurCampus,
    alt: 'JK Lakshmipat University (JKLU) Jaipur red sandstone academic complex',
    fallbackGradient: 'from-amber-900 via-stone-800 to-indigo-950',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'mnit-jaipur': {
    src: mnitJaipurCampus,
    alt: 'Malaviya National Institute of Technology (MNIT) Jaipur Prabha Bhawan main building',
    fallbackGradient: 'from-indigo-950 via-slate-800 to-blue-900',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-center',
  },
  'vit-vellore': {
    src: vitVelloreCampus,
    alt: 'Vellore Institute of Technology (VIT) Vellore main clock tower entrance gate',
    fallbackGradient: 'from-emerald-950 via-slate-800 to-teal-900',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-center',
  },
  'srmist-chennai': {
    src: srmistChennaiCampus,
    alt: 'SRM Institute of Science and Technology (SRMIST) Kattankulathur aerial campus view',
    fallbackGradient: 'from-emerald-950 via-slate-800 to-teal-900',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'symbiosis-pune': {
    src: symbiosisPuneCampus,
    alt: 'Symbiosis International University (SIU) Pune main entrance gate',
    fallbackGradient: 'from-slate-900 via-indigo-950 to-blue-900',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-center',
  },
  'nmims-mumbai': {
    src: nmimsMumbaiCampus,
    alt: "SVKM's NMIMS campus building with NMIMS crest signage",
    fallbackGradient: 'from-slate-900 via-indigo-950 to-blue-900',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-[50%_40%]',
  },
  'mahe-manipal': {
    src: maheManipalCampus,
    alt: 'Manipal Institute of Technology, Manipal Academy of Higher Education (MAHE) main building',
    fallbackGradient: 'from-emerald-950 via-slate-800 to-teal-900',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-center',
  },
  'pes-bengaluru': {
    src: pesBengaluruCampus,
    alt: 'PES University Bengaluru Ring Road campus architectural block',
    fallbackGradient: 'from-emerald-950 via-slate-800 to-teal-900',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'amity-noida': {
    src: amityNoidaCampus,
    alt: 'Amity University Noida aerial campus courtyard and red-brick blocks',
    fallbackGradient: 'from-slate-900 via-indigo-950 to-blue-900',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'iit-jodhpur': {
    src: iitJodhpurCampus,
    alt: 'Indian Institute of Technology Jodhpur (IIT Jodhpur) main architectural entrance gate',
    fallbackGradient: 'from-indigo-950 via-slate-800 to-blue-900',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-center',
  },
  'iit-bombay': {
    src: iitBombayCampus,
    alt: 'Indian Institute of Technology Bombay (IIT Bombay) Main Building and palm-lined walkway',
    fallbackGradient: 'from-indigo-950 via-slate-800 to-blue-900',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
  'iit-delhi': {
    src: iitDelhiCampus,
    alt: 'Indian Institute of Technology Delhi (IIT Delhi) Main Building facade',
    fallbackGradient: 'from-indigo-950 via-slate-800 to-blue-900',
    hasEmbeddedSignage: true,
    objectPositionClass: 'object-center',
  },
  'iit-madras': {
    src: iitMadrasCampus,
    alt: 'Indian Institute of Technology Madras (IIT Madras) Gajendra Circle landmark',
    fallbackGradient: 'from-indigo-950 via-slate-800 to-blue-900',
    hasEmbeddedSignage: false,
    objectPositionClass: 'object-center',
  },
};

export function getCampusBannerAsset(college: CollegeRecord): CampusBannerAsset {
  const id = college.id.toLowerCase();
  const specific = SPECIFIC_COLLEGE_BANNERS[id];
  if (specific) {
    return specific;
  }

  const nameLower = college.name.toLowerCase();
  if (nameLower.includes('manipal university jaipur')) {
    return SPECIFIC_COLLEGE_BANNERS['muj-jaipur'];
  }
  if (nameLower.includes('lnmiit')) {
    return SPECIFIC_COLLEGE_BANNERS['lnmiit-jaipur'];
  }
  if (nameLower.includes('jecrc')) {
    return SPECIFIC_COLLEGE_BANNERS['jecrc-jaipur'];
  }
  if (nameLower.includes('amity') && nameLower.includes('jaipur')) {
    return SPECIFIC_COLLEGE_BANNERS['amity-jaipur'];
  }
  if (nameLower.includes('poornima')) {
    return SPECIFIC_COLLEGE_BANNERS['poornima-jaipur'];
  }
  if (nameLower.includes('lakshmipat') || nameLower.includes('jklu')) {
    return SPECIFIC_COLLEGE_BANNERS['jklu-jaipur'];
  }
  if (nameLower.includes('malaviya') || nameLower.includes('mnit')) {
    return SPECIFIC_COLLEGE_BANNERS['mnit-jaipur'];
  }
  if (nameLower.includes('vellore institute') || nameLower.includes('vit')) {
    return SPECIFIC_COLLEGE_BANNERS['vit-vellore'];
  }
  if (nameLower.includes('srm')) {
    return SPECIFIC_COLLEGE_BANNERS['srmist-chennai'];
  }
  if (nameLower.includes('symbiosis')) {
    return SPECIFIC_COLLEGE_BANNERS['symbiosis-pune'];
  }
  if (nameLower.includes('nmims')) {
    return SPECIFIC_COLLEGE_BANNERS['nmims-mumbai'];
  }
  if (nameLower.includes('manipal academy') || nameLower.includes('mahe')) {
    return SPECIFIC_COLLEGE_BANNERS['mahe-manipal'];
  }
  if (nameLower.includes('pes university')) {
    return SPECIFIC_COLLEGE_BANNERS['pes-bengaluru'];
  }
  if (nameLower.includes('amity') && nameLower.includes('noida')) {
    return SPECIFIC_COLLEGE_BANNERS['amity-noida'];
  }
  if (nameLower.includes('iit jodhpur') || (nameLower.includes('technology') && nameLower.includes('jodhpur'))) {
    return SPECIFIC_COLLEGE_BANNERS['iit-jodhpur'];
  }
  if (nameLower.includes('iit bombay') || (nameLower.includes('technology') && nameLower.includes('bombay'))) {
    return SPECIFIC_COLLEGE_BANNERS['iit-bombay'];
  }
  if (nameLower.includes('iit delhi') || (nameLower.includes('technology') && nameLower.includes('delhi'))) {
    return SPECIFIC_COLLEGE_BANNERS['iit-delhi'];
  }
  if (nameLower.includes('iit madras') || (nameLower.includes('technology') && nameLower.includes('madras'))) {
    return SPECIFIC_COLLEGE_BANNERS['iit-madras'];
  }

  const state = college.state.toLowerCase();
  const city = college.city.toLowerCase();
  const type = college.type.toLowerCase();

  if (type.includes('government') || id.includes('iit') || id.includes('nit')) {
    return {
      src: '',
      alt: `${college.name} campus`,
      fallbackGradient: 'from-indigo-950 via-slate-800 to-blue-900',
      hasEmbeddedSignage: false,
    };
  }

  if (city.includes('jaipur') || state.includes('rajasthan')) {
    return {
      src: '',
      alt: `${college.name} campus`,
      fallbackGradient: 'from-amber-900 via-stone-800 to-indigo-950',
      hasEmbeddedSignage: false,
    };
  }

  if (
    state.includes('tamil nadu') ||
    state.includes('karnataka') ||
    city.includes('vellore') ||
    city.includes('chennai') ||
    city.includes('bengaluru') ||
    city.includes('manipal')
  ) {
    return {
      src: '',
      alt: `${college.name} campus`,
      fallbackGradient: 'from-emerald-950 via-slate-800 to-teal-900',
      hasEmbeddedSignage: false,
    };
  }

  return {
    src: '',
    alt: `${college.name} campus`,
    fallbackGradient: 'from-slate-900 via-indigo-950 to-blue-900',
    hasEmbeddedSignage: false,
  };
}

export function extractAvgPackageLabel(placementHighlights: string): string {
  const match = placementHighlights.match(/Avg\s*~?\s*([^|]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return placementHighlights.split('|')[0]?.trim() || placementHighlights;
}
