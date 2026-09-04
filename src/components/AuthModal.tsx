import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code.includes('popup-closed-by-user')) {
      return 'Inlogvenster is gesloten voor afronding.';
    }
    if (code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('user-not-found')) {
      return 'Ongeldig e-mailadres of wachtwoord. Controleer je gegevens.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Dit e-mailadres is al in gebruik. Kies voor inloggen.';
    }
    if (code.includes('weak-password')) {
      return 'Het wachtwoord moet minimaal 6 tekens bevatten.';
    }
    if (code.includes('invalid-email')) {
      return 'Voer een geldig e-mailadres in.';
    }
    if (code.includes('network-request-failed')) {
      return 'Netwerkfout. Controleer je internetverbinding.';
    }
    return err?.message || 'Er is een onbekende fout opgetreden bij het inloggen.';
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await loginWithGoogle();
      setSuccessMsg('Succesvol ingelogd met Google!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vul zowel je e-mailadres als een wachtwoord in.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Het wachtwoord moet minimaal 6 tekens lang zijn.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
        setSuccessMsg('Welkom terug! Succesvol ingelogd.');
      } else {
        await registerWithEmail(email.trim(), password, name.trim() || undefined);
        setSuccessMsg('Account succesvol aangemaakt! Welkom bij BusApp Venlo.');
      }
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Sluitknop */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
          title="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Titel & Uitleg */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 bg-blue-600 text-white rounded flex items-center justify-center font-bold shadow-sm shadow-blue-900/30 shrink-0">
            <LogIn className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {mode === 'login' ? 'Inloggen bij BusApp Venlo' : 'Account Aanmaken'}
            </h3>
            <p className="text-xs text-slate-400">
              Bewaar en synchroniseer je gemaakte routes en favorieten
            </p>
          </div>
        </div>

        {/* Tab switchers: Inloggen / Registreren */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
              mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inloggen
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
              mode === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nieuw Account
          </button>
        </div>

        {/* Meldingen */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Inlogknop */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-slate-800 hover:bg-slate-700/80 text-slate-100 border border-slate-700 font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Doorgaan met Google</span>
        </button>

        {/* Scheidingslijn */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">
              of via e-mail
            </span>
          </div>
        </div>

        {/* E-mail Formulier */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Jouw Naam (Optioneel)
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bijv. Sem of Reiziger"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimaal 6 tekens"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs tracking-wider transition-colors shadow-sm shadow-blue-900/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Bezig met verwerken...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Inloggen met E-mail</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Account Registreren</span>
              </>
            )}
          </button>
        </form>

        {/* Voettekst met Cloud info */}
        <p className="mt-4 text-[10px] text-center text-slate-500">
          Beveiligd via Firebase Authentication & Firestore Cloud Sync
        </p>
      </div>
    </div>
  );
};
