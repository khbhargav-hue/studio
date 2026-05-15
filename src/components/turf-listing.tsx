'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { TurfCard } from './turf-card';
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

  // Firestore Query
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    
    let q = query(collection(db, 'turfs'), orderBy('rating', 'desc'), limit(pageSize));

    if (activeSport !== 'all') {
      q = query(q, where('sports', 'array-contains', activeSport));
    }
    
    if (areaFilter !== 'all') {
      q = query(q, where('area', '==', areaFilter));
    }

    return q;
  }, [db, activeSport, areaFilter, pageSize]);

  const { data: rawTurfs, loading } = useCollection(turfsQuery);

  // Client-side filtering for Search, Price, and Rating (more flexible than Firestore composite indexes)
  const filteredTurfs = useMemo(() => {
    if (!rawTurfs) return [];
    
    return rawTurfs.filter((turf: any) => {
      const matchesSearch = !searchQuery || 
        turf.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        turf.area.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRating = ratingFilter === 'all' || turf.rating >= parseFloat(ratingFilter);
      
      let matchesPrice = true;
      if (priceFilter === 'low') matchesPrice = turf.pricePerHour < 800;
      else if (priceFilter === 'mid') matchesPrice = turf.pricePerHour >= 800 && turf.pricePerHour <= 1200;
      else if (priceFilter === 'high') matchesPrice = turf.pricePerHour > 1200;

      return matchesSearch && matchesRating && matchesPrice;
    });
  }, [rawTurfs, searchQuery, priceFilter, ratingFilter]);

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
          {/* Status Header */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {activeSport === 'all' ? 'All Venues' : `${activeSport} Arenas`}
              <span className="ml-2 text-muted text-sm font-medium">({filteredTurfs.length} found)</span>
            </h2>
          </div>

          {/* Grid */}
          {loading && filteredTurfs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-border rounded-[24px]">
              <div className="text-muted mb-4 text-4xl">🔎</div>
              <h3 className="text-xl font-bold mb-2">No venues match your filters</h3>
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

          {/* Load More */}
          {!loading && rawTurfs && rawTurfs.length >= pageSize && (
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
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="pt-4 border-t border-border flex justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
