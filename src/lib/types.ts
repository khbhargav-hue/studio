export type SportType = 'Cricket' | 'Football' | 'Both';

export interface Turf {
  id: string;
  name: string;
  location: string;
  area: string;
  sportTypes: SportType[];
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