
import { doc, getDoc, setDoc, getDocs, collection, query, limit, serverTimestamp, Firestore, enableNetwork } from "firebase/firestore";

/**
 * Normalizes sport strings to match platform UI filters
 */
const normalizeSports = (sports: string[]) => {
  return sports.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
};

export const mysuuruTurfs = [
  {
    name: "Matchbox Sports Arena — Vijayanagar",
    description: "Mysuru's most popular turf. Football, box cricket, and football coaching. Only turf in Mysuru with a football academy (VFC partnership).",
    area: "Vijayanagar",
    address: "Garudachar Layout, Vijay Nagar 3rd Stage, Mysuru 570017",
    city: "Mysuru",
    sports: ["Football", "Cricket"],
    pitchSizes: ["5-a-side", "7-a-side"],
    pitchType: "Artificial",
    pricePerHour: 900,
    peakHourPrice: 1200,
    peakHoursStart: "18:00",
    openTime: "06:00",
    closeTime: "22:00",
    rating: 4.5,
    reviewCount: 340,
    whatsapp: "917411322492",
    googleMapsUrl: "https://maps.google.com/?q=Matchbox+Mysore+Vijayanagar",
    amenities: { parking: true, floodlights: true, changingRooms: true, drinkingWater: true, firstAid: true, showers: false, cafeteria: false, washrooms: true, ballProvided: true, metalStudsOk: false },
    rules: ["Arrive 15 mins early", "No metal studs", "Max 14 players", "Coaching by appointment only"],
    isActive: true,
    isPremium: true,
  },
  {
    name: "Matchbox Sports Arena — Yadavagiri",
    description: "Second Matchbox location in Yadavagiri. Same quality football turf and box cricket.",
    area: "Yadavagiri",
    address: "Yadavagiri, Mysuru, Karnataka",
    city: "Mysuru",
    sports: ["Football", "Cricket"],
    pitchSizes: ["5-a-side", "7-a-side"],
    pitchType: "Artificial",
    pricePerHour: 900,
    peakHourPrice: 1200,
    peakHoursStart: "18:00",
    openTime: "06:00",
    closeTime: "22:00",
    rating: 4.3,
    reviewCount: 180,
    whatsapp: "917411322492",
    amenities: { parking: true, floodlights: true, drinkingWater: true, changingRooms: false, showers: false, firstAid: true, cafeteria: false, washrooms: true, ballProvided: true, metalStudsOk: false },
    isActive: true,
    isPremium: false,
  },
  {
    name: "Vijayanagar Sports Club",
    description: "Community sports club with football ground and multi-sport facilities.",
    area: "Vijayanagar",
    address: "CA 12, 2nd Stage, Vijayanagar, Mysuru, Karnataka",
    city: "Mysuru",
    sports: ["Football", "Cricket"],
    pitchSizes: ["7-a-side", "11-a-side"],
    pitchType: "Natural",
    pricePerHour: 700,
    peakHourPrice: 1000,
    peakHoursStart: "17:00",
    openTime: "05:30",
    closeTime: "21:00",
    rating: 4.1,
    reviewCount: 95,
    whatsapp: "917411322492",
    amenities: { parking: true, floodlights: true, changingRooms: true, drinkingWater: true, showers: true, firstAid: true, cafeteria: false, washrooms: true, ballProvided: false, metalStudsOk: true },
    isActive: true,
    isPremium: false,
  },
  {
    name: "University Football Ground",
    description: "University of Mysore football ground. Hosts Mysore Premier League and local tournaments.",
    area: "Manasagangothri",
    address: "University of Mysore Campus, Manasagangothri, Mysuru 570006",
    city: "Mysuru",
    sports: ["Football"],
    pitchSizes: ["11-a-side"],
    pitchType: "Natural",
    pricePerHour: 600,
    peakHourPrice: 800,
    peakHoursStart: "16:00",
    openTime: "06:00",
    closeTime: "20:00",
    rating: 4.0,
    reviewCount: 62,
    whatsapp: "917411322492",
    amenities: { parking: true, floodlights: false, changingRooms: false, drinkingWater: true, showers: false, firstAid: false, cafeteria: false, washrooms: false, ballProvided: false, metalStudsOk: true },
    isActive: true,
    isPremium: false,
  },
  {
    name: "Railways Sports Ground Mysuru",
    description: "Famous Railways ground hosting major cricket and football tournaments in Mysuru.",
    area: "Railway Colony",
    address: "Railway Colony, Mysuru, Karnataka",
    city: "Mysuru",
    sports: ["Cricket", "Football"],
    pitchSizes: ["11-a-side"],
    pitchType: "Natural",
    pricePerHour: 500,
    peakHourPrice: 700,
    peakHoursStart: "16:00",
    openTime: "06:00",
    closeTime: "19:00",
    rating: 4.2,
    reviewCount: 120,
    whatsapp: "917411322492",
    amenities: { parking: true, changingRooms: true, floodlights: false, drinkingWater: true, showers: false, firstAid: true, cafeteria: false, washrooms: true, ballProvided: false, metalStudsOk: true },
    isActive: true,
    isPremium: false,
  },
];

export const mysuuruPools = [
  {
    name: "Chamundi Vihar Swimming Pool",
    area: "Saraswathipuram",
    address: "Swimming Pool Rd, opposite JSS Women's College, Kukkarahalli, Saraswathipuram, Mysuru 570005",
    city: "Mysuru",
    poolTypes: ["Olympic", "Public", "Baby"],
    coachingAvailable: true,
    womenCoaching: true,
    genderPolicy: "Mixed (women batches available)",
    entryFee: 80,
    feeType: "session",
    openTime: "06:00",
    closeTime: "20:00",
    rating: 4.4,
    reviewCount: 210,
    whatsapp: "917411322492",
    amenities: { parking: true, changingRooms: true, lockers: true },
    isActive: true,
  },
  {
    name: "JP Nagar Swimming Pool",
    area: "JP Nagar",
    address: "20th Main Rd, near JSS Public School, Dwarasamudra, Block E, JP Nagar, Mysuru 570008",
    city: "Mysuru",
    poolTypes: ["Public"],
    coachingAvailable: true,
    genderPolicy: "Mixed",
    entryFee: 60,
    feeType: "session",
    openTime: "05:30",
    closeTime: "20:30",
    rating: 4.2,
    reviewCount: 88,
    whatsapp: "917411322492",
    amenities: { parking: true, changingRooms: true, lockers: false },
    isActive: true,
  },
  {
    name: "Eco Swimming Pool",
    area: "Brindavan Extension",
    address: "Brindavan Extension 2nd Stage, Mysuru 570020",
    city: "Mysuru",
    poolTypes: ["Public"],
    coachingAvailable: false,
    entryFee: 70,
    feeType: "session",
    openTime: "06:00",
    closeTime: "19:00",
    rating: 4.0,
    reviewCount: 55,
    whatsapp: "917411322492",
    amenities: { lockers: true, changingRooms: true, parking: false },
    isActive: true,
  },
  {
    name: "East-West Swimming Academy",
    area: "Mysuru",
    address: "Mysuru, Karnataka",
    city: "Mysuru",
    poolTypes: ["Academy"],
    coachingAvailable: true,
    genderPolicy: "Mixed",
    entryFee: 1200,
    feeType: "monthly",
    openTime: "06:00",
    closeTime: "19:00",
    rating: 4.6,
    reviewCount: 74,
    whatsapp: "917411322492",
    amenities: { parking: true, changingRooms: true, lockers: true },
    isActive: true,
  },
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
  },
  {
    name: "Coach Sneha Rao",
    sport: "Swimming",
    area: "Saraswathipuram",
    pricePerSession: 400,
    rating: 4.8,
    reviewCount: 32,
    whatsapp: "917411322492",
    isAvailable: true,
    bio: "Specializing in competitive stroke correction."
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
    description: "Mysuru's elite football squad. Training out of Matchbox Vijayanagar."
  },
  {
    name: "Mysuru Mavericks",
    sport: "Cricket",
    area: "Bogadi",
    wins: 8,
    matchesPlayed: 10,
    ownerId: "system",
    isOpen: true,
    members: ["system"],
    maxPlayers: 12,
    description: "Strategic box cricket team focused on regional tournaments."
  }
];

/**
 * Hardened Circuit Seeding Logic
 */
export async function seedCircuitData(db: Firestore) {
  try {
    await enableNetwork(db);
    // Ping collections to verify handshake
    await getDocs(query(collection(db, 'turfs'), limit(1)));
  } catch (err: any) {
    throw new Error(`Circuit Handshake Failed: ${err.message}. Ensure permissions are set correctly.`);
  }

  const safeSeed = async (coll: string, item: any) => {
    const id = item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const docRef = doc(db, coll, id);
    
    try {
      const snap = await getDoc(docRef);
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
      console.warn(`Node deployment failed for [${coll}/${id}]:`, error.message);
      return false;
    }
  };

  try {
    let seededCount = 0;
    
    for (const turf of mysuuruTurfs) if (await safeSeed("turfs", turf)) seededCount++;
    for (const pool of mysuuruPools) if (await safeSeed("pools", pool)) seededCount++;
    for (const coach of seedCoaches) if (await safeSeed("coaches", coach)) seededCount++;
    for (const team of seedTeams) if (await safeSeed("teams", team)) seededCount++;

    const challengeId = "seed-challenge-1";
    const challengeRef = doc(db, "challenges", challengeId);
    try {
      const chalSnap = await getDoc(challengeRef);
      if (!chalSnap.exists()) {
        await setDoc(challengeRef, {
          id: challengeId,
          title: "Vijayanagar Weekend Cup",
          sport: "Football",
          format: "5-a-side",
          turf: "Matchbox Vijayanagar",
          date: "2026-05-15",
          time: "18:00",
          status: "open",
          teamId: "fc-stallions",
          teamName: "FC Stallions",
          entryFee: "200",
          ownerId: "system",
          createdAt: serverTimestamp()
        });
        seededCount++;
      }
    } catch (e) {}

    return seededCount;
  } catch (error: any) {
    throw new Error(`Circuit Transmission Interrupted: ${error.message}`);
  }
}
