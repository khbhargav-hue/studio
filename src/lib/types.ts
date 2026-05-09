
export type SportType = 'Cricket' | 'Football' | 'Pickleball';

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
