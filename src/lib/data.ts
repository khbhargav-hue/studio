import { Turf } from './types';

export const MOCK_TURFS: Turf[] = [
  {
    id: 'kubers-turf',
    name: "Kuber's Turf",
    location: 'Sahukar Chennaiah Road, TK Layout, Kuvempunagar, Mysuru, Karnataka 570009',
    area: 'Kuvempunagar',
    sportTypes: ['Football', 'Cricket'],
    courtTypes: ['Box Cricket', '5-a-side Football'],
    pricePerHour: 1000,
    courtPricing: {
      "Box Cricket": 1000,
      "5-a-side Football": 1200
    },
    rating: 4.8,
    reviewCount: 450,
    mainImage: 'https://picsum.photos/seed/kuber1/1200/800',
    galleryImages: [
      'https://picsum.photos/seed/kuber2/1200/800',
      'https://picsum.photos/seed/kuber3/1200/800'
    ],
    description: "Kuber's Turf is a premier sports destination in Kuvempunagar, Mysuru. Featuring high-quality synthetic grass optimized for both football and box cricket. Our arena is equipped with professional floodlights for late-night matches and a comfortable spectator gallery.",
    amenities: ['Floodlights', 'Drinking Water', 'Parking', 'Washroom', 'Spectator Gallery'],
    coachingServices: ['Junior Football Academy'],
    openingHours: 'Open 24 Hours',
    contactNumber: '+91 7795797627',
    whatsappNumber: '917795797627',
    mapUrl: 'https://maps.google.com/?q=Kuber+Turf+Kuvempunagar+Mysuru',
    isPopular: true,
    views: 3420,
    whatsappClicks: 215
  },
  {
    id: 'perfect-x-arena',
    name: 'Perfect X Arena',
    location: 'Bogadi 2nd Stage North, Near Ring Road, Mysuru, Karnataka 570026',
    area: 'Bogadi',
    sportTypes: ['Football', 'Cricket'],
    courtTypes: ['7-a-side Football', 'Net Cricket'],
    pricePerHour: 1400,
    courtPricing: {
      "7-a-side Football": 2600,
      "Net Cricket": 800
    },
    rating: 5.0,
    reviewCount: 128,
    mainImage: 'https://picsum.photos/seed/perfect1/1200/800',
    galleryImages: [
      'https://picsum.photos/seed/perfect2/1200/800',
      'https://picsum.photos/seed/perfect3/1200/800'
    ],
    description: 'Perfect X Arena brings an international sporting feel to Bogadi, Mysuru. Known for its expansive 7-a-side football pitch and dedicated cricket practice nets. The arena features shock-absorbent turf and professional-grade LED lighting for elite match play.',
    amenities: ['Elite LED Lights', 'Tournament Hosting', 'First Aid', 'Ample Parking', 'Dressing Room'],
    coachingServices: ['Professional Cricket Nets'],
    openingHours: '05:00 AM - 12:00 AM',
    contactNumber: '+91 9686299909',
    whatsappNumber: '919686299909',
    mapUrl: 'https://maps.google.com/?q=Perfect+X+Arena+Bogadi+Mysuru',
    isPopular: true,
    views: 2850,
    whatsappClicks: 184
  },
  {
    id: 'matchbox-mysuru',
    name: "Matchbox",
    location: 'Vijaynagar 3rd Stage, Near Garudachar Layout, Mysuru, Karnataka',
    area: 'Vijaynagar',
    sportTypes: ['Football', 'Pickleball', 'Cricket'],
    courtTypes: ['Pickleball Court', 'Box Cricket'],
    pricePerHour: 1200,
    courtPricing: {
      "Pickleball Court": 600,
      "Box Cricket": 1200
    },
    rating: 4.7,
    reviewCount: 890,
    mainImage: 'https://picsum.photos/seed/matchbox1/1200/800',
    galleryImages: [
      'https://picsum.photos/seed/matchbox2/1200/800'
    ],
    description: "Matchbox in Vijaynagar is the ultimate hybrid sports park. Offering Mysuru's first professional Pickleball courts along with high-intensity box cricket and football arenas. Perfect for weekend tournaments and corporate team outings.",
    amenities: ['Pickleball Courts', 'Cafeteria', 'Floodlights', 'Music System'],
    coachingServices: ['Pickleball Training'],
    openingHours: 'Open 24 Hours',
    contactNumber: '+91 8431452323',
    whatsappNumber: '918431452323',
    mapUrl: 'https://maps.google.com/?q=Matchbox+Vijaynagar+Mysuru',
    isPopular: true,
    views: 4100,
    whatsappClicks: 320
  }
];
