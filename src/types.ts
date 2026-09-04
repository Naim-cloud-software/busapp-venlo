export interface Halte {
  id: string;
  code: string;
  name: string;
  type: string;
  icon: string;
  city?: string;
  custom?: boolean;
  createdByUserId?: string;
  createdAt?: string;
  drglUrl?: string;
}

export interface StopCall {
  code?: string;
  name: string;
  time: string;
  delay?: string;
  isPassed?: boolean;
  isCurrent?: boolean;
  platform?: string;
}

export interface Departure {
  id: string;
  journeyPath?: string;
  line: string;
  destination: string;
  time: string;
  delay: string;
  isRealtime: boolean;
  platform: string;
  operator: string;
  status: string;
  statusColor: string;
  type: 'stads' | 'streek' | 'express';
  alert?: string | null;
  custom?: boolean;
  stops?: StopCall[];
  lineColor?: string;
  lineTextColor?: string;
}

export interface CustomBus {
  id: string;
  halteId: string;
  line: string;
  destination: string;
  time: string;
  platform: string;
  status: string;
  statusColor: string;
  type: 'stads' | 'streek' | 'express';
  note?: string;
  stops?: StopCall[];
  createdByUserId?: string;
  createdAt?: string;
}

export interface LiveDisruption {
  id: string;
  line: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  reportedBy: string;
  upvotes: number;
}

export interface SavedRoute {
  id: string;
  userId: string;
  userEmail?: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  busLine: string;
  operator: string;
  duration: number;
  createdAt: string;
  notes?: string;
}

export type FilterType = 'alle' | 'streek' | 'stads' | 'express' | 'custom';
export type SourceMode = 'live' | 'custom';

export type ThemeMode = 'dark-midnight' | 'dark-slate' | 'light-day' | 'high-contrast';
export type AccentColor = 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'cyan';
export type DisplayDensity = 'normal' | 'compact';
export type TimeFormat = 'exact' | 'relative' | 'both';
export type TextSize = 'normal' | 'large';

export interface SiteSettings {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  density: DisplayDensity;
  timeFormat: TimeFormat;
  textSize: TextSize;
  autoRefreshInterval: number; // in seconden: 15, 30, 45, 60, of 0 (uit)
  soundEffects: boolean;
  showStopsPreview: boolean;
  highContrastLines: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  themeMode: 'dark-midnight',
  accentColor: 'blue',
  density: 'normal',
  timeFormat: 'both',
  textSize: 'normal',
  autoRefreshInterval: 45,
  soundEffects: true,
  showStopsPreview: true,
  highContrastLines: false,
  reducedMotion: false,
};

