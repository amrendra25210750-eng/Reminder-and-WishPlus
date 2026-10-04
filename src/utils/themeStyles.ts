import { ThemeColor } from '../types';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  dotColor: string;
  pageBg: string;
  headerBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  heroGradient: string;
  accentColor: string;
  isLight: boolean;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  pink: {
    id: 'pink',
    name: 'Light Pink',
    dotColor: '#f43f5e',
    pageBg: 'bg-[#fff0f4] text-slate-900',
    headerBg: 'bg-white/90 border-pink-200 shadow-xs text-slate-900',
    cardBg: 'bg-white border-pink-200/90 shadow-xs text-slate-800',
    textPrimary: 'text-slate-950',
    textSecondary: 'text-rose-800',
    borderColor: 'border-pink-200',
    heroGradient: 'from-[#ffe4ea] via-[#ffd6e0] to-[#ffe9ee]',
    accentColor: 'rose',
    isLight: true,
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Luxe',
    dotColor: '#10b981',
    pageBg: 'bg-[#061412] text-slate-100',
    headerBg: 'bg-[#040e0c]/95 border-[#14362f] text-slate-100',
    cardBg: 'bg-[#0a1f1b]/80 border-[#174239] text-slate-100',
    textPrimary: 'text-white',
    textSecondary: 'text-emerald-300/80',
    borderColor: 'border-[#174239]',
    heroGradient: 'from-[#08221d] via-[#0c2f28] to-[#061915]',
    accentColor: 'emerald',
    isLight: false,
  },
  champagne: {
    id: 'champagne',
    name: 'Rose & Wine',
    dotColor: '#e11d48',
    pageBg: 'bg-[#150a13] text-rose-50',
    headerBg: 'bg-[#10060e]/95 border-[#3b1731] text-rose-50',
    cardBg: 'bg-[#200f1c]/80 border-[#471c3b] text-rose-50',
    textPrimary: 'text-white',
    textSecondary: 'text-rose-300/80',
    borderColor: 'border-[#471c3b]',
    heroGradient: 'from-[#2b1025] via-[#381531] to-[#1c0a18]',
    accentColor: 'rose',
    isLight: false,
  },
  indigo: {
    id: 'indigo',
    name: 'Royal Sapphire',
    dotColor: '#3b82f6',
    pageBg: 'bg-[#070d1e] text-blue-50',
    headerBg: 'bg-[#040815]/95 border-[#15234a] text-blue-50',
    cardBg: 'bg-[#0c1735]/80 border-[#1d3063] text-blue-50',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-300/80',
    borderColor: 'border-[#1d3063]',
    heroGradient: 'from-[#0e1c45] via-[#14265d] to-[#09122e]',
    accentColor: 'blue',
    isLight: false,
  },
  sunset: {
    id: 'sunset',
    name: 'Amber Sunset',
    dotColor: '#f59e0b',
    pageBg: 'bg-[#150e0c] text-amber-50',
    headerBg: 'bg-[#0f0908]/95 border-[#3a1f17] text-amber-50',
    cardBg: 'bg-[#201410]/80 border-[#48281e] text-amber-50',
    textPrimary: 'text-white',
    textSecondary: 'text-amber-300/80',
    borderColor: 'border-[#48281e]',
    heroGradient: 'from-[#2c1811] via-[#3b2017] to-[#1a0e0a]',
    accentColor: 'amber',
    isLight: false,
  },
  light: {
    id: 'light',
    name: 'Pearl White',
    dotColor: '#059669',
    pageBg: 'bg-[#f8fafc] text-slate-900',
    headerBg: 'bg-white/95 border-slate-200 text-slate-900',
    cardBg: 'bg-white border-slate-200 text-slate-800',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    borderColor: 'border-slate-200',
    heroGradient: 'from-slate-100 via-emerald-50/70 to-slate-100',
    accentColor: 'emerald',
    isLight: true,
  },
};
