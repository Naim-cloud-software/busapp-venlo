import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  Radio,
  Trash2,
  AlertCircle,
  Bus,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Settings,
} from 'lucide-react';
import { Halte, Departure, FilterType, SourceMode, CustomBus, SiteSettings } from '../types';
import { generateScheduleForLine } from '../utils/routeCatalog';

interface DepartureBoardProps {
  halte: Halte | null;
  departures: Departure[];
  sourceMode: SourceMode;
  onSetSourceMode: (mode: SourceMode) => void;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
  onDeleteCustomBus: (busId: string) => void;
  onSelectBus: (bus: Departure) => void;
  settings?: SiteSettings;
  onOpenSettings?: () => void;
}

export const DepartureBoard: React.FC<DepartureBoardProps> = ({
  halte,
  departures,
  sourceMode,
  onSetSourceMode,
  isLoading,
  onRefresh,
  lastUpdated,
  onDeleteCustomBus,
  onSelectBus,
  settings,
  onOpenSettings,
}) => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>('alle');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);

  if (!halte) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
        <Bus className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
        <h3 className="text-base font-bold text-white mb-1">Geen halte geselecteerd</h3>
        <p className="text-xs text-slate-400">
          Kies een halte uit de linkerkolom of voeg een nieuwe halte toe om de vertrektijden te zien.
        </p>
      </div>
    );
  }

  // Calculate countdown in minutes from departure time (HH:MM)
  const getMinutesUntil = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const now = new Date();
      const depDate = new Date();
      depDate.setHours(hours, minutes, 0, 0);

      // If departure is past midnight compared to current time
      if (depDate.getTime() < now.getTime() - 10 * 60 * 1000) {
        depDate.setDate(depDate.getDate() + 1);
      }

      const diffMs = depDate.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      return diffMins;
    } catch {
      return null;
    }
  };

  // Helper for line colors matching Professional Polish design
  const getLineBadgeStyle = (line: string, type: string) => {
    const num = parseInt(line, 10);
    if (line.toLowerCase().includes('express') || line === '372') {
      return 'bg-blue-600 text-white font-bold';
    }
    if (num === 1) return 'bg-yellow-500 text-black font-bold';
    if (num === 2) return 'bg-blue-600 text-white font-bold';
    if (num === 3) return 'bg-green-600 text-white font-bold';
    if (num === 66) return 'bg-purple-600 text-white font-bold';
    if (num === 70) return 'bg-slate-600 text-white font-bold';
    if (num === 83) return 'bg-red-600 text-white font-bold';
    if (type === 'stads') return 'bg-blue-600 text-white font-bold';
    return 'bg-slate-700 text-white font-bold';
  };

  // Helper for status badge matching Professional Polish design
  const renderStatusBadge = (bus: Departure) => {
    const isOntime = bus.status.toLowerCase().includes('op tijd') || bus.status.toLowerCase().includes('on time');
    const isDelayed = bus.delay && bus.delay !== '' && bus.delay !== '+0';
    const isCritical = bus.status.toLowerCase().includes('vervallen') || bus.status.toLowerCase().includes('geannuleerd');

    if (isCritical) {
      return (
        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wider font-semibold">
          VERVALLEN
        </span>
      );
    }

    if (isDelayed) {
      return (
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider font-semibold">
          {bus.delay.toUpperCase().includes('MIN') ? bus.delay.toUpperCase() : `+${bus.delay.toUpperCase()} MIN`}
        </span>
      );
    }

    if (isOntime) {
      return (
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider font-semibold">
          OP TIJD
        </span>
      );
    }

    return (
      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 uppercase tracking-wider font-semibold">
        {bus.status}
      </span>
    );
  };

  // Filter departures
  const filteredDepartures = departures.filter((dep) => {
    if (currentFilter !== 'alle' && dep.type !== currentFilter) {
      return false;
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      return (
        dep.line.toLowerCase().includes(q) ||
        dep.destination.toLowerCase().includes(q) ||
        dep.platform.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Active Halte Info Header Card */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
              {halte.type}
            </span>
            {halte.code && halte.code !== 'CUSTOM' && (
              <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {halte.code}
              </span>
            )}
            {(halte.drglUrl || (halte.code && halte.code !== 'CUSTOM')) && (
              <a
                href={halte.drglUrl || `https://drgl.nl/stop/${halte.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-mono text-blue-400 hover:text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 flex items-center gap-1 transition-colors"
                title="Bekijk officiële halte op DRGL.nl"
              >
                <span>drgl.nl</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            {halte.name}
          </h2>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            {sourceMode === 'live' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                <span>Live verbonden met OV-netwerk (Arriva / NDOV Realtime)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Beheerd via Sem's Creator Mode (Handmatige dienstregeling)</span>
              </>
            )}
          </p>
        </div>

        {/* Source Mode Toggle (Live or Custom) */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Bron:
          </span>
          <div className="inline-flex bg-slate-950 p-1 border border-slate-800 rounded-lg shadow-inner">
            <button
              onClick={() => onSetSourceMode('live')}
              className={`px-3 py-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                sourceMode === 'live'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live OV
            </button>
            <button
              onClick={() => onSetSourceMode('custom')}
              className={`px-3 py-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                sourceMode === 'custom'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sem / Handmatig
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar & Live Refresh Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['alle', 'streek', 'stads', 'express'] as FilterType[]).map((type) => {
            const labels: Record<FilterType, string> = {
              alle: 'Alle Lijnen',
              streek: 'Streekvervoer',
              stads: 'Stadsdienst',
              express: 'Snel / Express',
              custom: 'Handmatig',
            };

            const isActive = currentFilter === type;
            return (
              <button
                key={type}
                onClick={() => setCurrentFilter(type)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>

        {/* Search in table & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Zoek bestemming of lijn..."
              className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-medium shrink-0 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            title="Informatie nu live vernieuwen"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden md:inline">Live Vernieuwen</span>
          </button>
        </div>
      </div>

      {/* The Digital Departure Board Table matching TransitPro card */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col min-h-0 overflow-hidden shadow-2xl">
        {/* Table Board Header with Accent Bar */}
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-slate-100 text-sm">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Actueel Vertrekbord
          </h3>
          <div className="flex gap-2 items-center">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              HALTE: {halte.name}
            </span>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="bg-slate-700/70 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-600/50"
                title="Bordstijl, kleuren en weergave aanpassen"
              >
                <Settings className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Stijl</span>
              </button>
            )}
            <button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors shadow-sm"
              title="Synchroniseer gegevens met het realtime netwerk"
            >
              Synchroniseren
            </button>
          </div>
        </div>

        {/* Table Header thead */}
        <div className="grid grid-cols-12 gap-2 bg-slate-800/30 px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800 font-bold">
          <div className="col-span-2 sm:col-span-2">Lijn</div>
          <div className="col-span-5 sm:col-span-5">Bestemming</div>
          <div className="col-span-2 sm:col-span-2 text-right">Vertrek</div>
          <div className="col-span-3 sm:col-span-3 text-center">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-800/50 text-sm min-h-[260px]">
          {isLoading && departures.length === 0 ? (
            <div className="p-14 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live bustijden ophalen uit Venlo...
              </p>
            </div>
          ) : filteredDepartures.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
              <Bus className="w-10 h-10 opacity-30 text-slate-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Geen bussen gevonden
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                {sourceMode === 'custom'
                  ? 'Er zijn nog geen custom ritten ingepland voor deze halte. Gebruik NCS Studio om een rit toe te voegen.'
                  : 'Er rijden momenteel geen ritten volgens dit filter. Pas je filters aan of ververs de live data.'}
              </p>
            </div>
          ) : (
            filteredDepartures.map((bus) => {
              const mins = getMinutesUntil(bus.time);
              const badgeStyle = settings?.highContrastLines
                ? 'bg-black text-white border-2 border-white font-black'
                : getLineBadgeStyle(bus.line, bus.type);
              const isApproaching = mins !== null && mins >= 0 && mins <= 2;
              const isCompact = settings?.density === 'compact';
              const isLargeText = settings?.textSize === 'large';
              const timeFormat = settings?.timeFormat || 'both';

              const busStops =
                bus.stops && bus.stops.length > 0
                  ? bus.stops
                  : generateScheduleForLine(
                      bus.line,
                      bus.destination,
                      bus.time,
                      bus.delay,
                      halte.name
                    );
              const isExpanded = expandedBusId === bus.id;

              return (
                <div key={bus.id} className="border-b border-slate-800/60 last:border-b-0">
                  <div
                    onClick={() => onSelectBus(bus)}
                    className={`grid grid-cols-12 gap-2 px-4 ${
                      isCompact ? 'py-2' : 'py-3.5'
                    } items-center hover:bg-blue-500/5 cursor-pointer transition-colors group ${
                      isApproaching ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    {/* Line Number Badge */}
                    <div className="col-span-2 sm:col-span-2 flex items-center">
                      <span
                        className={`${
                          bus.lineColor && !settings?.highContrastLines ? '' : badgeStyle
                        } px-2 py-1 rounded text-xs font-bold text-center inline-block min-w-[34px] shadow-sm`}
                        style={
                          bus.lineColor && !settings?.highContrastLines
                            ? {
                                backgroundColor: bus.lineColor,
                                color: bus.lineTextColor || '#ffffff',
                              }
                            : undefined
                        }
                      >
                        {bus.line}
                      </span>
                    </div>

                    {/* Destination, Stops Preview & Operator */}
                    <div className="col-span-5 sm:col-span-5 flex items-center gap-2 overflow-hidden">
                      <div className="truncate w-full">
                        <div
                          className={`font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate ${
                            isLargeText ? 'text-sm' : 'text-xs sm:text-sm'
                          }`}
                        >
                          <span className="truncate">{bus.destination}</span>
                          {bus.custom && (
                            <span className="text-[8px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.2 rounded font-bold uppercase shrink-0 ml-1.5">
                              Sem
                            </span>
                          )}
                        </div>

                        {/* Intermediate stops preview with times */}
                        {settings?.showStopsPreview !== false && busStops.length > 1 && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1 font-sans">
                            <MapPin className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                            <span className="truncate">
                              Via:{' '}
                              {busStops
                                .slice(1, 4)
                                .map((s) => `${s.name.replace(/,.*/, '')} (${s.time})`)
                                .join(' • ')}
                            </span>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                          <span>{bus.operator || 'Arriva Limburg'}</span>
                          <span>•</span>
                          <span>{bus.platform || 'Perron 1'}</span>
                          {bus.alert && (
                            <span className="text-amber-400 lowercase font-sans">
                              • {bus.alert}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Departure Time */}
                    <div className="col-span-2 sm:col-span-2 text-right">
                      <div
                        className={`font-mono ${
                          isLargeText ? 'text-base' : 'text-sm'
                        } ${
                          isApproaching
                            ? 'text-blue-400 font-bold'
                            : 'text-slate-300 font-medium'
                        }`}
                      >
                        {timeFormat === 'relative'
                          ? mins === 0
                            ? 'Nu'
                            : mins !== null && mins > 0
                            ? `over ${mins} min`
                            : bus.time
                          : mins === 0
                          ? 'Nu'
                          : bus.time}
                      </div>
                      {timeFormat === 'both' && mins !== null && mins > 0 && mins <= 60 && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          over {mins} min
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-1.5">
                      {renderStatusBadge(bus)}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedBusId(isExpanded ? null : bus.id);
                        }}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                        title={isExpanded ? 'Verberg haltes' : 'Toon alle haltes en tijden'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {bus.custom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomBus(bus.id);
                          }}
                          className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                          title="Verwijder deze custom rit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Expanded Stops & Times Drawer */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            Haltes & Aankomsttijden ({busStops.length} stops)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBus(bus);
                          }}
                          className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Volledig routeoverzicht</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-stretch gap-2 overflow-x-auto pb-2 pt-1">
                        {busStops.map((st, sIdx) => {
                          const isCurrent = sIdx === 0 || st.isCurrent;
                          const isLast = sIdx === busStops.length - 1;
                          return (
                            <div
                              key={sIdx}
                              className={`flex-shrink-0 p-2.5 rounded-lg border text-xs min-w-[140px] max-w-[170px] ${
                                isCurrent
                                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-200 ring-1 ring-blue-500/30'
                                  : isLast
                                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                                  : st.isPassed
                                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono font-bold text-white text-xs">
                                  {st.time}
                                </span>
                                {st.delay && (
                                  <span className="text-[9px] font-bold text-amber-400 font-mono">
                                    {st.delay}
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="text-[8px] bg-blue-500 text-white font-bold px-1 rounded uppercase">
                                    Instappen
                                  </span>
                                )}
                                {isLast && (
                                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1 rounded uppercase">
                                    Eindhalte
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium truncate" title={st.name}>
                                {st.name}
                              </div>
                              {st.code && (
                                <div className="text-[9px] text-slate-500 font-mono truncate">
                                  {st.code}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info strip */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-4 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            <span>Live gegevensstroom: Centraal Knooppunt Venlo</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span>
              Laatste update: {lastUpdated ? lastUpdated.toLocaleTimeString('nl-NL') : 'zojuist'}
            </span>
            <span className="text-slate-400">
              {filteredDepartures.length} ritten
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
