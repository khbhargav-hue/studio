/**
 * Hardened Circuit Registry
 * Provides foundational data for the Mysuru sporting network.
 */

export const mysuuruTurfs = [
  { 
    name: "Matchbox Sports Arena", 
    area: "Vijayanagar",
    city: "Mysuru", 
    sports: ["Football", "Cricket"],
    pitchSizes: ["5-a-side", "7-a-side"],
    pricePerHour: 900, 
    price: "₹900/hr",
    rating: 4.5, 
    reviewCount: 340, 
    isActive: true, 
    isPremium: true,
    whatsapp: "919880123456",
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
    openTime: "06:00", 
    closeTime: "22:00",
    amenities: { parking: true, floodlights: true, changingRooms: true }
  },
  { 
    name: "Vijayanagar Sports Club", 
    area: "Vijayanagar",
    city: "Mysuru", 
    sports: ["Football"],
    pitchSizes: ["7-a-side", "11-a-side"],
    pricePerHour: 700, 
    price: "₹700/hr",
    rating: 4.1, 
    reviewCount: 95, 
    isActive: true, 
    isPremium: false,
    whatsapp: "919880123457",
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    openTime: "05:30", 
    closeTime: "21:00",
    amenities: { parking: true, floodlights: true }
  },
  { 
    name: "Railways Sports Ground", 
    area: "Railway Colony",
    city: "Mysuru", 
    sports: ["Cricket", "Football"],
    pitchSizes: ["11-a-side"],
    pricePerHour: 500, 
    price: "₹500/hr",
    rating: 4.2, 
    reviewCount: 120, 
    isActive: true, 
    isPremium: false,
    whatsapp: "919880123458",
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    openTime: "06:00", 
    closeTime: "19:00",
    amenities: { parking: true, changingRooms: true }
  },
  { 
    name: "University Football Ground", 
    area: "Manasagangothri",
    city: "Mysuru", 
    sports: ["Football"],
    pitchSizes: ["11-a-side"],
    pricePerHour: 600, 
    price: "₹600/hr",
    rating: 4.0, 
    reviewCount: 62, 
    isActive: true, 
    isPremium: false,
    whatsapp: "919880123459",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    openTime: "06:00", 
    closeTime: "20:00",
    amenities: { parking: true }
  }
];

export async function seedCircuitData() {
  console.log("[CIRCUIT LOCK] Auto-seeding disabled. Use manual trigger in Studio.");
  return 0;
}
