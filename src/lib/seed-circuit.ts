
import { 
  doc, 
  setDoc, 
  getDocFromServer, 
  collection, 
  serverTimestamp, 
  Firestore, 
  enableNetwork 
} from "firebase/firestore";

/**
 * Normalizes sport strings to match platform UI filters
 */
const normalizeSports = (sports: string[]) => {
  return sports.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
};

export const mysuuruTurfs = [
  {
    name: "Matchbox Sports Arena",
    area: "Vijayanagar",
    city: "Mysuru",
    sports: ["Football", "Cricket"],
    pricePerHour: 900,
    peakHourPrice: 1200,
    rating: 4.5,
    reviewCount: 340,
    isActive: true,
    isPremium: true,
    openTime: "06:00",
    closeTime: "22:00",
    whatsapp: "919876543210",
    pitchSizes: ["5-a-side", "7-a-side"],
    pitchType: "Artificial",
    amenities: { parking: true, floodlights: true, changingRooms: true, drinkingWater: true, firstAid: true },
    imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=75",
    description: "Mysuru's most popular turf. Football, box cricket, and coaching academy. Only turf with VFC partnership.",
    rules: ["Arrive 15 mins early", "No metal studs", "Max 14 players"]
  },
  {
    name: "Vijayanagar Sports Club",
    area: "Vijayanagar",
    city: "Mysuru",
    sports: ["Football"],
    pricePerHour: 700,
    peakHourPrice: 1000,
    rating: 4.1,
    reviewCount: 95,
    isActive: true,
    isPremium: false,
    openTime: "05:30",
    closeTime: "21:00",
    whatsapp: "919876543211",
    pitchSizes: ["7-a-side"],
    pitchType: "Natural",
    amenities: { parking: true, floodlights: true, changingRooms: true },
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=75",
    description: "Community sports club with professional football ground and multi-sport facilities."
  },
  {
    name: "Railways Sports Ground",
    area: "Railway Colony",
    city: "Mysuru",
    sports: ["Cricket", "Football"],
    pricePerHour: 500,
    peakHourPrice: 700,
    rating: 4.2,
    reviewCount: 120,
    isActive: true,
    isPremium: false,
    openTime: "06:00",
    closeTime: "19:00",
    whatsapp: "919876543212",
    pitchSizes: ["11-a-side"],
    pitchType: "Natural",
    amenities: { parking: true, changingRooms: true, floodlights: false },
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=75",
    description: "Famous Railways ground hosting major local cricket and football tournaments."
  }
];

export const mysuuruPools = [
  {
    name: "Chamundi Vihar Swimming Pool",
    area: "Saraswathipuram",
    address: "Swimming Pool Rd, opposite JSS Women's College, Kukkarahalli, Saraswathipuram, Mysuru 570005",
    city: "Mysuru",
    poolTypes: ["Olympic", "Public", "Baby"],
    coachingAvailable: true,
    genderPolicy: "Mixed",
    entryFee: 80,
    feeType: "session",
    openTime: "06:00",
    closeTime: "20:00",
    rating: 4.4,
    reviewCount: 210,
    whatsapp: "917411322492",
    amenities: { parking: true, changingRooms: true, lockers: true },
    isActive: true,
  }
];

export const seedCoaches = [
  {
    name: "Coach Rahul Kumar",
    sport: "Football",
    area: "Vijayanagar",
    pricePerSession: 500,
    rating: 4.9,
    reviewCount: 45,
    whatsapp: "917411322492",
    isAvailable: true,
    bio: "AIFF certified coach with 10 years experience."
  }
];

export const seedTeams = [
  {
    name: "FC Stallions",
    sport: "Football",
    area: "Vijayanagar",
    wins: 12,
    matchesPlayed: 15,
    ownerId: "system",
    isOpen: true,
    members: ["system"],
    maxPlayers: 14,
    description: "Mysuru's elite football squad."
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hardened Circuit Seeding Logic
 * Uses getDocFromServer to bypass local cache and fix false offline states.
 * Includes a retry mechanism (3 attempts, 2 sec delay).
 */
export async function seedCircuitData(db: Firestore, attempts = 3) {
  try {
    await enableNetwork(db);
  } catch (err: any) {
    console.warn("Handshake delay, proceeding anyway...");
  }

  const safeSeed = async (coll: string, item: any) => {
    const id = item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const docRef = doc(db, coll, id);
    
    // Attempt to read directly from the server to bypass "false offline" cache issues
    try {
      const snap = await getDocFromServer(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          ...item,
          id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...(coll === 'turfs' ? { views: 0, whatsappClicks: 0 } : {})
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error(`[CIRCUIT ERROR] Node deployment failed for [${coll}/${id}]:`, error.message);
      throw error; // Re-throw to trigger retry at parent level
    }
  };

  try {
    let seededCount = 0;
    const dataGroups = [
      { coll: "turfs", items: mysuuruTurfs },
      { coll: "pools", items: mysuuruPools },
      { coll: "coaches", items: seedCoaches },
      { coll: "teams", items: seedTeams }
    ];

    for (const group of dataGroups) {
      for (const item of group.items) {
        if (await safeSeed(group.coll, item)) {
          seededCount++;
        }
      }
    }
    return seededCount;
  } catch (error: any) {
    if (attempts > 1) {
      console.log(`[CIRCUIT RETRY] Connection weak. Retrying in 2s... (${attempts - 1} left)`);
      await delay(2000);
      return seedCircuitData(db, attempts - 1);
    }
    throw new Error(`Circuit Transmission Interrupted: ${error.message}. Check your proxy settings.`);
  }
}
