import React, { useState } from 'react';
import {
  X,
  Cpu,
  Plus,
  Bus,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Trash2,
  CheckCircle,
  Cloud,
  Database,
  Sparkles,
} from 'lucide-react';
import { Halte, CustomBus, LiveDisruption } from '../types';
import { generateScheduleForLine } from '../utils/routeCatalog';

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  haltes: Halte[];
  onSaveBus: (bus: Omit<CustomBus, 'id'>) => Promise<void>;
  onSaveHalte: (halte: Omit<Halte, 'id'>) => Promise<void>;
  onSaveDisruption: (disruption: Omit<LiveDisruption, 'id' | 'upvotes'>) => Promise<void>;
  onResetData: (mode: 'default' | 'clear') => void;
  firebaseConnected: boolean;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  isOpen,
  onClose,
  haltes,
  onSaveBus,
  onSaveHalte,
  onSaveDisruption,
  onResetData,
  firebaseConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'bus' | 'halte' | 'disruption' | 'manage'>('bus');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Bus Form State
  const [busLine, setBusLine] = useState<string>('');
  const [busType, setBusType] = useState<'stads' | 'streek' | 'express'>('stads');
  const [busDest, setBusDest] = useState<string>('');
  const [busTime, setBusTime] = useState<string>('12:30');
  const [busPlatform, setBusPlatform] = useState<string>('Perron A');
  const [busStatus, setBusStatus] = useState<string>('Op tijd|text-emerald-400');
  const [busHalteId, setBusHalteId] = useState<string>(haltes[0]?.id || '');
  const [busNote, setBusNote] = useState<string>('');

  // Halte Form State
  const [halteName, setHalteName] = useState<string>('');
  const [halteType, setHalteType] = useState<string>('Stadshalte & Hotspot');
  const [halteIcon, setHalteIcon] = useState<string>('map-pin');
  const [halteCity, setHalteCity] = useState<string>('Venlo');
  const [halteCode, setHalteCode] = useState<string>('CUSTOM');

  // Disruption Form State
  const [disrLine, setDisrLine] = useState<string>('2');
  const [disrTitle, setDisrTitle] = useState<string>('');
  const [disrDesc, setDisrDesc] = useState<string>('');
  const [disrSeverity, setDisrSeverity] = useState<'info' | 'warning' | 'critical'>('warning');
  const [reporterName, setReporterName] = useState<string>('Sem');

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busLine || !busDest || !busTime || !busHalteId) return;

    const [statusText, statusColor] = busStatus.split('|');
    const curHalte = haltes.find((h) => h.id === busHalteId);
    const generatedStops = generateScheduleForLine(
      busLine.trim(),
      busDest.trim(),
      busTime,
      undefined,
      curHalte?.name
    );

    setIsSubmitting(true);
    try {
      await onSaveBus({
        halteId: busHalteId,
        line: busLine.trim(),
        destination: busDest.trim(),
        time: busTime,
        platform: busPlatform.trim() || 'Spoor 1',
        status: statusText,
        statusColor: statusColor || 'text-emerald-400',
        type: busType,
        note: busNote.trim() || undefined,
        createdAt: new Date().toISOString(),
        stops: generatedStops,
      });

      setBusLine('');
      setBusDest('');
      setBusNote('');
      showNotification(`Busrit ${busLine} naar ${busDest} (${generatedStops.length} haltes) opgeslagen in Firebase!`);
    } catch (err: any) {
      console.warn('Error saving bus:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHalteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!halteName || !halteType) return;

    setIsSubmitting(true);
    try {
      let cleanCode = halteCode.trim() || 'CUSTOM';
      let drglUrl: string | undefined;
      const urlMatch = cleanCode.match(/stop\/([a-zA-Z0-9:_]+)/i);
      if (urlMatch) {
        drglUrl = cleanCode.startsWith('http') ? cleanCode : `https://${cleanCode}`;
        cleanCode = urlMatch[1];
      } else if (cleanCode !== 'CUSTOM' && cleanCode.includes(':')) {
        drglUrl = `https://drgl.nl/stop/${cleanCode}`;
      }

      await onSaveHalte({
        name: halteName.trim(),
        type: halteType.trim(),
        icon: halteIcon,
        city: halteCity.trim() || 'Venlo',
        code: cleanCode,
        drglUrl,
        custom: true,
        createdAt: new Date().toISOString(),
      });

      setHalteName('');
      setHalteCode('CUSTOM');
      showNotification(`Halte "${halteName}" toegevoegd aan netwerk!`);
    } catch (err: any) {
      console.warn('Error saving halte:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisruptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disrTitle || !disrDesc) return;

    setIsSubmitting(true);
    try {
      await onSaveDisruption({
        line: disrLine.trim(),
        title: disrTitle.trim(),
        description: disrDesc.trim(),
        severity: disrSeverity,
        timestamp: new Date().toISOString(),
        reportedBy: reporterName.trim() || 'Passagier',
      });

      setDisrTitle('');
      setDisrDesc('');
      showNotification(`Melding voor lijn ${disrLine} live verzonden!`);
    } catch (err: any) {
      console.warn('Error saving disruption:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold shadow-sm shadow-blue-900/30 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  NCS Creator Studio
                </h3>
                <span className="text-[10px] font-mono uppercase bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                  Transit Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Live Cloud Synchronisatie via <span className="text-blue-400 font-medium">Firebase Firestore</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 bg-slate-950 p-1.5 border-b border-slate-800 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('bus')}
            className={`py-2 px-1 text-center rounded transition-colors ${
              activeTab === 'bus'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rit Plannen
          </button>
          <button
            onClick={() => setActiveTab('halte')}
            className={`py-2 px-1 text-center rounded transition-colors ${
              activeTab === 'halte'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Halte Bouwen
          </button>
          <button
            onClick={() => setActiveTab('disruption')}
            className={`py-2 px-1 text-center rounded transition-colors ${
              activeTab === 'disruption'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Storingsmelder
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 text-center rounded transition-colors ${
              activeTab === 'manage'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Beheer
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 px-4 py-2 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* TAB 1: RIT TOEVOEGEN */}
          {activeTab === 'bus' && (
            <form onSubmit={handleBusSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Lijnnummer
                  </label>
                  <input
                    type="text"
                    required
                    value={busLine}
                    onChange={(e) => setBusLine(e.target.value)}
                    placeholder="Bijv. 83 of Sem Express"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Type Lijn
                  </label>
                  <select
                    value={busType}
                    onChange={(e) => setBusType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="stads">Stadsbus (Blauw)</option>
                    <option value="streek">Streekvervoer (Groen)</option>
                    <option value="express">Express / Sneldienst (Goud)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Eindbestemming
                </label>
                <input
                  type="text"
                  required
                  value={busDest}
                  onChange={(e) => setBusDest(e.target.value)}
                  placeholder="Bijv. Sems Thuis / Roermond / Blerick"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Vertrektijd
                  </label>
                  <input
                    type="time"
                    required
                    value={busTime}
                    onChange={(e) => setBusTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Perron / Spoor
                  </label>
                  <input
                    type="text"
                    value={busPlatform}
                    onChange={(e) => setBusPlatform(e.target.value)}
                    placeholder="Bijv. Perron A of Spoor 1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Status & Vertraging
                </label>
                <select
                  value={busStatus}
                  onChange={(e) => setBusStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Op tijd|text-emerald-400">Op tijd (Groen)</option>
                  <option value="+3 min|text-amber-400 font-bold">+3 min vertraging</option>
                  <option value="+8 min|text-rose-400 font-bold">+8 min vertraging</option>
                  <option value="Vervallen|text-slate-500 line-through">Vervallen</option>
                  <option value="Sem Express 🚀|text-blue-400 font-bold animate-pulse">
                    Sem Express 🚀 (Special)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Koppel aan Halte
                </label>
                <select
                  value={busHalteId}
                  onChange={(e) => setBusHalteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {haltes.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city || 'Venlo'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Extra Reisnotitie (Optioneel)
                </label>
                <input
                  type="text"
                  value={busNote}
                  onChange={(e) => setBusNote(e.target.value)}
                  placeholder="Bijv. Rijdt via Fontys en VieCuri"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-md shadow-blue-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Opslaan in Cloud...' : 'Rit Inplannen & Publiceren'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: HALTE BOUWEN */}
          {activeTab === 'halte' && (
            <form onSubmit={handleHalteSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Haltenaam
                </label>
                <input
                  type="text"
                  required
                  value={halteName}
                  onChange={(e) => setHalteName(e.target.value)}
                  placeholder="Bijv. Venlo, Sems Studio of Blerick Kazerne"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Locatietype
                  </label>
                  <input
                    type="text"
                    required
                    value={halteType}
                    onChange={(e) => setHalteType(e.target.value)}
                    placeholder="Bijv. Campus, Studio, Wijkhalte"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Stad / Plaats
                  </label>
                  <input
                    type="text"
                    value={halteCity}
                    onChange={(e) => setHalteCity(e.target.value)}
                    placeholder="Venlo, Blerick, Tegelen..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Icoontype
                  </label>
                  <select
                    value={halteIcon}
                    onChange={(e) => setHalteIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="map-pin">Locatie pin</option>
                    <option value="train">Treinstation / Hub</option>
                    <option value="home">Huis / Woonwijk</option>
                    <option value="briefcase">Kantoor / Werk</option>
                    <option value="school">School / Fontys</option>
                    <option value="activity">Ziekenhuis / Medisch</option>
                    <option value="terminal">Developer terminal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    OV Netwerk Code (Optioneel)
                  </label>
                  <input
                    type="text"
                    value={halteCode}
                    onChange={(e) => setHalteCode(e.target.value)}
                    placeholder="CUSTOM of NL:S:..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-md shadow-blue-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" />
                <span>{isSubmitting ? 'Bouwen...' : 'Halte Toevoegen & Syncen'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: STORINGSMELDER */}
          {activeTab === 'disruption' && (
            <form onSubmit={handleDisruptionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Betrokken Lijn
                  </label>
                  <input
                    type="text"
                    required
                    value={disrLine}
                    onChange={(e) => setDisrLine(e.target.value)}
                    placeholder="Bijv. 2, 83, 372"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Ernst
                  </label>
                  <select
                    value={disrSeverity}
                    onChange={(e) => setDisrSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="warning">Vertraging / Hinder (Oranje)</option>
                    <option value="critical">Rit Uitgevallen (Rood)</option>
                    <option value="info">Omleiding / Mededeling (Blauw)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Korte Titel
                </label>
                <input
                  type="text"
                  required
                  value={disrTitle}
                  onChange={(e) => setDisrTitle(e.target.value)}
                  placeholder="Bijv. 10 minuten vertraging op Zuiderbrug"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Toelichting & Advies
                </label>
                <textarea
                  rows={2}
                  required
                  value={disrDesc}
                  onChange={(e) => setDisrDesc(e.target.value)}
                  placeholder="Bijv. Wegens drukte en werkzaamheden bij VieCuri loopt bus 2 vertraging op."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Gemeld door
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Jouw naam"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-md shadow-blue-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isSubmitting ? 'Versturen...' : 'Live Melding Plaatsen'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: BEHEER & CLOUD */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* Cloud Status Card */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-white">Firebase Firestore</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      firebaseConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {firebaseConnected ? 'ONLINE • VERBONDEN' : 'STANDBY'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Alle custom haltes, ritten en passagiersmeldingen worden direct gesynchroniseerd in
                  je Firebase Firestore database.
                </p>
              </div>

              {/* Reset Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Data Reset & Netwerk Herstel
                </h4>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Weet je zeker dat je de standaard Venlo haltes en dienstregeling wilt herstellen?'
                        )
                      ) {
                        onResetData('default');
                        showNotification('Standaard Venlo haltes hersteld.');
                      }
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    <span>Herstel Venlo Netwerk</span>
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Weet je zeker dat je alle haltes en ritten wilt wissen om met een blanco blad te beginnen?'
                        )
                      ) {
                        onResetData('clear');
                        showNotification('Alle data gewist.');
                      }
                    }}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 px-4 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Wis Alles</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
