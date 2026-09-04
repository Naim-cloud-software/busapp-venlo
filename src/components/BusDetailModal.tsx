import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  MapPin,
  Volume2,
  CheckCircle2,
  Radio,
  Search,
  ArrowRight,
  Filter,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Departure, StopCall } from '../types';
import { playTransitChime } from '../utils/audio';
import { generateScheduleForLine } from '../utils/routeCatalog';

interface BusDetailModalProps {
  bus: Departure | null;
  currentHalteName?: string;
  onClose: () => void;
}

export const BusDetailModal: React.FC<BusDetailModalProps> = ({
  bus,
  currentHalteName,
  onClose,
}) => {
  const [stops, setStops] = useState<StopCall[]>([]);
  const [isLoadingLiveStops, setIsLoadingLiveStops] = useState<boolean>(false);
  const [stopFilter, setStopFilter] = useState<'all' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!bus) return;

    // 1. Initial stops from bus object or generate from official catalog
    let initialStops: StopCall[] = [];
    if (bus.stops && bus.stops.length > 0) {
      initialStops = bus.stops;
    } else {
      initialStops = generateScheduleForLine(
        bus.line,
        bus.destination,
        bus.time,
        bus.delay,
        currentHalteName
      );
    }
    setStops(initialStops);

    // 2. If this departure has a drgl live journeyPath, fetch real-time calls
    if (bus.journeyPath) {
      setIsLoadingLiveStops(true);
      fetch(`/api/ov/journey?path=${encodeURIComponent(bus.journeyPath)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && Array.isArray(data.stops) && data.stops.length > 0) {
            setStops(data.stops);
          }
        })
        .catch((err) => {
          console.warn('Kon realtime haltes niet ophalen:', err);
        })
        .finally(() => {
          setIsLoadingLiveStops(false);
        });
    }
  }, [bus, currentHalteName]);

  if (!bus) return null;

  const handleSound = () => {
    playTransitChime();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Bus Lijn ${bus.line} naar ${bus.destination} om ${bus.time} vanaf ${currentHalteName || 'Venlo'}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Filtered stops
  const displayedStops = stops.filter((s) => {
    if (stopFilter === 'upcoming' && s.isPassed) return false;
    if (searchQuery.trim()) {
      return s.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const passedCount = stops.filter((s) => s.isPassed).length;
  const remainingCount = stops.length - passedCount;

  // Calculate estimated total journey duration
  let totalDurationMinutes: number | null = null;
  if (stops.length >= 2) {
    try {
      const firstTime = stops[0].time;
      const lastTime = stops[stops.length - 1].time;
      if (firstTime.includes(':') && lastTime.includes(':')) {
        const [h1, m1] = firstTime.split(':').map(Number);
        const [h2, m2] = lastTime.split(':').map(Number);
        let diff = h2 * 60 + m2 - (h1 * 60 + m1);
        if (diff < 0) diff += 24 * 60;
        totalDurationMinutes = diff;
      }
    } catch {
      totalDurationMinutes = null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="bg-blue-600 text-white text-base font-bold px-3 py-1.5 rounded-lg shadow-md shadow-blue-900/30">
                {bus.line}
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-100 leading-tight">
                  {bus.destination}
                </h3>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                  <span>{bus.operator || 'Arriva Limburg'}</span>
                  <span>•</span>
                  <span>{bus.type === 'stads' ? 'Stadsdienst' : bus.type === 'express' ? 'Sneldienst' : 'Streeklijn'}</span>
                  {bus.platform && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400 font-semibold">{bus.platform}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Deel reisinformatie"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSound}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Speel stationsbel af"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {copiedLink && (
            <div className="mt-2 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-center">
              Reisinformatie gekopieerd naar klembord!
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Vertrektijd
              </span>
              <div className="text-sm font-mono font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{bus.time}</span>
              </div>
              {bus.delay && (
                <span className="text-[10px] font-bold text-blue-400 font-mono">
                  {bus.delay}
                </span>
              )}
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Totaal Haltes
              </span>
              <div className="text-sm font-mono font-bold text-blue-400 flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{stops.length} haltes</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {remainingCount} te gaan
              </span>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Geschatte Ritduur
              </span>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                {totalDurationMinutes ? `ca. ${totalDurationMinutes} min` : 'Dienstregeling'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {bus.isRealtime ? 'Live GPS' : 'Regulier'}
              </span>
            </div>
          </div>
        </div>

        {/* Stops Timeline Header & Controls */}
        <div className="p-3.5 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Haltes & Tijden op deze rit</span>
              {isLoadingLiveStops && (
                <span className="text-[10px] text-blue-400 font-normal font-mono animate-pulse">
                  (live synchroniseren...)
                </span>
              )}
            </h4>
          </div>

          {/* Filter and Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek halte..."
                className="w-full bg-slate-900 border border-slate-700/60 rounded pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800 text-[10px]">
              <button
                onClick={() => setStopFilter('all')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  stopFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Alle ({stops.length})
              </button>
              <button
                onClick={() => setStopFilter('upcoming')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  stopFilter === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Komende ({remainingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Stops List with Connected Timeline */}
        <div className="p-4 overflow-y-auto space-y-0 relative divide-y divide-slate-800/40">
          {displayedStops.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Geen haltes gevonden die overeenkomen met &quot;{searchQuery}&quot;.
            </div>
          ) : (
            displayedStops.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === displayedStops.length - 1;
              const isCurrentOrBoarding =
                stop.isCurrent ||
                (!stop.isPassed &&
                  currentHalteName &&
                  stop.name.toLowerCase().includes(currentHalteName.toLowerCase().replace(/,.*/, '')));

              return (
                <div
                  key={`${stop.name}_${index}`}
                  className={`py-2.5 px-2 flex items-center justify-between rounded-lg transition-colors group ${
                    isCurrentOrBoarding
                      ? 'bg-blue-600/10 border border-blue-500/30'
                      : stop.isPassed
                      ? 'opacity-60 hover:opacity-100 hover:bg-slate-800/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Marker & Stop Name */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Timeline Node */}
                    <div className="relative flex items-center justify-center shrink-0">
                      {stop.isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-slate-500" />
                      ) : isCurrentOrBoarding ? (
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-4 ring-blue-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                        </div>
                      ) : isLast ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors"></div>
                      )}
                    </div>

                    {/* Name & Badge */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs truncate font-medium ${
                            isCurrentOrBoarding
                              ? 'text-blue-300 font-bold'
                              : stop.isPassed
                              ? 'text-slate-400 line-through'
                              : 'text-slate-200'
                          }`}
                        >
                          {stop.name}
                        </span>
                        {isFirst && (
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono uppercase shrink-0">
                            Beginhalte
                          </span>
                        )}
                        {isCurrentOrBoarding && (
                          <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded font-mono uppercase shrink-0 shadow-sm">
                            Instappen
                          </span>
                        )}
                        {isLast && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-1.5 py-0.2 rounded font-mono uppercase shrink-0">
                            Eindhalte
                          </span>
                        )}
                      </div>
                      {stop.code && (
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Haltecode: {stop.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Arrival/Departure Time */}
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono text-xs font-bold ${
                        isCurrentOrBoarding
                          ? 'text-blue-400'
                          : stop.isPassed
                          ? 'text-slate-500'
                          : 'text-slate-100'
                      }`}
                    >
                      {stop.time}
                    </div>
                    {stop.delay && (
                      <span className="text-[9px] font-mono text-amber-400 block font-semibold">
                        {stop.delay}
                      </span>
                    )}
                    {stop.isPassed ? (
                      <span className="text-[9px] font-mono text-slate-500 block">
                        Gepasseerd
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            {bus.isRealtime ? 'Geverifieerd via DRGL / Open OV' : 'Regulier dienstregeling model'}
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-1.5 rounded-lg transition-colors text-xs border border-slate-700/60"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
