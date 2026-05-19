'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { TurfCard } from './turf-card';
import { ListingAdCard } from './ads/listing-ad-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSystem } from './filter-system';
import { Zap } from 'lucide-react';

export function TurfListing() {
  const db = useFirestore();
  
  // States
  const [activeSport, setActiveSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [pageSize, setPageSize] = useState(12);

  // Firestore Queries - Broadened to ensure visibility
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'turfs'), 
      limit(pageSize)
    );
  }, [db, pageSize]);

  const adsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'ads'), 
      where('placement', '==', 'listing_card'), 
      where('isActive', '==', true),
      limit(5)
    );
  }, [db]);

  const { data: rawTurfs, loading: loadingTurfs } = useCollection(turfsQuery);
  const { data: ads } = useCollection(adsQuery);

  // Diagnostic Logs
  useEffect(() => {
    if (rawTurfs) {
      console.log("FETCH_SUCCESS", rawTurfs.length);
      console.log(rawTurfs);
    }
  }, [rawTurfs]);

  // Audit Fetch for Console Debugging
  useEffect(() => {
    async function runAudit() {
      if (!db) return;
      console.log("FETCH_START");
      try {
        const snapshot = await getDocs(collection(db, "turfs"));
        console.log("FETCH_SUCCESS audit", snapshot.docs.length);
        const mapped = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Audit data:", mapped);
      } catch (err) {
        console.error("FETCH_ERROR", err);
      }
    }
    runAudit();
  }, [db]);

  // Client-side filtering to prevent empty states from restrictive queries
  const filteredTurfs = useMemo(() => {
    if (!rawTurfs) return [];
    
    return rawTurfs.filter((turf: any) => {
      // 1. Sport filter
      const matchesSport = activeSport === 'all' || 
        (turf.sports && Array.isArray(turf.sports) && turf.sports.includes(activeSport));

      // 2. Search query (name or area)
      const matchesSearch = !searchQuery || 
        (turf.name && turf.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (turf.area && turf.area.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // 3. Area filter
      const matchesArea = areaFilter === 'all' || turf.area === areaFilter;

      // 4. Rating filter
      const matchesRating = ratingFilter === 'all' || (turf.rating && turf.rating >= parseFloat(ratingFilter));
      
      // 5. Price filter
      let matchesPrice = true;
      if (priceFilter === 'low') matchesPrice = turf.pricePerHour < 800;
      else if (priceFilter === 'mid') matchesPrice = turf.pricePerHour >= 800 && turf.pricePerHour <= 1200;
      else if (priceFilter === 'high') matchesPrice = turf.pricePerHour > 1200;

      return matchesSport && matchesSearch && matchesArea && matchesRating && matchesPrice;
    });
  }, [rawTurfs, activeSport, searchQuery, areaFilter, priceFilter, ratingFilter]);

  // Interleave ads every 6th card
  const itemsWithAds = useMemo(() => {
    const result = [];
    const availableAds = [...(ads || [])];
    
    filteredTurfs.forEach((turf, index) => {
      result.push({ type: 'turf', data: turf });
      if ((index + 1) % 6 === 0 && availableAds.length > 0) {
        result.push({ type: 'ad', data: availableAds.shift() });
      }
    });
    
    return result;
  }, [filteredTurfs, ads]);

  const handleClearAll = () => {
    setActiveSport('all');
    setSearchQuery('');
    setAreaFilter('all');
    setPriceFilter('all');
    setRatingFilter('all');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <FilterSystem 
        activeSport={activeSport}
        onSportChange={setActiveSport}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        areaFilter={areaFilter}
        onAreaChange={setAreaFilter}
        priceFilter={priceFilter}
        onPriceChange={setPriceFilter}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
        onClearAll={handleClearAll}
      />

      <section className="flex-1 py-12 px-4 md:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {activeSport === 'all' ? 'All Venues' : `${activeSport} Arenas`}
              <span className="ml-2 text-muted text-sm font-medium">({filteredTurfs.length} found)</span>
            </h2>
          </div>

          {loadingTurfs && filteredTurfs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : itemsWithAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsWithAds.map((item, idx) => (
                item.type === 'turf' ? (
                  <TurfCard key={item.data.id} turf={item.data as any} />
                ) : (
                  <ListingAdCard key={item.data.id} ad={item.data as any} />
                )
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-border rounded-[24px]">
              <div className="text-muted mb-4 text-4xl">🔎</div>
              <h3 className="text-xl font-bold mb-2">No turfs yet</h3>
              <p className="text-muted text-sm max-w-xs mx-auto">Try broadening your search or clear all filters to see all Mysuru turfs.</p>
              <Button 
                variant="outline" 
                onClick={handleClearAll} 
                className="mt-6 uppercase font-black text-[11px] tracking-widest h-11"
              >
                Clear all filters
              </Button>
            </div>
          )}

          {!loadingTurfs && rawTurfs && rawTurfs.length >= pageSize && (
            <div className="mt-16 flex justify-center">
              <Button 
                onClick={() => setPageSize(prev => prev + 12)}
                className="bg-primary text-black font-black uppercase text-[12px] tracking-[0.2em] px-12 h-14 rounded-[10px] shadow-2xl hover:scale-105 transition-transform"
              >
                Load More Venues
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-[16px] overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}