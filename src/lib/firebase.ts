import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Unified Firebase Identity Node
 * Centralized configuration for the Turfista Mysuru Network.
 * Resolved duplicate declaration syntax error.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD7J3fG4GXUehnNyGRZ_a2ZeFU4cBnSAIQ",
  authDomain: "turfista-2df8a.firebaseapp.com",
  projectId: "turfista-2df8a",
  storageBucket: "turfista-2df8a.firebasestorage.app",
  messagingSenderId: "856386775528",
  appId: "1:856386775528:web:4648f5cb807a2478d91c5d",
  measurementId: "G-L5BWMVF3X2"
};

const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
