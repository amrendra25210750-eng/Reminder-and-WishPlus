import React, { useState, useMemo } from 'react';
import { 
  Cake, 
  Heart, 
  Sparkles, 
  Calendar, 
  Send, 
  Search, 
  Plus, 
  Check, 
  ArrowRight, 
  Clock, 
  Share2, 
  Filter, 
  ChevronRight,
  MessageCircle,
  Copy,
  ExternalLink,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Celebrant, OccasionType, ThemeColor } from '../types';
import { getCelebrationCountdown, formatEventBadge } from '../utils/dateUtils';
import { buildWhatsAppLink, maskPhoneNumber } from '../utils/whatsapp';
import { DEFAULT_TEMPLATES, resolveMessage } from '../utils/templates';
import { THEMES } from '../utils/themeStyles';
import { APP_ASSETS, handleImageError } from '../utils/assets';

export const OCCASION_ASSETS = APP_ASSETS;

interface Props {
  celebrants: Celebrant[];
  onSelectCelebrant: (c: Celebrant) => void;
  onOpenStudio: (c: Celebrant) => void;
  onToggleStatus: (id: string) => void;
  onOpenAddModal: () => void;
  senderName: string;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
}

export type CategoryFilter = 'all' | 'birthday' | 'anniversary' | 'other';

export const RemindersFrontPage: React.FC<Props> = ({
  celebrants,
  onSelectCelebrant,
  onOpenStudio,
  onToggleStatus,
  onOpenAddModal,
  senderName,
  currentTheme,
  onThemeChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const [globalReveal, setGlobalReveal] = useState(false);

  const activeThemeConfig = THEMES[currentTheme] || THEMES.pink;
  const isLight = activeThemeConfig.isLight;

  // Counts for each category button
  const birthdayCount = useMemo(
    () => celebrants.filter((c) => c.occasion === 'birthday' || c.occasion === 'combo').length,
    [celebrants]
  );
  const anniversaryCount = useMemo(
    () => celebrants.filter((c) => c.occasion === 'anniversary' || c.occasion === 'combo').length,
    [celebrants]
  );
  const othersCount = useMemo(
    () => celebrants.filter((c) => c.occasion === 'other').length,
    [celebrants]
  );

  // Filter celebrants by category and search
  const filteredCelebrants = useMemo(() => {
    return celebrants
      .map((c) => ({
        ...c,
        countdown: getCelebrationCountdown(c.date),
      }))
      .filter((c) => {
        // Category filter
        if (activeCategory === 'birthday' && c.occasion !== 'birthday' && c.occasion !== 'combo') {
          return false;
        }
        if (activeCategory === 'anniversary' && c.occasion !== 'anniversary' && c.occasion !== 'combo') {
          return false;
        }
        if (activeCategory === 'other' && c.occasion !== 'other') {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchPhone = c.phone.includes(q);
          const matchEvent = (c.eventTitle || '').toLowerCase().includes(q);
          const matchNotes = (c.notes || '').toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchEvent && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);
  }, [celebrants, activeCategory, searchQuery]);

  // Today's celebration item if any
  const todayItems = useMemo(
    () => filteredCelebrants.filter((c) => c.countdown.isToday),
    [filteredCelebrants]
  );

  const triggerCelebrationConfetti = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#34d399', '#a78bfa'],
    });
  };

  const handleSendWhatsApp = (e: React.MouseEvent, c: Celebrant) => {
    e.stopPropagation();
    triggerCelebrationConfetti(e);

    const tmpl = DEFAULT_TEMPLATES.find((t) => t.occasion === c.occasion) || DEFAULT_TEMPLATES[0];
    const resolved = resolveMessage(c, c.customMessage || tmpl.template, senderName);
    const link = buildWhatsAppLink(c.phone, resolved, c.countryCode);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = async (e: React.MouseEvent, c: Celebrant) => {
    e.stopPropagation();
    const tmpl = DEFAULT_TEMPLATES.find((t) => t.occasion === c.occasion) || DEFAULT_TEMPLATES[0];
    const resolved = resolveMessage(c, c.customMessage || tmpl.template, senderName);
    try {
      await navigator.clipboard.writeText(resolved);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const getCardImage = (occasion: OccasionType) => {
    switch (occasion) {
      case 'birthday':
        return OCCASION_ASSETS.birthday;
      case 'anniversary':
      case 'combo':
        return OCCASION_ASSETS.anniversary;
      case 'other':
      default:
        return OCCASION_ASSETS.other;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-200">
      {/* 1. Hero Showcase Section with Celebratory Banner Picture */}
      <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${activeThemeConfig.heroGradient} ${isLight ? 'border border-pink-200/90 shadow-md' : 'border border-white/[0.08] shadow-2xl'} p-6 sm:p-8 transition-colors`}>
        {/* Soft Ambient Radial Flares */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-rose-700' : 'text-emerald-400'}`}>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Celebration & Reminder Hub</span>
              <span className="opacity-50">·</span>
              <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400 font-normal'}>Instant WhatsApp Dispatcher</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Reminders
            </h1>

            <p className={`text-sm sm:text-base mt-2 font-normal leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Timely reminders for birthdays, wedding anniversaries, and special moments with ready-to-dispatch WhatsApp wishes and attractive greeting cards.
            </p>

            {/* Quick Action Button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenAddModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Reminder</span>
              </button>

              <button
                type="button"
                onClick={triggerCelebrationConfetti}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/80 hover:bg-white text-rose-700 font-semibold text-xs rounded-xl border border-pink-200 shadow-xs transition-colors cursor-pointer"
                title="Celebrate with confetti"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Celebrate</span>
              </button>
            </div>
          </div>

          {/* Attractive Celebration Banner Image Card */}
          <div 
            onClick={triggerCelebrationConfetti}
            className="relative w-full lg:w-80 h-44 rounded-2xl overflow-hidden shadow-lg border border-pink-200/90 group cursor-pointer shrink-0 transition-transform hover:scale-[1.02]"
            title="Click to trigger celebration confetti!"
          >
            <img 
              src={OCCASION_ASSETS.hero}
              alt="Celebration Balloons and Confetti"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, 'hero')}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Celebration Mode</span>
                </span>
                <span className="text-[10px] font-semibold bg-rose-600/90 px-2 py-0.5 rounded-full">
                  Click to Celebrate 🎉
                </span>
              </div>
              <p className="text-[11px] text-pink-100 opacity-90 mt-0.5 line-clamp-1">
                Birthdays, Anniversaries & Festivals
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar in Hero + Instant Palette Selector */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 pt-4 border-t ${isLight ? 'border-pink-200/80' : 'border-white/10'}`}>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reminders by name, phone, or occasion..."
              className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none shadow-xs ${
                isLight 
                  ? 'bg-white border border-pink-200 text-slate-900 placeholder-slate-400 focus:border-rose-400' 
                  : 'bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Live Color Switcher Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mr-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              <Palette className="w-3.5 h-3.5" />
              <span>Color Theme:</span>
            </span>
            {Object.values(THEMES).map((th) => {
              const isSelected = th.id === currentTheme;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => onThemeChange(th.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? (isLight ? 'bg-white text-rose-900 font-bold border border-rose-300 shadow-xs ring-1 ring-rose-200' : 'bg-white/20 text-white font-bold ring-1 ring-white/40 shadow-sm')
                      : (isLight ? 'bg-white/60 hover:bg-white text-slate-700 border border-pink-200/70' : 'bg-black/30 hover:bg-black/50 text-slate-300')
                  }`}
                  title={`Switch to ${th.name}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: th.dotColor }}
                  />
                  <span>{th.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Interactive Visual Category Navigation with Attractive Pictures */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            Explore Categories with Pictures
          </h2>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Showing {filteredCelebrants.length} of {celebrants.length} reminders
          </span>
        </div>

        {/* 4 Interactive Category Cards with Photo Thumbnails */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* All Reminders Card */}
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between p-3.5 shadow-xs ${
              activeCategory === 'all'
                ? (isLight ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-300/50' : 'bg-slate-800 border-slate-500 ring-2 ring-white/30')
                : (isLight ? 'bg-white/90 hover:bg-white border-pink-200/90' : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800')
            }`}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs shrink-0 relative">
                <img 
                  src={OCCASION_ASSETS.hero}
                  alt="All Reminders"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'hero')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>All Reminders</div>
                <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Complete schedule</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-pink-100/80">
              <span className={`text-[11px] font-semibold ${isLight ? 'text-rose-700' : 'text-emerald-400'}`}>Show all</span>
              <span className={`text-sm font-bold font-mono-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>{celebrants.length}</span>
            </div>
          </button>

          {/* Birthday Category Card */}
          <button
            type="button"
            onClick={() => setActiveCategory('birthday')}
            className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between p-3.5 shadow-xs ${
              activeCategory === 'birthday'
                ? (isLight ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-300/60' : 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-400/40')
                : (isLight ? 'bg-white/90 hover:bg-amber-50/60 border-pink-200/90' : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800')
            }`}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs shrink-0 relative">
                <img 
                  src={OCCASION_ASSETS.birthday}
                  alt="Birthday Cake Picture"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'birthday')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>Birthdays</div>
                <div className={`text-[11px] truncate ${isLight ? 'text-amber-700' : 'text-amber-400/80'}`}>Cakes & Candles</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
              <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                <Cake className="w-3 h-3 text-amber-500" />
                <span>DOB events</span>
              </span>
              <span className="text-sm font-bold font-mono-nums text-amber-700">{birthdayCount}</span>
            </div>
          </button>

          {/* Anniversary Category Card */}
          <button
            type="button"
            onClick={() => setActiveCategory('anniversary')}
            className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between p-3.5 shadow-xs ${
              activeCategory === 'anniversary'
                ? (isLight ? 'bg-rose-50/90 border-rose-400 shadow-md ring-2 ring-rose-300/60' : 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-400/40')
                : (isLight ? 'bg-white/90 hover:bg-rose-50/60 border-pink-200/90' : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800')
            }`}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs shrink-0 relative">
                <img 
                  src={OCCASION_ASSETS.anniversary}
                  alt="Anniversary Champagne Picture"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'anniversary')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isLight ? 'text-rose-950' : 'text-rose-200'}`}>Anniversary</div>
                <div className={`text-[11px] truncate ${isLight ? 'text-rose-700' : 'text-rose-400/80'}`}>Roses & Cheers</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-rose-200/60">
              <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Weddings</span>
              </span>
              <span className="text-sm font-bold font-mono-nums text-rose-700">{anniversaryCount}</span>
            </div>
          </button>

          {/* Others Category Card */}
          <button
            type="button"
            onClick={() => setActiveCategory('other')}
            className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between p-3.5 shadow-xs ${
              activeCategory === 'other'
                ? (isLight ? 'bg-purple-50/90 border-purple-400 shadow-md ring-2 ring-purple-300/60' : 'bg-purple-950/70 border-purple-500 ring-2 ring-purple-400/40')
                : (isLight ? 'bg-white/90 hover:bg-purple-50/60 border-pink-200/90' : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800')
            }`}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xs shrink-0 relative">
                <img 
                  src={OCCASION_ASSETS.other}
                  alt="Festive Lanterns Picture"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'other')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isLight ? 'text-purple-950' : 'text-purple-200'}`}>Others</div>
                <div className={`text-[11px] truncate ${isLight ? 'text-purple-700' : 'text-purple-400/80'}`}>Festivals & Milestones</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-purple-200/60">
              <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>Special Days</span>
              </span>
              <span className="text-sm font-bold font-mono-nums text-purple-700">{othersCount}</span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Today's Urgent Focus Banner (if any) */}
      {todayItems.length > 0 && (
        <section className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
          isLight ? 'bg-rose-50/90 border-rose-300 text-slate-800 shadow-xs' : 'bg-emerald-950/40 border-emerald-500/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-rose-200`}>
              <img 
                src={getCardImage(todayItems[0].occasion)} 
                alt="Today celebration"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, todayItems[0].occasion === 'anniversary' || todayItems[0].occasion === 'combo' ? 'anniversary' : todayItems[0].occasion === 'birthday' ? 'birthday' : 'other')}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-rose-900' : 'text-emerald-300'}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>Happening Today!</span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {todayItems.map((item) => item.name).join(', ')} has a celebration today! Send your WhatsApp wishes now.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => handleSendWhatsApp(e, todayItems[0])}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Wish {todayItems[0].name.split(' ')[0]} on WhatsApp</span>
          </button>
        </section>
      )}

      {/* 4. Reminders Grid with Attractive Occasion Photos */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            {activeCategory === 'all'
              ? 'Upcoming Reminders'
              : activeCategory === 'birthday'
              ? 'Birthday Reminders'
              : activeCategory === 'anniversary'
              ? 'Anniversary Reminders'
              : 'Other Reminders'}
          </h3>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border ${
              isLight ? 'bg-white/80 border-pink-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mobile numbers masked for security</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalReveal(!globalReveal)}
              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-pink-50 border-pink-200 text-slate-700' : 'bg-slate-800/80 hover:text-white border-slate-700 text-slate-400'
              }`}
            >
              {globalReveal ? <EyeOff className="w-3 h-3 text-rose-500" /> : <Eye className="w-3 h-3 text-slate-500" />}
              <span>{globalReveal ? 'Hide All' : 'Reveal All'}</span>
            </button>
          </div>
        </div>

        {filteredCelebrants.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center ${
            isLight ? 'bg-white/80 border-pink-200' : 'bg-slate-900/40 border-slate-800'
          }`}>
            <Calendar className={`w-10 h-10 mb-3 ${isLight ? 'text-pink-300' : 'text-slate-600'}`} />
            <h4 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>No reminders found</h4>
            <p className={`text-xs mt-1 max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              There are no reminders matching the selected category or search filter. Click &ldquo;New Reminder&rdquo; to add one.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Add Reminder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCelebrants.map((c) => {
              const { daysLeft, isToday, formattedNextDate } = c.countdown;
              const badge = formatEventBadge(daysLeft);
              const tmpl = DEFAULT_TEMPLATES.find((t) => t.occasion === c.occasion) || DEFAULT_TEMPLATES[0];
              const resolvedMsg = resolveMessage(c, c.customMessage || tmpl.template, senderName);

              const isBirthday = c.occasion === 'birthday';
              const isAnniversary = c.occasion === 'anniversary';
              const isCombo = c.occasion === 'combo';
              const isOther = c.occasion === 'other';
              const cardImage = getCardImage(c.occasion);

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCelebrant(c)}
                  className={`group relative rounded-3xl border overflow-hidden p-4 transition-all flex flex-col justify-between cursor-pointer ${
                    isLight
                      ? 'bg-white/95 border-pink-200/90 hover:border-pink-400 shadow-sm hover:shadow-lg text-slate-800'
                      : 'bg-slate-900/70 hover:bg-slate-900 hover:border-slate-700/80 border-slate-800/80 shadow-md text-slate-100'
                  } ${isToday ? 'ring-2 ring-emerald-500/60' : ''}`}
                >
                  <div>
                    {/* Attractive Celebration Picture Banner with Hover Zoom */}
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-3.5 shadow-xs">
                      <img
                        src={cardImage}
                        alt={`${c.name} celebration`}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, isAnniversary || isCombo ? 'anniversary' : isBirthday ? 'birthday' : 'other')}
                        className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                      {/* Floating Occasion Tag Badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-white/95 text-slate-900">
                        {isBirthday && <Cake className="w-3.5 h-3.5 text-amber-500" />}
                        {isAnniversary && <Heart className="w-3.5 h-3.5 text-rose-500" />}
                        {isCombo && <Sparkles className="w-3.5 h-3.5 text-purple-500" />}
                        {isOther && <Calendar className="w-3.5 h-3.5 text-sky-500" />}
                        <span>
                          {isCombo
                            ? 'Double Wish'
                            : isBirthday
                            ? 'Birthday'
                            : isAnniversary
                            ? 'Anniversary'
                            : c.eventTitle || 'Celebration'}
                        </span>
                      </div>

                      {/* Days Left Countdown Badge */}
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono-nums backdrop-blur-md bg-black/70 text-white border border-white/20 shadow-md">
                        {badge.label}
                      </div>

                      {/* Date display overlay */}
                      <div className="absolute bottom-2.5 left-2.5 text-white">
                        <span className="text-xs font-bold drop-shadow-md">
                          {c.displayDate || formattedNextDate}
                        </span>
                      </div>
                    </div>

                    {/* Recipient Details & Phone Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ${
                            isBirthday
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                              : isAnniversary
                              ? 'bg-gradient-to-tr from-rose-600 to-rose-400'
                              : isCombo
                              ? 'bg-gradient-to-tr from-purple-600 to-indigo-400'
                              : 'bg-gradient-to-tr from-sky-600 to-teal-400'
                          }`}
                        >
                          {c.name.charAt(0)}
                        </div>

                        <div>
                          <h4 className={`text-sm font-bold transition-colors ${
                            isLight ? 'text-slate-900 group-hover:text-rose-600' : 'text-white group-hover:text-emerald-300'
                          }`}>
                            {c.name}
                          </h4>
                          <div className={`text-xs flex items-center gap-1.5 font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{maskPhoneNumber(c.phone, globalReveal || !!revealedPhones[c.id])}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRevealedPhones((prev) => ({ ...prev, [c.id]: !prev[c.id] }));
                              }}
                              className="p-0.5 hover:text-slate-700 transition-colors text-slate-400 cursor-pointer"
                              title={revealedPhones[c.id] || globalReveal ? 'Hide phone number' : 'Show phone number'}
                            >
                              {revealedPhones[c.id] || globalReveal ? (
                                <EyeOff className="w-3 h-3 text-rose-500" />
                              ) : (
                                <Eye className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Relationship Pill */}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isLight ? 'bg-pink-100/70 text-rose-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.relationship}
                      </span>
                    </div>

                    {/* WhatsApp Message Preview Snippet */}
                    <div className={`p-2.5 rounded-xl border text-[11px] font-sans line-clamp-2 leading-relaxed mb-3 ${
                      isLight ? 'bg-pink-50/70 border-pink-100 text-slate-700' : 'bg-slate-950/70 border-slate-800/70 text-slate-300'
                    }`}>
                      {resolvedMsg}
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className={`flex items-center justify-between gap-2 pt-2.5 border-t ${
                    isLight ? 'border-pink-100' : 'border-slate-800/60'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {/* Copy text */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyText(e, c)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLight ? 'bg-pink-50 hover:bg-pink-100 text-slate-600 border border-pink-200/60' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Copy greeting text"
                      >
                        {copiedId === c.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Open WhatsApp Studio */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenStudio(c);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isLight ? 'bg-pink-50 hover:bg-pink-100 text-rose-800 border border-pink-200/70' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Open interactive WhatsApp studio & customizer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Studio</span>
                      </button>
                    </div>

                    {/* Primary Send WhatsApp Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSendWhatsApp(e, c)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
