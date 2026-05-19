'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';
import { TurfCard } from './turf-card';
import { ListingAdCard } from './ads/listing-ad-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSystem } from './filter-system';
import { Zap, WifiOff, Database } from 'lucide-react';
import { firebaseConfig } from '@/firebase/config';

const CACHE_KEY = 'turfista_circuit_cache';

export function TurfListing() {
  const db = useFirestore();
  
  // States
  const [activeSport, setActiveSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [pageSize, setPageSize] = useState(24);
  const [displayTurfs, setDisplayTurfs] = useState<any[]>([]);
  const [isUsingCache, setIsUsingCache] = useState(false);

  // Broad Discovery Query
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'turfs'), limit(pageSize));
  }, [db, pageSize]);

  const adsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "ads"), 
      where('placement', '==', 'listing_card'), 
      where('isActive', '==', true),
      limit(5)
    );
  }, [db]);

  const { data: rawTurfs, loading: loadingTurfs, error } = useCollection(turfsQuery);
  const { data: ads } = useCollection(adsQuery);

  // Persistent Cache & Diagnostic Logic
  useEffect(() => {
    console.log(`[CIRCUIT NODE] Project: ${firebaseConfig.projectId}`);
    
    if (rawTurfs && rawTurfs.length > 0) {
      console.log(`[CIRCUIT SYNC] Success: ${rawTurfs.length} nodes active`);
      setDisplayTurfs(rawTurfs);
      localStorage.setItem(CACHE_KEY, JSON.stringify(rawTurfs));
      setIsUsingCache(false);
    } else if (error || (!loadingTurfs && (!rawTurfs || rawTurfs.length === 0))) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        console.warn("[CIRCUIT OFFLINE] Falling back to local cache");
        setDisplayTurfs(JSON.parse(cached));
        setIsUsingCache(true);
      }
    }
  }, [rawTurfs, loadingTurfs, error]);

  // Client-side filtering for discovery resilience
  const filteredTurfs = useMemo(() => {
    if (!displayTurfs) return [];
    
    return displayTurfs.filter((turf: any) => {
      const matchesSport = activeSport === 'all' || 
        (turf.sports && Array.isArray(turf.sports) && turf.sports.includes(activeSport));

      const matchesSearch = !searchQuery || 
        (turf.name && turf.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (turf.area && turf.area.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesArea = areaFilter === 'all' || turf.area === areaFilter;

      const matchesRating = ratingFilter === 'all' || (turf.rating && turf.rating >= parseFloat(ratingFilter));
      
      let matchesPrice = true;
      if (priceFilter === 'low') matchesPrice = turf.pricePerHour < 800;
      else if (priceFilter === 'mid') matchesPrice = turf.pricePerHour >= 800 && turf.pricePerHour <= 1200;
      else if (priceFilter === 'high') matchesPrice = turf.pricePerHour > 1200;

      return matchesSport && matchesSearch && matchesArea && matchesRating && matchesPrice;
    });
  }, [displayTurfs, activeSport, searchQuery, areaFilter, priceFilter, ratingFilter]);

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

      {isUsingCache && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic">
            Network Unstable — Showing Cached Arena Intel
          </span>
        </div>
      )}

      <section className="flex-1 py-12 px-4 md:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {activeSport === 'all' ? 'Mysuru Network' : `${activeSport} Arenas`}
              <span className="ml-2 text-muted text-sm font-medium">({filteredTurfs.length} verified)</span>
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
              <Zap className="h-12 w-12 text-muted mx-auto mb-6 opacity-20" />
              <h3 className="text-xl font-black uppercase italic mb-2">No nodes found</h3>
              <p className="text-muted text-sm max-w-xs mx-auto italic">Broaden your discovery parameters or clear the circuit filters.</p>
              <Button 
                variant="outline" 
                onClick={handleClearAll} 
                className="mt-6 uppercase font-black text-[11px] tracking-widest h-11"
              >
                Reset Search
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