'use client';

import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useEffect } from "react";

/**
 * FaviconProvider
 * Dynamically injects the branding favicon from Firestore into the document head.
 * Ensures the browser tab icon is persistent and matches the admin's chosen identity.
 */
export function FaviconProvider() {
  const db = useFirestore();
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: branding } = useDoc(brandingRef);

  useEffect(() => {
    const faviconUrl = branding?.faviconUrl;
    if (!faviconUrl) return;

    // Update existing link tags or create a new one
    const links = document.querySelectorAll("link[rel*='icon']");
    
    if (links.length > 0) {
      links.forEach((link: any) => {
        link.href = faviconUrl;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Also handle apple-touch-icon
    const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleLink) {
      appleLink.href = faviconUrl;
    }
  }, [branding?.faviconUrl]);

  return null;
}
