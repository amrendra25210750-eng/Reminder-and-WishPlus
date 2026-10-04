export type OccasionType = 'birthday' | 'anniversary' | 'other' | 'combo';

export type RelationshipType = 
  | 'Friend'
  | 'Family'
  | 'Spouse'
  | 'Colleague'
  | 'Parent'
  | 'Sibling'
  | 'Client'
  | 'Mentor'
  | 'Other';

export type WishTone = 
  | 'heartfelt'
  | 'playful'
  | 'professional'
  | 'milestone'
  | 'short'
  | 'festive';

export type ThemeColor = 'pink' | 'emerald' | 'champagne' | 'indigo' | 'light' | 'sunset';

export interface Celebrant {
  id: string;
  name: string;
  phone: string; // e.g. +919876543210 or 1234567890
  countryCode: string; // default e.g. +1 or +91
  occasion: OccasionType;
  date: string; // YYYY-MM-DD or MM-DD
  displayDate?: string; // e.g. "04th October"
  relationship: RelationshipType;
  years?: number; // Turning 25, or 10th Anniversary
  notes?: string; // e.g. "Double celebration"
  customMessage?: string; // if user overrode default template
  status: 'pending' | 'wished';
  lastWishedAt?: string | null;
  avatarSeed?: string;
  eventTitle?: string; // Custom label for 'other', e.g. "Work Anniversary" or "Festive Celebration"
}

export interface MasterPersonRecord {
  slNo: number;
  name: string;
  dob: string; // e.g. "04th October"
  dobIso: string; // "2026-10-04"
  anniversaryDate: string; // e.g. "4th October"
  anniversaryIso: string; // "2026-10-04"
  phone: string;
  relationship: RelationshipType;
  notes?: string;
}

export interface WishTemplate {
  id: string;
  occasion: OccasionType;
  tone: WishTone;
  title: string;
  template: string;
}

export interface FilterOptions {
  search: string;
  occasion: 'all' | OccasionType;
  timeframe: 'all' | 'today' | 'upcoming-7' | 'upcoming-30' | 'wished' | 'pending';
  relationship: string;
}
