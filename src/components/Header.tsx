import React, { useState, useEffect } from 'react';
import { Bus, Volume2, VolumeX, Navigation, Cpu, Bookmark, LogIn, LogOut, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { playTransitChime } from '../utils/audio';
import { User } from 'firebase/auth';

interface HeaderProps {
  firebaseConnected: boolean;
  lastUpdated: Date | null;
  onOpenPlanner: () => void;
  onOpenStudio: () => void;
  currentUser: User | null;
  savedRoutesCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  firebaseConnected,
  lastUpdated,
  onOpenPlanner,
  onOpenStudio,
  currentUser,
  savedRoutesCount,
  onOpenAuth,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('nl-NL', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playTransitChime();
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#020617] sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-xl">
      {/* Brand: BusApp Venlo & Sem Editie */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/30 shrink-0">
          <Bus className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-2">
              BusApp Venlo <span className="text-slate-500 font-normal text-xs sm:text-sm">v4.2</span>
            </h1>
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
              Sem Editie
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400">
            Openbaar Vervoer Venlo & Regio • Realtime
          </p>
        </div>
      </div>

      {/* Action Controls & Telemetry */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Nav for Planner & Studio */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenPlanner}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded text-xs font-medium border border-slate-700/60 flex items-center gap-1.5 transition-colors"
            title="Open Reisplanner en opgeslagen routes"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Reisplanner</span>
            {savedRoutesCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {savedRoutesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenStudio}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium tracking-wide flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-900/30"
            title="Open NCS Creator Studio om eigen bussen en haltes te maken"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Creator Studio</span>
          </button>
        </div>

        {/* User Inloggen / Profiel knop */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs transition-colors"
              title="Gebruikersprofiel beheren"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Gebruiker'}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="hidden md:inline font-medium max-w-[110px] truncate text-slate-100">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {currentUser.displayName || 'Aangemelde Gebruiker'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {currentUser.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Cloud-opslag ingeschakeld
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenPlanner();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                      Mijn Opgeslagen Routes
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">
                      {savedRoutesCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Uitloggen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-900/30"
            title="Inloggen met Google of e-mail"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Inloggen</span>
          </button>
        )}

        {/* Sound Chime Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded border transition-all text-xs flex items-center justify-center ${
            soundEnabled
              ? 'bg-slate-800/80 border-slate-700 text-blue-400'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
          title={soundEnabled ? 'Stationsbel staat AAN' : 'Stationsbel staat UIT'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Live Firebase Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
            {firebaseConnected ? 'Firebase Cloud: Verbonden' : 'Lokale Opslag'}
          </span>
        </div>

        {/* Time & Region */}
        <div className="text-right hidden sm:block">
          <div className="text-sm font-mono text-slate-300 font-semibold">
            {timeStr || '14:42:08'}
          </div>
          <div className="text-[10px] uppercase text-slate-500 tracking-widest">
            Venlo/CET
          </div>
        </div>
      </div>
    </header>
  );
};


