import { AccentColor, ThemeMode, SiteSettings, DEFAULT_SITE_SETTINGS } from '../types';

export interface AccentConfig {
  id: AccentColor;
  name: string;
  sub: string;
  hex: string;
  btnBg: string;
  btnHover: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  ring: string;
  activePill: string;
}

export const ACCENT_PALETTES: Record<AccentColor, AccentConfig> = {
  blue: {
    id: 'blue',
    name: 'Arriva Blauw',
    sub: 'Officiële Limburg OV huisstijl',
    hex: '#3b82f6',
    btnBg: 'bg-blue-600',
    btnHover: 'hover:bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    ring: 'ring-blue-500',
    activePill: 'bg-blue-600 text-white',
  },
  amber: {
    id: 'amber',
    name: 'Venlo Goud / Amber',
    sub: 'Warm stadsthema & Knooppunt Venlo',
    hex: '#f59e0b',
    btnBg: 'bg-amber-600',
    btnHover: 'hover:bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    ring: 'ring-amber-500',
    activePill: 'bg-amber-600 text-white',
  },
  emerald: {
    id: 'emerald',
    name: 'Limburg Smaragd',
    sub: 'Fris groen & Duurzaam elektrisch OV',
    hex: '#10b981',
    btnBg: 'bg-emerald-600',
    btnHover: 'hover:bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    ring: 'ring-emerald-500',
    activePill: 'bg-emerald-600 text-white',
  },
  rose: {
    id: 'rose',
    name: 'Karmijn Rood',
    sub: 'R-net / Sneldienst dynamiek',
    hex: '#f43f5e',
    btnBg: 'bg-rose-600',
    btnHover: 'hover:bg-rose-500',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-300',
    ring: 'ring-rose-500',
    activePill: 'bg-rose-600 text-white',
  },
  purple: {
    id: 'purple',
    name: 'NCS Amethist',
    sub: 'NCS Studio modern paars',
    hex: '#a855f7',
    btnBg: 'bg-purple-600',
    btnHover: 'hover:bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    ring: 'ring-purple-500',
    activePill: 'bg-purple-600 text-white',
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyaan',
    sub: 'Heldere moderne hightech display',
    hex: '#06b6d4',
    btnBg: 'bg-cyan-600',
    btnHover: 'hover:bg-cyan-500',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    ring: 'ring-cyan-500',
    activePill: 'bg-cyan-600 text-white',
  },
};

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  description: string;
  bgHex: string;
  cardHex: string;
  isLight: boolean;
}

export const THEME_MODES: Record<ThemeMode, ThemeConfig> = {
  'dark-midnight': {
    id: 'dark-midnight',
    name: 'Nacht Diepblauw (OLED)',
    description: 'Diep nachtblauw voor rustig zicht en contrast in het donker.',
    bgHex: '#020617',
    cardHex: '#0f172a',
    isLight: false,
  },
  'dark-slate': {
    id: 'dark-slate',
    name: 'Modern Grafiet',
    description: 'Neutraal antraciet donker thema voor een strakke minimalistische look.',
    bgHex: '#090d16',
    cardHex: '#131b2a',
    isLight: false,
  },
  'light-day': {
    id: 'light-day',
    name: 'Daglicht / Helder',
    description: 'Fris en helder wit thema, optimaal afleesbaar buiten in de felle zon.',
    bgHex: '#f1f5f9',
    cardHex: '#ffffff',
    isLight: true,
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'Hoog Contrast (Toegankelijk)',
    description: 'Diepzwart met maximale randen en scherpste letters voor optimale leesbaarheid.',
    bgHex: '#000000',
    cardHex: '#0a0a0a',
    isLight: false,
  },
};

const STORAGE_KEY = 'busapp_venlo_site_settings_v1';

export function loadSettingsFromStorage(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: SiteSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Kon instellingen niet lokaal opslaan:', err);
  }
}

export function applyThemeToDocument(settings: SiteSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-theme', settings.themeMode);
  root.setAttribute('data-accent', settings.accentColor);
  root.setAttribute('data-density', settings.density);
  root.setAttribute('data-textsize', settings.textSize);

  const theme = THEME_MODES[settings.themeMode] || THEME_MODES['dark-midnight'];
  const accent = ACCENT_PALETTES[settings.accentColor] || ACCENT_PALETTES['blue'];

  // Update root CSS variables
  root.style.setProperty('--color-primary', accent.hex);
  root.style.setProperty('--bg-canvas', theme.bgHex);
  root.style.setProperty('--bg-card', theme.cardHex);

  if (theme.isLight) {
    document.body.style.backgroundColor = theme.bgHex;
    document.body.style.color = '#0f172a';
    root.classList.remove('dark');
  } else {
    document.body.style.backgroundColor = theme.bgHex;
    document.body.style.color = '#f8fafc';
    root.classList.add('dark');
  }
}
