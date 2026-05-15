'use client';

import { Search, MapPin, IndianRupee, Star, ArrowUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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
    <div className="sticky top-[64px] z-40 w-full bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Sport Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-4 md:px-8 border-b border-white/5">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => onSportChange(sport.id)}
              className={cn(
                "flex-none h-10 px-6 rounded-full label-caps text-[10px] flex items-center gap-2 transition-all border",
                activeSport === sport.id 
                  ? "bg-primary text-black border-primary font-black" 
                  : "bg-surface text-muted border-border hover:border-primary/50"
              )}
            >
              <span>{sport.icon}</span>
              {sport.label}
            </button>
          ))}
        </div>

        {/* Search and Dropdowns Bar */}
        <div className="p-4 md:px-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input 
              placeholder="Search by name or area..." 
              className="bg-surface border-border h-12 pl-12 rounded-[10px] focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <Select value={areaFilter} onValueChange={onAreaChange}>
              <SelectTrigger className="h-12 bg-surface border-border rounded-[10px] min-w-[120px] text-[11px] font-bold uppercase tracking-widest">
                <MapPin className="h-3 w-3 mr-2 text-primary" />
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="Vijayanagar">Vijayanagar</SelectItem>
                <SelectItem value="Bogadi">Bogadi</SelectItem>
                <SelectItem value="JP Nagar">JP Nagar</SelectItem>
                <SelectItem value="Kuvempunagar">Kuvempunagar</SelectItem>
                <SelectItem value="Yadavagiri">Yadavagiri</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={onPriceChange}>
              <SelectTrigger className="h-12 bg-surface border-border rounded-[10px] min-w-[120px] text-[11px] font-bold uppercase tracking-widest">
                <IndianRupee className="h-3 w-3 mr-2 text-primary" />
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under ₹800</SelectItem>
                <SelectItem value="mid">₹800 - ₹1200</SelectItem>
                <SelectItem value="high">Above ₹1200</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={onRatingChange}>
              <SelectTrigger className="h-12 bg-surface border-border rounded-[10px] min-w-[120px] text-[11px] font-bold uppercase tracking-widest">
                <Star className="h-3 w-3 mr-2 text-primary" />
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4">4.0+ Star</SelectItem>
                <SelectItem value="4.5">4.5+ Star</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="popular">
              <SelectTrigger className="h-12 bg-surface border-border rounded-[10px] min-w-[120px] text-[11px] font-bold uppercase tracking-widest">
                <ArrowUpDown className="h-3 w-3 mr-2 text-primary" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="popular">Popularity</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low-High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="px-4 md:px-8 pb-4 flex items-center flex-wrap gap-2">
            {activeSport !== 'all' && (
              <FilterChip label={activeSport} onRemove={() => onSportChange('all')} />
            )}
            {areaFilter !== 'all' && (
              <FilterChip label={areaFilter} onRemove={() => onAreaChange('all')} />
            )}
            {priceFilter !== 'all' && (
              <FilterChip label={`Price: ${priceFilter}`} onRemove={() => onPriceChange('all')} />
            )}
            {ratingFilter !== 'all' && (
              <FilterChip label={`Rating: ${ratingFilter}+`} onRemove={() => onRatingChange('all')} />
            )}
            <button 
              onClick={onClearAll}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string, onRemove: () => void }) {
  return (
    <div className="h-8 pl-4 pr-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{label}</span>
      <button 
        onClick={onRemove}
        className="h-5 w-5 rounded-md hover:bg-primary/20 flex items-center justify-center transition-colors"
      >
        <X className="h-3 w-3 text-primary" />
      </button>
    </div>
  );
}
