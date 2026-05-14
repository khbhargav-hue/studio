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
}