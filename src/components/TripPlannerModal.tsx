import React, { useState } from 'react';
import {
  X,
  Navigation,
  ArrowUpDown,
  Clock,
  Bookmark,
  BookmarkCheck,
  Trash2,
  LogIn,
  CheckCircle,
  Footprints,
  Bus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Halte, SavedRoute } from '../types';
import { User } from 'firebase/auth';
import { generateScheduleForLine } from '../utils/routeCatalog';

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  haltes: Halte[];
  currentUser: User | null;
  savedRoutes: SavedRoute[];
  onSaveRoute: (route: Omit<SavedRoute, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteSavedRoute: (routeId: string) => Promise<void>;
  onOpenAuth: () => void;
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  isOpen,
  onClose,
  haltes,
  currentUser,
  savedRoutes,
  onSaveRoute,
  onDeleteSavedRoute,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'saved'>('planner');
  const [fromId, setFromId] = useState<string>(haltes[0]?.id || '');
  const [toId, setToId] = useState<string>(haltes[1]?.id || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const [plannedRoute, setPlannedRoute] = useState<{
    busLine: string;
    operator: string;
    departureInMins: number;
    travelDuration: number;
    departureTime: string;
    arrivalTime: string;
    steps: Array<{ time: string; title: string; desc: string; icon: 'walk' | 'bus' }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleSwap = () => {
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
    setPlannedRoute(null);
    setSaveSuccess(false);
  };

  const calculateRoute = (sourceFromId: string, sourceToId: string) => {
    if (sourceFromId === sourceToId) {
      alert('Vertrekpunt en bestemming moeten verschillend zijn!');
      return;
    }

    const fromHalte = haltes.find((h) => h.id === sourceFromId);
    const toHalte = haltes.find((h) => h.id === sourceToId);
    if (!fromHalte || !toHalte) return;

    const now = new Date();
    const waitMins = Math.floor(Math.random() * 5) + 3; // 3 - 7 min
    const travelDuration = Math.floor(Math.random() * 8) + 9; // 9 - 16 min

    const depDate = new Date(now.getTime() + waitMins * 60 * 1000);
    const formatTime = (d: Date) =>
      d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

    let lineNum = '1';
    let lineName = 'Lijn 1';
    const destLower = toHalte.name.toLowerCase();
    const fromLower = fromHalte.name.toLowerCase();

    if (
      destLower.includes('viecuri') ||
      destLower.includes('zuid') ||
      fromLower.includes('viecuri')
    ) {
      lineNum = '3';
      lineName = 'Lijn 3';
    } else if (
      destLower.includes('tegelen') ||
      destLower.includes('roermond') ||
      destLower.includes('reuver')
    ) {
      lineNum = '66';
      lineName = 'Lijn 66';
    } else if (
      destLower.includes('baarlo') ||
      destLower.includes('weert') ||
      destLower.includes('panningen')
    ) {
      lineNum = '70';
      lineName = 'Lijn 70';
    } else if (destLower.includes('kessel') || destLower.includes('neer')) {
      lineNum = '72';
      lineName = 'Lijn 72';
    } else if (
      destLower.includes('arcen') ||
      destLower.includes('gennep') ||
      destLower.includes('nijmegen') ||
      destLower.includes('velden')
    ) {
      lineNum = '83';
      lineName = 'Lijn 83';
    } else if (destLower.includes('horst') || destLower.includes('sevenum')) {
      lineNum = '86';
      lineName = 'Lijn 86';
    } else if (destLower.includes('venray') || destLower.includes('grubbenvorst')) {
      lineNum = '87';
      lineName = 'Lijn 87';
    } else if (destLower.includes('klingerberg')) {
      lineNum = '2';
      lineName = 'Lijn 2';
    } else if (destLower.includes('vosakker') || destLower.includes('blerick')) {
      lineNum = '1';
      lineName = 'Lijn 1';
    }

    const routeStops = generateScheduleForLine(
      lineNum,
      toHalte.name,
      formatTime(depDate),
      undefined,
      fromHalte.name
    );

    // Calculate actual travel duration from schedule
    const firstTime = routeStops[0]?.time || formatTime(depDate);
    const lastTime =
      routeStops[routeStops.length - 1]?.time ||
      formatTime(new Date(depDate.getTime() + 15 * 60000));

    let calculatedDuration = travelDuration;
    if (firstTime.includes(':') && lastTime.includes(':')) {
      const [h1, m1] = firstTime.split(':').map(Number);
      const [h2, m2] = lastTime.split(':').map(Number);
      let diff = h2 * 60 + m2 - (h1 * 60 + m1);
      if (diff < 0) diff += 24 * 60;
      if (diff > 0) calculatedDuration = diff;
    }

    const steps = [
      {
        time: 'Nu',
        title: `Loop naar ${fromHalte.name}`,
        desc: 'Ga naar het vertrekperron (volg borden "Busstation").',
        icon: 'walk' as const,
      },
      {
        time: firstTime,
        title: `Stap in ${lineName} richting ${toHalte.name}`,
        desc: `Rechtstreekse busverbinding • ${routeStops.length} haltes op de route`,
        icon: 'bus' as const,
      },
      ...routeStops.slice(1, -1).map((s) => ({
        time: s.time,
        title: `Tussenhalte: ${s.name}`,
        desc: 'Tussenstop volgens dienstregeling.',
        icon: 'bus' as const,
      })),
      {
        time: lastTime,
        title: `Aankomst bij ${toHalte.name}`,
        desc: 'Uitstappen bij halte. Goede reis gewenst via BusApp Venlo!',
        icon: 'walk' as const,
      },
    ];

    setPlannedRoute({
      busLine: lineName,
      operator: 'Arriva Limburg',
      departureInMins: waitMins,
      travelDuration: calculatedDuration,
      departureTime: firstTime,
      arrivalTime: lastTime,
      steps,
    });
    setSaveSuccess(false);
  };

  const handlePlan = () => {
    calculateRoute(fromId, toId);
  };

  const handleSaveCurrentRoute = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const fromHalte = haltes.find((h) => h.id === fromId);
    const toHalte = haltes.find((h) => h.id === toId);
    if (!fromHalte || !toHalte || !plannedRoute) return;

    setIsSaving(true);
    try {
      await onSaveRoute({
        userId: currentUser.uid,
        userEmail: currentUser.email || undefined,
        fromId: fromHalte.id,
        fromName: fromHalte.name,
        toId: toHalte.id,
        toName: toHalte.name,
        busLine: plannedRoute.busLine,
        operator: plannedRoute.operator,
        duration: plannedRoute.travelDuration,
      });
      setSaveSuccess(true);
    } catch (err) {
      console.warn('Fout bij opslaan route:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSavedRoute = (route: SavedRoute) => {
    setFromId(route.fromId);
    setToId(route.toId);
    setActiveTab('planner');
    calculateRoute(route.fromId, route.toId);
  };

  const fromHalte = haltes.find((h) => h.id === fromId);
  const toHalte = haltes.find((h) => h.id === toId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Sluitknop */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
          title="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Titel */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold shadow-sm shadow-blue-900/30 shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              BusApp Venlo Reisplanner
            </h3>
            <p className="text-xs text-slate-400">
              Actuele vertrektijden, overstappen en opgeslagen routes
            </p>
          </div>
        </div>

        {/* Tabs: Route Plannen / Opgeslagen Routes */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'planner'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route Plannen</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Mijn Opgeslagen Routes</span>
            {savedRoutes.length > 0 && (
              <span className="bg-slate-800 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {savedRoutes.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Inhoud (Scrollbaar) */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {activeTab === 'planner' ? (
            <>
              {/* Vertrek / Bestemming Selectie */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800 relative">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Vertrekhalte
                  </label>
                  <select
                    value={fromId}
                    onChange={(e) => {
                      setFromId(e.target.value);
                      setPlannedRoute(null);
                      setSaveSuccess(false);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {haltes.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.city ? `(${h.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wissel Vertrek & Bestemming */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    onClick={handleSwap}
                    className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 p-1.5 rounded-full shadow-md transition-transform hover:rotate-180"
                    title="Wissel vertrek en bestemming om"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Bestemming
                  </label>
                  <select
                    value={toId}
                    onChange={(e) => {
                      setToId(e.target.value);
                      setPlannedRoute(null);
                      setSaveSuccess(false);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {haltes.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.city ? `(${h.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handlePlan}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-md shadow-blue-900/20 transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Bereken Route & Vertrektijd</span>
                </button>
              </div>

              {/* Berekende Route Resultaten */}
              {plannedRoute && fromHalte && toHalte && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Samenvattingskaart */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                        {plannedRoute.busLine}
                      </span>
                      <div className="text-xs font-semibold text-white mt-1.5">
                        Vertrek over ca. {plannedRoute.departureInMins} minuten
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {plannedRoute.departureTime} → {plannedRoute.arrivalTime} ({plannedRoute.travelDuration} min)
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        DIRECTE RIT
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {plannedRoute.operator}
                      </div>
                    </div>
                  </div>

                  {/* Route Opslaan Actieknop */}
                  <div className="flex items-center gap-2">
                    {saveSuccess ? (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Route bewaard in jouw account!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleSaveCurrentRoute}
                        disabled={isSaving}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-sm"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                        <span>{currentUser ? 'Route Opslaan in Mijn Account' : 'Inloggen om Route op te slaan'}</span>
                      </button>
                    )}
                  </div>

                  {/* Stappenoverzicht */}
                  <div className="space-y-2 pl-2">
                    {plannedRoute.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-xs">
                        <div className="font-mono font-bold text-blue-400 shrink-0 w-12 text-right">
                          {step.time}
                        </div>
                        <div className="border-l border-slate-800 pl-3 pb-3 relative">
                          <div className="w-2 h-2 rounded-full bg-blue-500 absolute -left-[5px] top-1"></div>
                          <div className="text-slate-100 font-medium text-xs">{step.title}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Tabblad: Mijn Opgeslagen Routes */
            <div className="space-y-3">
              {!currentUser ? (
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl text-center space-y-3">
                  <LogIn className="w-8 h-8 text-blue-500 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-100">
                    Log in om je gemaakte routes op te halen
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Meld je aan via Google of e-mail om al je favoriete trajecten en reisschema's te synchroniseren over al je apparaten.
                  </p>
                  <button
                    onClick={onOpenAuth}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
                  >
                    Nu Inloggen / Account Aanmaken
                  </button>
                </div>
              ) : savedRoutes.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 p-8 rounded-xl text-center space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                  <h4 className="text-xs font-semibold text-slate-300">
                    Nog geen routes opgeslagen
                  </h4>
                  <p className="text-xs text-slate-500">
                    Ga naar het tabblad "Route Plannen", bereken een reis en klik op "Route Opslaan in Mijn Account".
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between px-1">
                    <span>Opgeslagen trajecten van {currentUser.displayName || currentUser.email}</span>
                    <span className="font-mono text-blue-400 font-semibold">{savedRoutes.length} routes</span>
                  </div>

                  {savedRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg flex items-center justify-between gap-3 transition-colors group"
                    >
                      <div className="truncate space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                          <span className="truncate">{route.fromName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate text-blue-300">{route.toName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                          <span className="bg-blue-600/20 text-blue-400 px-1.5 py-0.2 rounded font-semibold border border-blue-500/30">
                            {route.busLine}
                          </span>
                          <span>Ca. {route.duration} minuten</span>
                          <span>•</span>
                          <span>{route.operator}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleLoadSavedRoute(route)}
                          className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
                          title="Plan deze route nu actueel"
                        >
                          Nu Plannen
                        </button>
                        <button
                          onClick={() => onDeleteSavedRoute(route.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Verwijder deze opgeslagen route"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sluiten Knop Onderin */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 rounded-lg transition-colors text-xs border border-slate-700/60 shrink-0"
        >
          Sluiten
        </button>
      </div>
    </div>
  );
};
