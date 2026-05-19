export interface Turf {
  id: string;
  name: string;
  description: string;
  whatsapp: string;
  imageUrl: string;
  isActive: boolean;
  isPremium: boolean;
  area: string;
  address: string;
  city: string;
  sports: string[];
  openTime: string;
  closeTime: string;
  rating: number;
  reviewCount: number;
  price?: string;
  pricePerHour?: number;
  updatedAt?: any;
}

export interface Challenge {
  id: string;
  sport: string;
  date: string;
  time: string;
  turf: string;
  teamName: string;
  status: 'open' | 'accepted' | 'completed';
  playersNeeded?: number;
  createdAt: any;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  area: string;
  members: string[];
  needPlayers: boolean;
  createdAt: any;
}

export interface Coach {
  id: string;
  name: string;
  sport: string;
  area: string;
  rating: number;
  whatsapp: string;
}
