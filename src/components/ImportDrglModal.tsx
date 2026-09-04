import React, { useState } from 'react';
import {
  X,
  DownloadCloud,
  Globe,
  CheckCircle,
  Loader2,
  ExternalLink,
  ArrowRight,
  Bus,
  Save,
  Radio,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Halte, Departure, CustomBus } from '../types';

interface ImportDrglModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyHalteAndDepartures: (halte: Halte, departures: Departure[]) => void;
  onSaveAsCustomBuses?: (halte: Halte, departures: Departure[]) => Promise<void>;
  currentHalte?: Halte | null;
}

export const ImportDrglModal: React.FC<ImportDrglModalProps> = ({
  isOpen,
  onClose,
  onApplyHalteAndDepartures,
  onSaveAsCustomBuses,
}) => {
  const [urlInput, setUrlInput] = useState<string>('https://drgl.nl/stop/NL:S:69000900');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [importResult, setImportResult] = useState<{
    halte: Halte;
    departures: Departure[];
    count: number;
    title: string;
  } | null>(null);
  const [isSavingCustom, setIsSavingCustom] = useState<boolean>(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFetchDrgl = async (urlToFetch?: string) => {
    const targetUrl = (urlToFetch || urlInput).trim();
    if (!targetUrl) {
      setError('Vul een geldige DRGL halte-link of haltecode in');
      return;
    }

    setIsLoading(true);
    setError('');
    setSavedSuccessMsg('');

    try {
      const res = await fetch(`/api/ov/import-drgl?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Kon halte niet ophalen van DRGL');
      }

      setImportResult({
        halte: data.halte,
        departures: data.departures || [],
        count: data.count || (data.departures ? data.departures.length : 0),
        title: data.title || data.halte.name,
      });
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het importeren');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToBoard = () => {
    if (!importResult) return;
    onApplyHalteAndDepartures(importResult.halte, importResult.departures);
    onClose();
  };

  const handleSaveToCreatorStudio = async () => {
    if (!importResult || !onSaveAsCustomBuses) return;
    setIsSavingCustom(true);
    try {
      await onSaveAsCustomBuses(importResult.halte, importResult.departures);
      setSavedSuccessMsg(
        `Succesvol ${importResult.departures.length} ritten opgeslagen in Sem's Creator Mode & Firebase!`
      );
      setTimeout(() => {
        onApplyHalteAndDepartures(importResult.halte, importResult.departures);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError('Fout bij opslaan in Creator Studio: ' + err.message);
    } finally {
      setIsSavingCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold shadow-sm shadow-blue-900/30 shrink-0">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>DRGL.nl Tijden Importeren</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                  Live OV
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Importeer actuele vertrektijden en haltes direct via drgl.nl
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Preset for Station Venlo */}
          <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-200">
                  Gevraagde link: Station Venlo
                </span>
              </div>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                NL:S:69000900
              </span>
            </div>
            <p className="text-xs text-slate-300">
              <span className="font-semibold text-white">Busstation Station Venlo (Stationsplein)</span>
              {' '}- Officiële realtime tijden van Arriva Limburg.
            </p>
            <button
              onClick={() => {
                setUrlInput('https://drgl.nl/stop/NL:S:69000900');
                handleFetchDrgl('https://drgl.nl/stop/NL:S:69000900');
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow transition-colors"
            >
              {isLoading && urlInput.includes('69000900') ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Importeer direct https://drgl.nl/stop/NL:S:69000900</span>
            </button>
          </div>

          {/* Custom Link / Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Of plak een andere DRGL stop link of haltecode:</span>
              <a
                href="https://drgl.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>drgl.nl openen</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="bijv. https://drgl.nl/stop/NL:S:69000900"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => handleFetchDrgl()}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                <span>Ophalen</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Saved Success Message */}
          {savedSuccessMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {/* Import Result Preview */}
          {importResult && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Gevonden Halte:
                  </span>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{importResult.title}</span>
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {importResult.count} ritten live
                  </span>
                </div>
              </div>

              {/* Departures mini preview list */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-900 text-xs">
                {importResult.departures.slice(0, 10).map((dep) => (
                  <div key={dep.id} className="p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className="px-1.5 py-0.5 rounded text-[11px] font-bold min-w-[28px] text-center"
                        style={{
                          backgroundColor: dep.lineColor || '#2563eb',
                          color: dep.lineTextColor || '#ffffff',
                        }}
                      >
                        {dep.line}
                      </span>
                      <span className="text-slate-200 truncate">{dep.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-slate-300 font-medium">{dep.time}</span>
                      <span className="text-[10px] text-slate-500">{dep.platform}</span>
                    </div>
                  </div>
                ))}
                {importResult.count > 10 && (
                  <div className="p-2 text-center text-slate-500 text-[11px] bg-slate-900/30">
                    + nog {importResult.count - 10} extra actuele ritten beschikbaar
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleApplyToBoard}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
                >
                  <Radio className="w-4 h-4" />
                  <span>Toon direct op Vertrekbord</span>
                </button>

                {onSaveAsCustomBuses && (
                  <button
                    onClick={handleSaveToCreatorStudio}
                    disabled={isSavingCustom}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    {isSavingCustom ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    ) : (
                      <Save className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Opslaan in Creator Studio</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Ondersteunt alle NDOV / CHB / Arriva DRGL haltes</span>
          <button onClick={onClose} className="hover:text-slate-300 transition-colors">
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
