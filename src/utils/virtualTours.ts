import iitDelhiAerialCampus from '../assets/images/real_iit_delhi_aerial.jpg';
import iitMadrasHostelsCampus from '../assets/images/real_iit_madras_hostels.jpg';
import iitMadrasNightCampus from '../assets/images/real_iit_madras_night.jpg';
import { CollegeRecord } from '../types/college';
import { getCampusBannerAsset } from './campusAssets';

export interface CampusTourStop {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  alt: string;
  defaultZoom: number;
  initialPanX: number;
  initialPanY: number;
}

export interface CampusVirtualTourData {
  officialTourUrl: string;
  tourLabel: string;
  embedUrl?: string;
  embedKind?: '360-interactive' | 'video-tour';
  highlights: string[];
  stops: CampusTourStop[];
}

interface TourMetadata {
  officialTourUrl: string;
  tourLabel: string;
  embedUrl?: string;
  embedKind?: '360-interactive' | 'video-tour';
  highlights: string[];
}

const TOUR_METADATA_BY_ID: Record<string, TourMetadata> = {
  'muj-jaipur': {
    officialTourUrl: 'https://v1.panoskin.com/?tour=5f1aef29f3c94e38a84263d8',
    tourLabel: 'Official 360° Panoskin Campus Tour',
    embedUrl: 'https://v1.panoskin.com/?tour=5f1aef29f3c94e38a84263d8',
    embedKind: '360-interactive',
    highlights: [
      'Dome Building & Admin Block',
      'Central Library & Amphitheatre',
      'Academic Blocks & Labs',
      'Residential Hostels (GHS)',
    ],
  },
  'nmims-mumbai': {
    officialTourUrl: 'https://nmims.edu/virtual-tour-nmims-main-mumbai.php',
    tourLabel: 'Official 360° NMIMS Virtual Campus Tour',
    embedUrl: 'https://nmims.edu/vt/index.htm',
    embedKind: '360-interactive',
    highlights: [
      'Vile Parle Main Building',
      'Mukesh Patel Engineering Wing',
      'SBM Management & Atrium',
      'Auditorium & Design Studios',
    ],
  },
  'mnit-jaipur': {
    officialTourUrl: 'https://www.mnit.ac.in/students/virtualtour',
    tourLabel: 'Official MNIT Jaipur Virtual Campus Tour',
    embedUrl: 'https://www.youtube.com/embed/6z7dYISoMqw?rel=0',
    embedKind: 'video-tour',
    highlights: [
      'Prabha Bhawan Main Building',
      'Vivekananda Lecture Theatre Complex (VLTC)',
      'Central Library & Computer Centre',
      '317-Acre Green Campus & Hostels',
    ],
  },
  'iit-bombay': {
    officialTourUrl: 'https://www.ir.iitb.ac.in/360-view',
    tourLabel: 'Official IIT Bombay 360° Campus View',
    highlights: [
      'Main Administrative Building',
      'Convocation Hall & Lecture Complex',
      'Central Library & SJMSOM',
      'Powai Lakefront & Academic Spine',
    ],
  },
  'iit-delhi': {
    officialTourUrl: 'https://international.iitd.ac.in/campus-tour/',
    tourLabel: 'Official IIT Delhi Virtual Campus Tour',
    highlights: [
      'Main Building & Administrative Block',
      'Dogra Hall Iconic Roof',
      'Central Library & Lecture Hall Complex',
      'Student Activity Centre & Hostels',
    ],
  },
  'iit-madras': {
    officialTourUrl: 'https://heritage.iitm.ac.in/tour-centre',
    tourLabel: 'Official IIT Madras 360° Heritage & Campus Tour',
    highlights: [
      'Gajendra Circle Landmark',
      'Heritage Centre & Central Library',
      'East Hostels & Forested Trails',
      'Research Park & Academic Zones',
    ],
  },
  'vit-vellore': {
    officialTourUrl: 'https://campustour.vit.ac.in/tour.html',
    tourLabel: 'Official VIT 360° VR Campus Walkthrough',
    highlights: [
      'Main Tower & Silver Jubilee Block',
      'Technology Tower & Pearl Research Park',
      'Periyar Central Library',
      'Anna Auditorium & Hostel Blocks',
    ],
  },
  'mahe-manipal': {
    officialTourUrl: 'https://www.manipal.edu/mu/campus-life/campus-facilities/campus-360-tour.html',
    tourLabel: 'Official MAHE Manipal 360° Campus Tour',
    highlights: [
      'MIT Academic Quadrangle',
      'Central Health Sciences Library',
      'TAPMI & Innovation Centre',
      'Marena Sports Complex',
    ],
  },
  'amity-jaipur': {
    officialTourUrl: 'https://amity.edu/about-panorama.aspx',
    tourLabel: 'Official Amity 360° Panoramic Tour',
    highlights: [
      'Aravalli Hillside Campus Backdrop',
      'Central Academic Courtyard',
      'Engineering & Design Studios',
      'Sports Complex & Hostels',
    ],
  },
  'amity-noida': {
    officialTourUrl: 'https://amity.edu/about-panorama.aspx',
    tourLabel: 'Official Amity 360° Panoramic Tour',
    highlights: [
      'Sector 125 Red-Brick Academic Blocks',
      'Central Library & Moot Court',
      'Amity Innovation Incubator',
      'Sports & Amphitheatre Plaza',
    ],
  },
};

function buildGalleryStops(college: CollegeRecord): CampusTourStop[] {
  const banner = getCampusBannerAsset(college);
  const primarySrc = banner.src;

  if (college.id === 'iit-delhi') {
    return [
      {
        id: 'iitd-main',
        title: 'Main Building Facade',
        subtitle: 'Historic sandstone administrative facade & front lawns',
        imageSrc: primarySrc,
        alt: 'IIT Delhi Main Building front lawn and stone facade',
        defaultZoom: 1,
        initialPanX: 0,
        initialPanY: 0,
      },
      {
        id: 'iitd-aerial',
        title: 'Dogra Hall & Central Library',
        subtitle: 'Elevated campus panorama showing Dogra Hall hyperbolic roof & Central Library',
        imageSrc: iitDelhiAerialCampus,
        alt: 'IIT Delhi aerial campus view showing Main Building, Dogra Hall, and Library',
        defaultZoom: 1,
        initialPanX: 0,
        initialPanY: 0,
      },
      {
        id: 'iitd-detail',
        title: 'Academic Spine & Courtyard',
        subtitle: 'Zoomed inspection of the central complex & green canopy',
        imageSrc: iitDelhiAerialCampus,
        alt: 'IIT Delhi academic spine and green campus courtyard',
        defaultZoom: 1.45,
        initialPanX: -12,
        initialPanY: 6,
      },
    ];
  }

  if (college.id === 'iit-madras') {
    return [
      {
        id: 'iitm-gajendra',
        title: 'Gajendra Circle Landmark',
        subtitle: 'Iconic elephant-flanked central entrance fountain of IIT Madras',
        imageSrc: primarySrc,
        alt: 'Gajendra Circle landmark at IIT Madras',
        defaultZoom: 1,
        initialPanX: 0,
        initialPanY: 0,
      },
      {
        id: 'iitm-hostels',
        title: 'East Hostels & Forested Ramp',
        subtitle: 'Lush wildlife reserve surroundings connecting residential hostels',
        imageSrc: iitMadrasHostelsCampus,
        alt: 'IIT Madras East Hostels and green campus ramp bridge',
        defaultZoom: 1,
        initialPanX: 0,
        initialPanY: 0,
      },
      {
        id: 'iitm-night',
        title: 'Gajendra Circle at Night',
        subtitle: 'Illuminated fountain and palm avenues after dusk',
        imageSrc: iitMadrasNightCampus,
        alt: 'Gajendra Circle illuminated at night at IIT Madras',
        defaultZoom: 1,
        initialPanX: 0,
        initialPanY: 0,
      },
    ];
  }

  return [
    {
      id: `${college.id}-wide`,
      title: 'Main Campus Panorama',
      subtitle: `${college.city}, ${college.state} · Drag or zoom to inspect architectural details`,
      imageSrc: primarySrc,
      alt: banner.alt,
      defaultZoom: 1,
      initialPanX: 0,
      initialPanY: 0,
    },
    {
      id: `${college.id}-left-wing`,
      title: 'Campus Approach & Grounds',
      subtitle: 'Focused perspective along the main approach and surrounding academic wing',
      imageSrc: primarySrc,
      alt: `${college.shortName} approach and grounds`,
      defaultZoom: 1.45,
      initialPanX: 18,
      initialPanY: 0,
    },
    {
      id: `${college.id}-facade`,
      title: 'Central Architectural Facade',
      subtitle: 'High-detail view of the primary landmark structure',
      imageSrc: primarySrc,
      alt: `${college.shortName} central facade`,
      defaultZoom: 1.55,
      initialPanX: -14,
      initialPanY: -4,
    },
  ];
}

export function getCampusVirtualTour(college: CollegeRecord): CampusVirtualTourData | null {
  const idLower = college.id.toLowerCase();
  const matchedMeta = TOUR_METADATA_BY_ID[idLower];

  if (!matchedMeta) {
    return null;
  }

  return {
    ...matchedMeta,
    stops: buildGalleryStops(college),
  };
}
