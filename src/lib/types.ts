export type SportType = 'Cricket' | 'Football';
export type CourtType = 'Half Court' | 'Full Court';

export interface Turf {
  id: string;
  name: string;
  location: string;
  area: string;
  sportTypes: SportType[];
  courtTypes: CourtType[];
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  amenities: string[];
  openingHours: string;
  contactNumber: string;
  whatsappNumber: string;
  mapUrl: string;
  isPopular?: boolean;
}
