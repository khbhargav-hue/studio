
export type SportType = 'Cricket' | 'Football' | 'Pickleball' | 'Badminton';

export interface Turf {
  id: string;
  name: string;
  location: string;
  area: string;
  sportTypes: SportType[];
  courtTypes: string[];
  pricePerHour: number;
  courtPricing?: Record<string, number>;
  rating: number;
  reviewCount: number;
  mainImage: string;
  galleryImages: string[];
  description: string;
  amenities: string[];
  coachingServices: string[];
  openingHours: string;
  contactNumber: string;
  whatsappNumber: string;
  mapUrl: string;
  isPopular?: boolean;
  views?: number;
  whatsappClicks?: number;
}

export interface Team {
  id: string;
  teamName: string;
  sport: string;
  area: string;
  captain: string;
  whatsapp: string;
  logoUrl?: string;
  players: string[];
  turfPreference?: string;
  ownerId: string;
  createdAt: any;
}

export interface Challenge {
  id: string;
  teamId: string;
  teamName: string;
  sport: string;
  turf: string;
  date: string;
  time: string;
  notes?: string;
  status: 'open' | 'accepted' | 'completed';
  area: string;
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
  customerName?: string;
  customerPhone?: string;
}
