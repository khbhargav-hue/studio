'use client';

import { Search, MapPin, IndianRupee, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const SPORTS = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'Football', label: 'Football', icon: '⚽' },
  { id: 'Cricket', label: 'Cricket', icon: '🏏' },
  { id: 'Pickleball', label: 'Pickleball', icon: '🎾' },
  { id: 'Swimming', label: 'Swimming', icon: '🏊' },
  { id: 'Coaching', label: 'Coaching', icon: '🎯' },
  { id: 'Badminton', label: 'Badminton', icon: '🏸' },
];

interface FilterSystemProps {
  activeSport: string;
  onSportChange: (sport: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  areaFilter: string;
  onAreaChange: (area: string) => void;
  priceFilter: string;
  onPriceChange: (price: string) => void;
  ratingFilter: string;
  onRatingChange: (rating: string) => void;
  onClearAll: () => void;
}

export function FilterSystem({
  activeSport,
  onSportChange,
  searchQuery,
  onSearchChange,
  areaFilter,
  onAreaChange,
  priceFilter,
  onPriceChange,
  ratingFilter,
  onRatingChange,
  onClearAll
}: FilterSystemProps) {
  const activeFilterCount = (activeSport !== 'all' ? 1 : 0) + 
                            (searchQuery ? 1 : 0) + 
                            (areaFilter !== 'all' ? 1 : 0) + 
                            (priceFilter !== 'all' ? 1 : 0) + 
                            (ratingFilter !== 'all' ? 1 : 0);

  return (
    <div className="sticky top-[64px] z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222]">
      <div className="max-w-7xl mx-auto">
        {/* 1. Sport Category Tabs - Touch Friendly */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar p-4 md:px-8 border-b border-white/5 scroll-smooth">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => onSportChange(sport.id)}
              className={cn(
                "flex-none h-11 px-6 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                activeSport === sport.id 
                  ? "bg-[#AAFF00] text-black border border-[#AAFF00]" 
                  : "bg-[#1A1A1A] text-[#888] border border-[#222] hover:border-[#AAFF00]/50"
              )}
            >
              <span className="text-[14px]">{sport.icon}</span>
              {sport.label}
            </button>
          ))}
        </div>

        {/* 2. Filter Bar - High Density */}
        <div className="p-4 md:px-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444]" />
            <Input 
              placeholder="Search arena or area..." 
              className="bg-[#1A1A1A] border-[#222] h-12 pl-12 rounded-[10px] focus-visible:ring-1 focus-visible:ring-[#AAFF00] text-[14px]"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <Select value={areaFilter} onValueChange={onAreaChange}>
              <SelectTrigger className="h-12 bg-[#1A1A1A] border-[#222] rounded-[10px] min-w-[120px] text-[11px] font-black uppercase tracking-widest shrink-0 transition-all active:scale-95">
                <MapPin className="h-3.5 w-3.5 mr-2 text-primary" />
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-[#222] rounded-[16px]">
                <SelectItem value="all" className="text-[11px] font-black uppercase">All Areas</SelectItem>
                <SelectItem value="Vijayanagar" className="text-[11px] font-black uppercase">Vijayanagar</SelectItem>
                <SelectItem value="Bogadi" className="text-[11px] font-black uppercase">Bogadi</SelectItem>
                <SelectItem value="JP Nagar" className="text-[11px] font-black uppercase">JP Nagar</SelectItem>
                <SelectItem value="Kuvempunagar" className="text-[11px] font-black uppercase">Kuvempunagar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={onPriceChange}>
              <SelectTrigger className="h-12 bg-[#1A1A1A] border-[#222] rounded-[10px] min-w-[120px] text-[11px] font-black uppercase tracking-widest shrink-0 transition-all active:scale-95">
                <IndianRupee className="h-3.5 w-3.5 mr-2 text-primary" />
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-[#222] rounded-[16px]">
                <SelectItem value="all" className="text-[11px] font-black uppercase">Any Budget</SelectItem>
                <SelectItem value="low" className="text-[11px] font-black uppercase">Below ₹800</SelectItem>
                <SelectItem value="mid" className="text-[11px] font-black uppercase">₹800 — ₹1200</SelectItem>
                <SelectItem value="high" className="text-[11px] font-black uppercase">Above ₹1200</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={onRatingChange}>
              <SelectTrigger className="h-12 bg-[#1A1A1A] border-[#222] rounded-[10px] min-w-[120px] text-[11px] font-black uppercase tracking-widest shrink-0 transition-all active:scale-95">
                <Star className="h-3.5 w-3.5 mr-2 text-primary" />
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-[#222] rounded-[16px]">
                <SelectItem value="all" className="text-[11px] font-black uppercase">Any Rating</SelectItem>
                <SelectItem value="4" className="text-[11px] font-black uppercase">4.0+ Stars</SelectItem>
                <SelectItem value="4.5" className="text-[11px] font-black uppercase">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. Active Chips */}
        {activeFilterCount > 0 && (
          <div className="px-4 md:px-8 pb-4 flex items-center flex-wrap gap-2 animate-in fade-in zoom-in-95 duration-200">
            {activeSport !== 'all' && (
              <FilterChip label={activeSport} onRemove={() => onSportChange('all')} />
            )}
            {areaFilter !== 'all' && (
              <FilterChip label={areaFilter} onRemove={() => onAreaChange('all')} />
            )}
            {priceFilter !== 'all' && (
              <FilterChip label={`Budget: ${priceFilter}`} onRemove={() => onPriceChange('all')} />
            )}
            {ratingFilter !== 'all' && (
              <FilterChip label={`★ ${ratingFilter}+`} onRemove={() => onRatingChange('all')} />
            )}
            <button 
              onClick={onClearAll}
              className="h-10 px-3 text-[10px] font-black uppercase tracking-widest text-[#AAFF00] hover:underline transition-all"
            >
              Reset Circuit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string, onRemove: () => void }) {
  return (
    <div className="h-9 pl-4 pr-1 rounded-lg bg-[#AAFF00]/10 border border-[#AAFF00]/20 flex items-center gap-1 transition-all active:scale-95">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#AAFF00] italic">{label}</span>
      <button 
        onClick={onRemove}
        className="h-7 w-7 rounded-md hover:bg-[#AAFF00]/20 flex items-center justify-center transition-colors"
      >
        <X className="h-3.5 w-3.5 text-[#AAFF00]" />
      </button>
    </div>
  );
}
