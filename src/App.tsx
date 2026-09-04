import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HalteSelector } from './components/HalteSelector';
import { DepartureBoard } from './components/DepartureBoard';
import { LiveDisruptionsBar } from './components/LiveDisruptionsBar';
import { TripPlannerModal } from './components/TripPlannerModal';
import { CreatorStudioModal } from './components/CreatorStudioModal';
import { BusDetailModal } from './components/BusDetailModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { ImportDrglModal } from './components/ImportDrglModal';
import { DEFAULT_HALTES } from './defaultData';
import {
  Halte,
  Departure,
  CustomBus,
  LiveDisruption,
  SourceMode,
  SavedRoute,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
} from './types';
import {
  subscribeToCustomHaltes,
  subscribeToCustomBussen,
  subscribeToDisruptions,
  saveHalteToFirestore,
  deleteHalteFromFirestore,
  saveBusToFirestore,
  deleteBusFromFirestore,
  addDisruptionToFirestore,
  subscribeToAuth,
  logoutUser,
  subscribeToUserSavedRoutes,
  saveUserRouteToFirestore,
  deleteUserRouteFromFirestore,
  saveUserFavoritesToFirestore,
  getUserFavoritesFromFirestore,
  saveUserSettingsToFirestore,
  getUserSettingsFromFirestore,
} from './firebase';
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  applyThemeToDocument,
} from './utils/themeHelper';
import { playTransitChime } from './utils/audio';
import { Bus, Navigation, Cpu, Settings } from 'lucide-react';
import { User } from 'firebase/auth';

export default function App() {
  // Site Stijl & Weergave Instellingen
  const [settings, setSettings] = useState<SiteSettings>(() => loadSettingsFromStorage());
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  // Haltes list
  const [haltes, setHaltes] = useState<Halte[]>(() => {
    const saved = localStorage.getItem('NCS_Haltes_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_HALTES;
      }
    }
    return DEFAULT_HALTES;
  });

  // Selected Halte
  const [selectedHalte, setSelectedHalte] = useState<Halte | null>(() => {
    return haltes.length > 0 ? haltes[0] : null;
  });

  // Custom Bussen
  const [customBussen, setCustomBussen] = useState<CustomBus[]>(() => {
    const saved = localStorage.getItem('NCS_Bussen_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Source modes per stop
  const [sourceModes, setSourceModes] = useState<Record<string, SourceMode>>(() => {
    const saved = localStorage.getItem('NCS_SourceModes_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('NCS_Favorites_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['venlo_station'];
      }
    }
    return ['venlo_station'];
  });

  // Live Disruptions
  const [disruptions, setDisruptions] = useState<LiveDisruption[]>([
    {
      id: 'default_disr_1',
      line: '83',
      title: 'Geen vertragingen op sneltraject Venlo - Gennep',
      description: 'Dienstregeling Arriva Limburg & Breng rijdt volgens schema.',
      severity: 'info',
      timestamp: new Date().toISOString(),
      reportedBy: 'Arriva Verkeersleiding',
      upvotes: 14,
    },
  ]);

  // Live Departures
  const [liveDepartures, setLiveDepartures] = useState<Departure[]>([]);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Connection status
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  // Modals
  const [plannerOpen, setPlannerOpen] = useState<boolean>(false);
  const [studioOpen, setStudioOpen] = useState<boolean>(false);
  const [drglModalOpen, setDrglModalOpen] = useState<boolean>(false);
  const [selectedBusForDetail, setSelectedBusForDetail] = useState<Departure | null>(null);
  const [mobileTab, setMobileTab] = useState<'bussen' | 'planner' | 'studio'>('bussen');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        // Load cloud favorites if available
        getUserFavoritesFromFirestore(user.uid).then((cloudFavs) => {
          if (cloudFavs && cloudFavs.length > 0) {
            setFavorites(cloudFavs);
          }
        });

        // Load cloud site settings if available
        getUserSettingsFromFirestore(user.uid).then((cloudSettings) => {
          if (cloudSettings) {
            setSettings((prev) => ({
              ...prev,
              ...cloudSettings,
            }));
          }
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Apply site theme & visual styling to document
  useEffect(() => {
    applyThemeToDocument(settings);
    saveSettingsToStorage(settings);
  }, [settings]);

  // Sync saved routes for current user in real-time
  useEffect(() => {
    if (!currentUser) {
      setSavedRoutes([]);
      return;
    }

    const unsubRoutes = subscribeToUserSavedRoutes(
      currentUser.uid,
      (routes) => {
        setSavedRoutes(routes);
      },
      (err) => {
        console.warn('Fout bij synchroniseren van routes:', err);
      }
    );

    return () => unsubRoutes();
  }, [currentUser]);

  // Save haltes, bussen, and source modes locally
  useEffect(() => {
    localStorage.setItem('NCS_Haltes_v2', JSON.stringify(haltes));
  }, [haltes]);

  useEffect(() => {
    localStorage.setItem('NCS_Bussen_v2', JSON.stringify(customBussen));
  }, [customBussen]);

  useEffect(() => {
    localStorage.setItem('NCS_SourceModes_v2', JSON.stringify(sourceModes));
  }, [sourceModes]);

  useEffect(() => {
    localStorage.setItem('NCS_Favorites_v2', JSON.stringify(favorites));
    if (currentUser) {
      saveUserFavoritesToFirestore(currentUser.uid, favorites);
    }
  }, [favorites, currentUser]);

  // Real-time Firebase Firestore Sync for public stops, buses, and alerts
  useEffect(() => {
    const unsubHaltes = subscribeToCustomHaltes(
      (firestoreHaltes) => {
        setFirebaseConnected(true);
        if (firestoreHaltes.length > 0) {
          setHaltes((prev) => {
            const map = new Map<string, Halte>();
            DEFAULT_HALTES.forEach((h) => map.set(h.id, h));
            prev.forEach((h) => map.set(h.id, h));
            firestoreHaltes.forEach((h) => map.set(h.id, h));
            return Array.from(map.values());
          });
        }
      },
      (err) => {
        console.warn('Firebase haltes sync error:', err);
      }
    );

    const unsubBussen = subscribeToCustomBussen(
      (firestoreBussen) => {
        setFirebaseConnected(true);
        if (firestoreBussen.length > 0) {
          setCustomBussen((prev) => {
            const map = new Map<string, CustomBus>();
            prev.forEach((b) => map.set(b.id, b));
            firestoreBussen.forEach((b) => map.set(b.id, b));
            return Array.from(map.values());
          });
        }
      },
      (err) => {
        console.warn('Firebase bussen sync error:', err);
      }
    );

    const unsubDisruptions = subscribeToDisruptions(
      (firestoreDisruptions) => {
        setFirebaseConnected(true);
        if (firestoreDisruptions.length > 0) {
          setDisruptions(firestoreDisruptions);
        }
      },
      (err) => {
        console.warn('Firebase disruptions sync error:', err);
      }
    );

    return () => {
      unsubHaltes();
      unsubBussen();
      unsubDisruptions();
    };
  }, []);

  // Fetch Live Departures from backend
  const fetchLiveDepartures = useCallback(
    async (halte: Halte) => {
      if (!halte || !halte.code || halte.code === 'CUSTOM') {
        setLiveDepartures([]);
        setIsLoadingDepartures(false);
        return;
      }

      setIsLoadingDepartures(true);
      try {
        const res = await fetch(`/api/ov/departures/${encodeURIComponent(halte.code)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.departures)) {
          setLiveDepartures(data.departures);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.warn('Kon actuele vertrektijden niet ophalen:', err);
      } finally {
        setIsLoadingDepartures(false);
      }
    },
    []
  );

  // Trigger departure fetch when selected halte changes
  useEffect(() => {
    if (selectedHalte) {
      const mode = sourceModes[selectedHalte.id] || (selectedHalte.custom ? 'custom' : 'live');
      if (mode === 'live' && selectedHalte.code !== 'CUSTOM') {
        fetchLiveDepartures(selectedHalte);
      }
    }
  }, [selectedHalte, sourceModes, fetchLiveDepartures]);

  // Periodic background auto-refresh according to user settings
  useEffect(() => {
    if (!settings.autoRefreshInterval || settings.autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (selectedHalte) {
        const mode = sourceModes[selectedHalte.id] || (selectedHalte.custom ? 'custom' : 'live');
        if (mode === 'live' && selectedHalte.code !== 'CUSTOM') {
          fetchLiveDepartures(selectedHalte);
        }
      }
    }, settings.autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [selectedHalte, sourceModes, fetchLiveDepartures, settings.autoRefreshInterval]);

  // Update site settings handler (saves locally & syncs to cloud if logged in)
  const handleUpdateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettingsToStorage(updated);
      if (currentUser) {
        saveUserSettingsToFirestore(currentUser.uid, updated);
      }
      return updated;
    });
  };

  // Reset settings to default
  const handleResetSettings = () => {
    setSettings(DEFAULT_SITE_SETTINGS);
    saveSettingsToStorage(DEFAULT_SITE_SETTINGS);
    if (currentUser) {
      saveUserSettingsToFirestore(currentUser.uid, DEFAULT_SITE_SETTINGS);
    }
  };

  // Determine current active source mode
  const currentSourceMode: SourceMode = selectedHalte
    ? sourceModes[selectedHalte.id] || (selectedHalte.custom ? 'custom' : 'live')
    : 'live';

  const handleSetSourceMode = (mode: SourceMode) => {
    if (!selectedHalte) return;
    setSourceModes((prev) => ({
      ...prev,
      [selectedHalte.id]: mode,
    }));
    if (mode === 'live' && selectedHalte.code !== 'CUSTOM') {
      fetchLiveDepartures(selectedHalte);
    }
  };

  // Convert custom buses for selected halte into Departure format
  const activeCustomDepartures: Departure[] = selectedHalte
    ? customBussen
        .filter((b) => b.halteId === selectedHalte.id)
        .map((b) => ({
          id: b.id,
          line: b.line,
          destination: b.destination,
          time: b.time,
          delay: '',
          isRealtime: false,
          platform: b.platform,
          operator: 'NCS Special • Sem Editie',
          status: b.status,
          statusColor: b.statusColor,
          type: b.type,
          alert: b.note || null,
          custom: true,
        }))
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const displayDepartures =
    currentSourceMode === 'custom' || (selectedHalte && selectedHalte.code === 'CUSTOM')
      ? activeCustomDepartures
      : liveDepartures;

  // Toggle favorite
  const handleToggleFavorite = (halteId: string) => {
    setFavorites((prev) =>
      prev.includes(halteId) ? prev.filter((id) => id !== halteId) : [...prev, halteId]
    );
  };

  // Add found live stop from search
  const handleAddFoundStop = async (stop: { code: string; name: string; type: string }) => {
    const newHalte: Halte = {
      id: `stop_${stop.code.replace(/[^a-zA-Z0-9]/g, '_')}`,
      code: stop.code,
      name: stop.name,
      type: stop.type,
      icon: stop.type.toLowerCase().includes('trein') ? 'train' : 'map-pin',
      city: 'Venlo & Omgeving',
      custom: true,
      createdByUserId: currentUser ? currentUser.uid : undefined,
      createdAt: new Date().toISOString(),
    };

    setHaltes((prev) => [newHalte, ...prev]);
    setSelectedHalte(newHalte);
    setSourceModes((prev) => ({ ...prev, [newHalte.id]: 'live' }));

    try {
      await saveHalteToFirestore(newHalte);
    } catch (err) {
      console.warn('Kon halte niet in Firestore opslaan:', err);
    }

    fetchLiveDepartures(newHalte);
  };

  // Save custom bus from Creator Studio
  const handleSaveBus = async (busData: Omit<CustomBus, 'id'>) => {
    const newBus: CustomBus = {
      ...busData,
      id: `bus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdByUserId: currentUser ? currentUser.uid : undefined,
    };

    setCustomBussen((prev) => [...prev, newBus]);

    try {
      await saveBusToFirestore(newBus);
    } catch (err) {
      console.warn('Fout bij opslaan bus in Firestore:', err);
    }

    playTransitChime();
  };

  // Delete custom bus
  const handleDeleteCustomBus = async (busId: string) => {
    setCustomBussen((prev) => prev.filter((b) => b.id !== busId));
    try {
      await deleteBusFromFirestore(busId);
    } catch (err) {
      console.warn('Fout bij verwijderen bus uit Firestore:', err);
    }
  };

  // Save custom halte from Creator Studio
  const handleSaveHalte = async (halteData: Omit<Halte, 'id'>) => {
    const newHalte: Halte = {
      ...halteData,
      id: `halte_${Date.now()}`,
      createdByUserId: currentUser ? currentUser.uid : undefined,
    };

    setHaltes((prev) => [...prev, newHalte]);
    setSelectedHalte(newHalte);
    setSourceModes((prev) => ({ ...prev, [newHalte.id]: 'custom' }));

    try {
      await saveHalteToFirestore(newHalte);
    } catch (err) {
      console.warn('Fout bij opslaan halte in Firestore:', err);
    }
  };

  // Delete custom halte
  const handleDeleteHalte = async (halteId: string) => {
    setHaltes((prev) => prev.filter((h) => h.id !== halteId));
    setCustomBussen((prev) => prev.filter((b) => b.halteId !== halteId));

    if (selectedHalte && selectedHalte.id === halteId) {
      const remaining = haltes.filter((h) => h.id !== halteId);
      setSelectedHalte(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      await deleteHalteFromFirestore(halteId);
    } catch (err) {
      console.warn('Fout bij verwijderen halte uit Firestore:', err);
    }
  };

  // Save Disruption report
  const handleSaveDisruption = async (
    disruptionData: Omit<LiveDisruption, 'id' | 'upvotes'>
  ) => {
    const newDisruption: LiveDisruption = {
      ...disruptionData,
      id: `disruption_${Date.now()}`,
      upvotes: 1,
    };

    setDisruptions((prev) => [newDisruption, ...prev]);

    try {
      await addDisruptionToFirestore({
        ...disruptionData,
        upvotes: 1,
      });
    } catch (err) {
      console.warn('Fout bij opslaan melding in Firestore:', err);
    }
  };

  // Route saving handlers
  const handleSaveUserRoute = async (routeData: Omit<SavedRoute, 'id' | 'createdAt'>) => {
    const routeId = await saveUserRouteToFirestore(routeData);
    playTransitChime();
    return routeId;
  };

  const handleDeleteUserRoute = async (routeId: string) => {
    await deleteUserRouteFromFirestore(routeId);
  };

  // DRGL Halte & Departures Import handlers
  const handleApplyDrglHalteAndDepartures = (newHalte: Halte, newDepartures: Departure[]) => {
    // Check if halte already exists in list
    const existingIndex = haltes.findIndex(
      (h) =>
        h.code === newHalte.code ||
        h.id === newHalte.id ||
        h.name.toLowerCase() === newHalte.name.toLowerCase()
    );

    let targetHalte = newHalte;
    if (existingIndex >= 0) {
      targetHalte = haltes[existingIndex];
      // Update drglUrl if not set
      if (!targetHalte.drglUrl && newHalte.drglUrl) {
        targetHalte = { ...targetHalte, drglUrl: newHalte.drglUrl };
        const updated = [...haltes];
        updated[existingIndex] = targetHalte;
        setHaltes(updated);
        localStorage.setItem('NCS_Haltes_v2', JSON.stringify(updated));
      }
    } else {
      const updated = [newHalte, ...haltes];
      setHaltes(updated);
      localStorage.setItem('NCS_Haltes_v2', JSON.stringify(updated));
      saveHalteToFirestore(newHalte).catch((e) =>
        console.warn('Cloud sync imported halte error:', e)
      );
    }

    setSelectedHalte(targetHalte);
    setSourceModes((prev) => {
      const next = { ...prev, [targetHalte.id]: 'live' as SourceMode };
      localStorage.setItem('NCS_SourceModes_v2', JSON.stringify(next));
      return next;
    });

    if (newDepartures && newDepartures.length > 0) {
      setLiveDepartures(newDepartures);
      setLastUpdated(new Date());
    } else {
      fetchLiveDepartures(targetHalte);
    }

    playTransitChime();
  };

  const handleSaveDrglAsCustomBuses = async (targetHalte: Halte, importedDepartures: Departure[]) => {
    const newBuses: CustomBus[] = importedDepartures.map((dep, idx) => ({
      id: `drgl_${targetHalte.code.replace(/[^a-zA-Z0-9]/g, '_')}_${dep.line}_${idx}`,
      line: dep.line,
      destination: dep.destination,
      time: dep.time,
      platform: dep.platform || 'Perron',
      status: dep.status || 'Op tijd',
      statusColor: dep.statusColor || 'text-emerald-400',
      type: dep.type,
      halteId: targetHalte.id,
      stops: dep.stops && dep.stops.length > 0
        ? dep.stops
        : [
            { name: targetHalte.name, time: dep.time },
            { name: dep.destination, time: dep.time },
          ],
      note: 'Geïmporteerd van DRGL.nl',
    }));

    setCustomBussen((prev) => {
      const map = new Map<string, CustomBus>();
      prev.forEach((b) => map.set(b.id, b));
      newBuses.forEach((b) => map.set(b.id, b));
      const combined = Array.from(map.values());
      localStorage.setItem('NCS_Bussen_v2', JSON.stringify(combined));
      return combined;
    });

    for (const b of newBuses) {
      await saveBusToFirestore(b).catch((e) =>
        console.warn('Save imported bus err:', e)
      );
    }
    playTransitChime();
  };

  // Reset Data
  const handleResetData = (mode: 'default' | 'clear') => {
    if (mode === 'clear') {
      setHaltes([]);
      setSelectedHalte(null);
      setCustomBussen([]);
      setSourceModes({});
      setLiveDepartures([]);
      localStorage.removeItem('NCS_Haltes_v2');
      localStorage.removeItem('NCS_Bussen_v2');
      localStorage.removeItem('NCS_SourceModes_v2');
    } else {
      setHaltes(DEFAULT_HALTES);
      setSelectedHalte(DEFAULT_HALTES[0]);
      setCustomBussen([]);
      setSourceModes({});
      localStorage.removeItem('NCS_Haltes_v2');
      localStorage.removeItem('NCS_Bussen_v2');
      localStorage.removeItem('NCS_SourceModes_v2');
      fetchLiveDepartures(DEFAULT_HALTES[0]);
    }
  };

  const getContainerThemeClasses = () => {
    switch (settings.themeMode) {
      case 'light-day':
        return 'bg-slate-100 text-slate-900';
      case 'dark-slate':
        return 'bg-slate-900 text-slate-100';
      case 'high-contrast':
        return 'bg-black text-white';
      case 'dark-midnight':
      default:
        return 'bg-[#020617] text-slate-200';
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white pb-20 md:pb-0 transition-colors duration-200 ${getContainerThemeClasses()}`}
    >
      {/* Bovenste Navigatiekop */}
      <Header
        firebaseConnected={firebaseConnected}
        lastUpdated={lastUpdated}
        onOpenPlanner={() => setPlannerOpen(true)}
        onOpenStudio={() => setStudioOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenImportDrgl={() => setDrglModalOpen(true)}
        currentUser={currentUser}
        savedRoutesCount={savedRoutes.length}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={async () => {
          await logoutUser();
        }}
      />

      {/* Hoofdvenster met 2 kolommen */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linker kolom: Stations, Haltes & Zoeken */}
        <section className="lg:col-span-4 space-y-4">
          <HalteSelector
            haltes={haltes}
            selectedHalteId={selectedHalte?.id || ''}
            onSelectHalte={(h) => setSelectedHalte(h)}
            onDeleteHalte={handleDeleteHalte}
            onOpenStudio={() => setStudioOpen(true)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddFoundStop={handleAddFoundStop}
            onOpenImportDrgl={() => setDrglModalOpen(true)}
          />
        </section>

        {/* Rechter kolom: Live Vertrekbord & Meldingen */}
        <section className="lg:col-span-8 space-y-4">
          {/* Live Verstoringen Ticker */}
          <LiveDisruptionsBar
            disruptions={disruptions}
            onReportClick={() => {
              setStudioOpen(true);
            }}
          />

          {/* Actueel Vertrekbord */}
          <DepartureBoard
            halte={selectedHalte}
            departures={displayDepartures}
            sourceMode={currentSourceMode}
            onSetSourceMode={handleSetSourceMode}
            isLoading={isLoadingDepartures}
            onRefresh={() => {
              if (selectedHalte) fetchLiveDepartures(selectedHalte);
            }}
            lastUpdated={lastUpdated}
            onDeleteCustomBus={handleDeleteCustomBus}
            onSelectBus={(bus) => setSelectedBusForDetail(bus)}
            settings={settings}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
        </section>
      </main>

      {/* Voettekst met Systeeminformatie & Telemetrie */}
      <footer className="bg-slate-950 border-t border-slate-800 px-4 md:px-6 py-3 shrink-0 text-[10px] text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <span>BREEDTE: 51.3700° N</span>
            <span>LENGTE: 6.1724° E</span>
            <span>HOOGTE: +23m (Knooppunt Venlo)</span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="text-slate-400 font-sans">
              BusApp Venlo • Speciaal voor <strong className="text-blue-400">Sem</strong> (Realtime OV-Netwerk)
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
              <span>LIVE API VERBONDEN</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
              <span>CLOUD SYNC ACTIEF</span>
            </span>
            <span className="text-slate-400">
              VERVERSEN: {settings.autoRefreshInterval > 0 ? `${settings.autoRefreshInterval} SEC` : 'HANDMATIG'}
            </span>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center gap-1"
              title="Klik om stijl aan te passen"
            >
              <Settings className="w-3 h-3" />
              <span>STIJL: {settings.themeMode.replace('dark-', '').replace('light-', '')}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobiele Navigatiebalk */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-md border-t border-slate-800 py-2.5 px-6 flex justify-around items-center md:hidden z-40 shadow-2xl">
        <button
          onClick={() => setMobileTab('bussen')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            mobileTab === 'bussen' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Vertrektijden</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('planner');
            setPlannerOpen(true);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            mobileTab === 'planner' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Reisplanner</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('studio');
            setStudioOpen(true);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            mobileTab === 'studio' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>NCS Studio</span>
        </button>

        <button
          onClick={() => {
            setSettingsModalOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors text-slate-400 hover:text-blue-400"
        >
          <Settings className="w-4 h-4" />
          <span>Stijl</span>
        </button>
      </div>

      {/* Reisplanner & Opgeslagen Routes Modal */}
      <TripPlannerModal
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        haltes={haltes}
        currentUser={currentUser}
        savedRoutes={savedRoutes}
        onSaveRoute={handleSaveUserRoute}
        onDeleteSavedRoute={handleDeleteUserRoute}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* NCS Creator Studio Modal */}
      <CreatorStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        haltes={haltes}
        onSaveBus={handleSaveBus}
        onSaveHalte={handleSaveHalte}
        onSaveDisruption={handleSaveDisruption}
        onResetData={handleResetData}
        firebaseConnected={firebaseConnected}
      />

      {/* Bus Ritdetails Modal */}
      <BusDetailModal
        bus={selectedBusForDetail}
        currentHalteName={selectedHalte?.name}
        onClose={() => setSelectedBusForDetail(null)}
      />

      {/* Authenticatie Modal (Google & E-mail) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Site Stijl & Weergave Instellingen Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
        currentUser={currentUser}
      />

      {/* DRGL.nl Halte & Tijden Import Modal */}
      <ImportDrglModal
        isOpen={drglModalOpen}
        onClose={() => setDrglModalOpen(false)}
        onApplyHalteAndDepartures={handleApplyDrglHalteAndDepartures}
        onSaveAsCustomBuses={handleSaveDrglAsCustomBuses}
        currentHalte={selectedHalte}
      />
    </div>
  );
}
