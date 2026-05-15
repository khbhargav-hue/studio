
export type SportType = 'Cricket' | 'Football' | 'Pickleball' | 'Badminton';

export interface TurfAmenities {
  parking: boolean;
  changingRooms: boolean;
  showers: boolean;
  drinkingWater: boolean;
  floodlights: boolean;
  firstAid: boolean;
  cafeteria: boolean;
  washrooms: boolean;
  ballProvided: boolean;
  metalStudsOk: boolean;
}

export interface Turf {
  id: string;
  name: string;
  description: string;
  whatsapp: string;
  imageUrl: string;
  images: string[];
  isActive: boolean;
  isPremium: boolean;
  address: string;
  area: string;
  city: string;
  pincode: string;
  googleMapsUrl: string;
  lat: number;
  lng: number;
  sports: string[];
  pitchType: string;
  pitchSizes: string[];
  dimensions: string;
  maxPlayers: number;
  pricePerHour: number;
  peakHourPrice: number;
  peakHoursStart: string;
  slotDuration: number;
  openTime: string;
  closeTime: string;
  openDays: string[];
  checkInMinutes: number;
  amenities: TurfAmenities;
  rating: number;
  reviewCount: number;
  rules: string[];
  createdAt: any;
  updatedAt?: any;
  views?: number;
  whatsappClicks?: number;
  isPopular?: boolean; // Legacy support
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  timestamp: any;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  area: string;
  captain: string;
  whatsapp: string;
  logoUrl?: string;
  members: string[];
  maxPlayers: number;
  description?: string;
  ownerId: string;
  wins?: number;
  losses?: number;
  matchesPlayed?: number;
  isOpen: boolean;
  createdAt: any;
}

export interface Challenge {
  id: string;
  title: string;
  sport: string;
  format: string;
  turf: string;
  date: string;
  time: string;
  notes?: string;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  teamId: string;
  teamName: string;
  entryFee: string;
  ownerId: string;
  createdAt: any;
}

export interface Lead {
  id?: string;
  turfId: string;
  turfName: string;
  area: string;
  sportType: string;
  timestamp: any;
  deviceInfo: string;
}

export interface Pool {
  id: string;
  name: string;
  area: string;
  address: string;
  city: string;
  poolTypes: string[];
  coachingAvailable: boolean;
  womenCoaching?: boolean;
  genderPolicy: string;
  entryFee: number;
  feeType: string;
  openTime: string;
  closeTime: string;
  rating: number;
  reviewCount: number;
  whatsapp: string;
  isActive: boolean;
  imageUrl?: string;
  amenities: {
    parking: boolean;
    changingRooms: boolean;
    lockers: boolean;
  };
}

export interface BrandingSettings {
  heroHeadingWhite: string;
  heroHeadingNeon: string;
  heroDescription: string;
  heroImageUrl: string;
  logoUrl: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  footerEmail: string;
  footerWhatsapp: string;
  copyrightText: string;
  updatedAt?: any;
}
