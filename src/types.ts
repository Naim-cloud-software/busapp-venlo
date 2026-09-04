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

