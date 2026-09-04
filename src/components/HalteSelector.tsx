import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Train,
  Activity,
  GraduationCap,
  ShoppingBag,
  Home,
  Briefcase,
  Terminal,
  Star,
  Trash2,
  Plus,
  Loader2,
  Sparkles,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { Halte } from '../types';

interface HalteSelectorProps {
  haltes: Halte[];
  selectedHalteId: string;
  onSelectHalte: (halte: Halte) => void;
  onDeleteHalte: (halteId: string) => void;
  onOpenStudio: () => void;
  favorites: string[];
  onToggleFavorite: (halteId: string) => void;
  onAddFoundStop: (stop: { code: string; name: string; type: string }) => void;
}

export const HalteSelector: React.FC<HalteSelectorProps> = ({
  haltes,
  selectedHalteId,
  onSelectHalte,
  onDeleteHalte,
  onOpenStudio,
  favorites,
  onToggleFavorite,
  onAddFoundStop,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveSearchResults, setLiveSearchResults] = useState<
    Array<{ code: string; name: string; type: string; location: string }>
  >([]);
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);

  // Debounced live search across Dutch transit stops
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      setLiveSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const res = await fetch(`/api/ov/search?query=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          // Filter out stops that are already in our local list
          const existingCodes = new Set(haltes.map((h) => h.code));
          const filtered = data.results.filter((s: any) => !existingCodes.has(s.code));
          setLiveSearchResults(filtered);
        }
      } catch (err) {
        console.warn('Live search error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, haltes]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'train':
        return <Train className="w-4 h-4" />;
      case 'activity':
        return <Activity className="w-4 h-4" />;
      case 'graduation-cap':
      case 'school':
        return <GraduationCap className="w-4 h-4" />;
      case 'shopping-bag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'terminal':
        return <Terminal className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredHaltes = haltes.filter((h) => {
    const q = searchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.type.toLowerCase().includes(q) ||
      (h.city && h.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-xl space-y-4">
      {/* Title & Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="text-blue-500 w-3.5 h-3.5" /> Stations & Haltes
        </h2>
        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-semibold">
          {haltes.length} haltes
        </span>
      </div>

      {/* Search Field */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
          {isSearchingLive ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Zoek halte of station..."
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-200 placeholder-slate-500 text-xs transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-300"
          >
            ×
          </button>
        )}
      </div>

      {/* Halte List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {filteredHaltes.length === 0 && liveSearchResults.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            Geen haltes gevonden voor "{searchQuery}".
          </div>
        ) : (
          filteredHaltes.map((halte) => {
            const isActive = halte.id === selectedHalteId;
            const isFav = favorites.includes(halte.id);

            return (
              <div
                key={halte.id}
                onClick={() => onSelectHalte(halte)}
                className={`p-3 rounded-lg border transition-colors flex items-center justify-between cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600/10 border-blue-500/30 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div
                    className={`p-2 rounded-md transition-colors shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/20'
                        : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                    }`}
                  >
                    {getIconComponent(halte.icon)}
                  </div>

                  <div className="truncate">
                    <h4
                      className={`text-sm font-semibold truncate transition-colors ${
                        isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {halte.name}
                    </h4>
                    <span
                      className={`text-xs block truncate font-medium ${
                        isActive ? 'text-blue-400' : 'text-slate-500'
                      }`}
                    >
                      {halte.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {halte.custom && (
                    <span className="text-[8px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                      Sem
                    </span>
                  )}

                  {/* Favorite star */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(halte.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      isFav
                        ? 'text-amber-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={isFav ? 'Verwijder uit favorieten' : 'Markeer als favoriet'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {/* Delete button only for custom stops */}
                  {halte.custom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHalte(halte.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Verwijder deze custom halte"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <ChevronRight
                    className={`w-3.5 h-3.5 text-slate-600 transition-transform ${
                      isActive ? 'text-blue-400 translate-x-0.5' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Live Network Dutch Transit Stop Search Results */}
        {liveSearchResults.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1 mb-1 px-1 font-mono">
              <Globe className="w-3 h-3" /> Live gevonden in NL Netwerk:
            </div>
            {liveSearchResults.map((stop) => (
              <div
                key={stop.code}
                onClick={() => onAddFoundStop(stop)}
                className="p-2.5 bg-slate-950 border border-blue-500/20 hover:border-blue-500/50 rounded-lg flex items-center justify-between text-xs cursor-pointer group transition-colors"
              >
                <div className="truncate">
                  <div className="font-semibold text-slate-200 group-hover:text-blue-400 truncate text-xs">
                    {stop.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {stop.type} — {stop.location}
                  </div>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1 transition-colors shrink-0 ml-2 shadow-sm"
                  title="Voeg halte toe aan je overzicht"
                >
                  <Plus className="w-3 h-3" /> Toevoegen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button: Open Creator Studio */}
      <button
        onClick={onOpenStudio}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded text-xs tracking-wider uppercase shadow-md shadow-blue-900/20 transition-colors flex items-center justify-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>NCS Studio & Creator Mode</span>
      </button>
    </div>
  );
};
