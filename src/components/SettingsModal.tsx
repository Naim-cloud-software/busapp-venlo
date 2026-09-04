import React, { useState } from 'react';
import {
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  Clock,
  Volume2,
  VolumeX,
  Zap,
  CloudCheck,
  Shield,
  Layers,
  Type,
} from 'lucide-react';
import { SiteSettings, ThemeMode, AccentColor, DisplayDensity, TimeFormat, TextSize } from '../types';
import { ACCENT_PALETTES, THEME_MODES } from '../utils/themeHelper';
import { User } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  onResetSettings: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
  currentUser,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'display' | 'system'>('appearance');
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentAccent = ACCENT_PALETTES[settings.accentColor] || ACCENT_PALETTES.blue;
  const currentTheme = THEME_MODES[settings.themeMode] || THEME_MODES['dark-midnight'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          currentTheme.isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
            : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            currentTheme.isLight
              ? 'border-slate-200 bg-slate-50'
              : 'border-slate-800 bg-slate-950/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${currentAccent.btnBg}`}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Site Stijl & Instellingen</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${currentAccent.badgeBg} ${currentAccent.badgeText} border ${currentAccent.border}`}
                >
                  Personaliseer
                </span>
              </h2>
              <p
                className={`text-xs ${
                  currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Pas het kleurenpalet, de helderheid en de weergave naar wens aan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              currentTheme.isLight
                ? 'hover:bg-slate-200 text-slate-600'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex border-b px-5 shrink-0 gap-2 ${
            currentTheme.isLight ? 'border-slate-200 bg-slate-100/60' : 'border-slate-800 bg-slate-950/40'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'appearance'
                ? `${currentAccent.text} border-current`
                : currentTheme.isLight
                ? 'text-slate-500 border-transparent hover:text-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vormgeving & Kleur</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('display')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'display'
                ? `${currentAccent.text} border-current`
                : currentTheme.isLight
                ? 'text-slate-500 border-transparent hover:text-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Weergave & Bord</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'system'
                ? `${currentAccent.text} border-current`
                : currentTheme.isLight
                ? 'text-slate-500 border-transparent hover:text-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Systeem & Verversen</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: VORMGEVING */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Modus / Helderheid */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    currentTheme.isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Achtergrond & Thema-modus</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(THEME_MODES) as ThemeMode[]).map((modeKey) => {
                    const mode = THEME_MODES[modeKey];
                    const isSelected = settings.themeMode === modeKey;

                    return (
                      <button
                        key={modeKey}
                        type="button"
                        onClick={() => onUpdateSettings({ themeMode: modeKey })}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? `${currentAccent.border} ring-2 ${currentAccent.ring} ${
                                mode.isLight
                                  ? 'bg-blue-50/70 border-blue-400'
                                  : 'bg-slate-800/90 border-slate-700'
                              }`
                            : currentTheme.isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            {mode.isLight ? (
                              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : modeKey === 'high-contrast' ? (
                              <Eye className="w-4 h-4 text-white shrink-0" />
                            ) : (
                              <Moon className="w-4 h-4 text-blue-400 shrink-0" />
                            )}
                            {mode.name}
                          </span>
                          {isSelected && (
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${currentAccent.btnBg}`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed ${
                            currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {mode.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accentkleur */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    currentTheme.isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Huisstijl Accentkleur</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((accentKey) => {
                    const item = ACCENT_PALETTES[accentKey];
                    const isSelected = settings.accentColor === accentKey;

                    return (
                      <button
                        key={accentKey}
                        type="button"
                        onClick={() => onUpdateSettings({ accentColor: accentKey })}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? `${item.border} ring-2 ${item.ring} ${
                                currentTheme.isLight ? 'bg-slate-100' : 'bg-slate-800'
                              }`
                            : currentTheme.isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white"
                          style={{ backgroundColor: item.hex }}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.name}</div>
                          <div
                            className={`text-[10px] truncate ${
                              currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {item.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Kaart */}
              <div
                className={`p-4 rounded-xl border ${
                  currentTheme.isLight
                    ? 'bg-slate-100/70 border-slate-300'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  <span>Live Stijl Voorbeeld</span>
                </div>

                <div
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    currentTheme.isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm ${currentAccent.btnBg}`}
                    >
                      Lijn 3
                    </span>
                    <div>
                      <div className="text-xs font-bold">Venlo, Ziekenhuis VieCuri</div>
                      <div
                        className={`text-[10px] ${
                          currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        Arriva Limburg • Perron 2 •{' '}
                        <span className={currentAccent.text}>Via: Walstraat (14:32)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono text-xs font-bold ${currentAccent.text}`}>
                      14:30
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${currentAccent.badgeBg} ${currentAccent.badgeText}`}
                    >
                      Op tijd
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEERGAVE & BORD */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Dichtheid */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    currentTheme.isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Weergavedichtheid van het vertrekbord</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ density: 'normal' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.density === 'normal'
                        ? `${currentAccent.border} ring-2 ${currentAccent.ring} ${
                            currentTheme.isLight ? 'bg-slate-100' : 'bg-slate-800'
                          }`
                        : currentTheme.isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Normaal (Comfortabel)</div>
                    <div
                      className={`text-[11px] ${
                        currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Ruimere regelafstand en makkelijk klikbare knoppen.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ density: 'compact' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.density === 'compact'
                        ? `${currentAccent.border} ring-2 ${currentAccent.ring} ${
                            currentTheme.isLight ? 'bg-slate-100' : 'bg-slate-800'
                          }`
                        : currentTheme.isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Compact (Data-dense)</div>
                    <div
                      className={`text-[11px] ${
                        currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Strakkere regels zodat er meer bussen op je scherm passen.
                    </div>
                  </button>
                </div>
              </div>

              {/* Tijdformaat */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    currentTheme.isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Tijdsaanduiding Vertrektijden</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'both', label: 'Beide', sub: '14:35 + over 5 min' },
                    { id: 'exact', label: 'Exacte Kloktijd', sub: '14:35:00' },
                    { id: 'relative', label: 'Aftellen', sub: 'over 5 min' },
                  ].map((tf) => {
                    const isSelected = settings.timeFormat === tf.id;
                    return (
                      <button
                        key={tf.id}
                        type="button"
                        onClick={() => onUpdateSettings({ timeFormat: tf.id as TimeFormat })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${currentAccent.border} ring-2 ${currentAccent.ring} ${
                                currentTheme.isLight ? 'bg-slate-100' : 'bg-slate-800'
                              }`
                            : currentTheme.isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{tf.label}</div>
                        <div
                          className={`text-[10px] mt-0.5 font-mono ${
                            currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {tf.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lettergrootte & Toegankelijkheid */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    currentTheme.isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Tekstgrootte</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ textSize: 'normal' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.textSize === 'normal'
                        ? `${currentAccent.border} ring-2 ${currentAccent.ring} ${
                            currentTheme.isLight ? 'bg-slate-100' : 'bg-slate-800'
                          }`
                        : currentTheme.isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">Standaard (100%)</div>
                    <div
                      className={`text-[11px] ${
                        currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Geoptimaliseerd voor laptops en smartphones.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ textSize: 'large' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.textSize === 'large'
                        ? `${currentAccent.border} ring-2 ${currentAccent.ring} ${
                            currentTheme.isLight ? 'bg-slate-100' : 'bg-slate-800'
                          }`
                        : currentTheme.isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="text-sm font-bold">Groot & Duidelijk (+15%)</div>
                    <div
                      className={`text-[11px] ${
                        currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Grotere letters, ideaal bij mindere zichtbaarheid of onderweg.
                    </div>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  currentTheme.isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold">Tussenhaltes preview tonen</div>
                    <div
                      className={`text-[10px] ${
                        currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Toon direct de tussenliggende stops en tijden onder de bestemmingsnaam.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showStopsPreview}
                    onChange={(e) => onUpdateSettings({ showStopsPreview: e.target.checked })}
                    className={`w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer`}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/40 pt-3">
                  <div>
                    <div className="text-xs font-semibold">Extra hoog contrast lijnnummers</div>
                    <div
                      className={`text-[10px] ${
                        currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Witte felle tekst met donkere achtergrond voor alle lijnnummers.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.highContrastLines}
                    onChange={(e) => onUpdateSettings({ highContrastLines: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEEM & VERVERSEN */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* Automatisch verversen */}
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                    currentTheme.isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Automatische live verversingsinterval</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { val: 15, label: '15 seconden', sub: 'Ultra snel' },
                    { val: 30, label: '30 seconden', sub: 'Aanbevolen' },
                    { val: 45, label: '45 seconden', sub: 'Gebalanceerd' },
                    { val: 0, label: 'Handmatig', sub: 'Bespaar data' },
                  ].map((opt) => {
                    const isSelected = settings.autoRefreshInterval === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => onUpdateSettings({ autoRefreshInterval: opt.val })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${currentAccent.border} ring-2 ${currentAccent.ring} ${
                                currentTheme.isLight ? 'bg-slate-100' : 'bg-slate-800'
                              }`
                            : currentTheme.isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {opt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Geluid & Toegankelijkheid */}
              <div
                className={`p-4 rounded-xl border space-y-3.5 ${
                  currentTheme.isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {settings.soundEffects ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <div className="text-xs font-semibold">Stationsbel & Geluidseffecten</div>
                      <div
                        className={`text-[10px] ${
                          currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        Speelt een subtiel chime-geluid bij vertrek of meldingen.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/40 pt-3.5">
                  <div>
                    <div className="text-xs font-semibold">Gereduceerde beweging (Batterijbesparing)</div>
                    <div
                      className={`text-[10px] ${
                        currentTheme.isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Schakelt pulserende achtergrondanimaties en overgangen uit.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Cloud Sync Status */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  currentUser
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-blue-950/20 border-blue-500/30 text-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {currentUser ? (
                    <CloudCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold">
                      {currentUser
                        ? 'Gesynchroniseerd via Firebase Cloud'
                        : 'Lokale opslag actief (Browser)'}
                    </div>
                    <div className="text-[11px] opacity-80">
                      {currentUser
                        ? `Aangemeld als ${currentUser.email}. Jouw thema-instellingen zijn opgeslagen.`
                        : 'Log in met Google of e-mail om je instellingen overal mee te nemen.'}
                    </div>
                  </div>
                </div>

                {!currentUser && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm"
                  >
                    Inloggen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Reset & Close */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between shrink-0 ${
            currentTheme.isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
          }`}
        >
          <div>
            {resetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-medium">Zeker weten?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetSettings();
                    setResetConfirm(false);
                  }}
                  className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded font-bold"
                >
                  Ja, herstel
                </button>
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                >
                  Annuleren
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                className={`text-xs flex items-center gap-1.5 transition-colors ${
                  currentTheme.isLight
                    ? 'text-slate-500 hover:text-red-600'
                    : 'text-slate-400 hover:text-red-400'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Herstel standaardinstellingen</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${currentAccent.btnBg} ${currentAccent.btnHover}`}
          >
            Instellingen Toepassen
          </button>
        </div>
      </div>
    </div>
  );
};
