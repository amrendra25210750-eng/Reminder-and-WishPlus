import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Edit3, 
  Send, 
  Check, 
  Clock, 
  Cake, 
  Heart, 
  RotateCcw,
  Sparkles,
  Phone,
  UserCheck,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { Celebrant, OccasionType, RelationshipType, ThemeColor } from '../types';
import { MASTER_PERSON_RECORDS } from '../data/sampleCelebrants';
import { getCelebrationCountdown, formatEventBadge } from '../utils/dateUtils';
import { buildWhatsAppLink, maskPhoneNumber } from '../utils/whatsapp';
import { DEFAULT_TEMPLATES, resolveMessage } from '../utils/templates';
import { THEMES } from '../utils/themeStyles';

interface Props {
  celebrants: Celebrant[];
  selectedId: string;
  onSelectCelebrant: (c: Celebrant) => void;
  onAddCelebrant: (c: Omit<Celebrant, 'id' | 'status' | 'lastWishedAt'>) => void;
  onUpdateCelebrant: (c: Celebrant) => void;
  onDeleteCelebrant: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenImportModal: () => void;
  onResetData: () => void;
  senderName: string;
  currentTheme?: ThemeColor;
}

export const ContactsTable: React.FC<Props> = ({
  celebrants,
  selectedId,
  onSelectCelebrant,
  onAddCelebrant,
  onUpdateCelebrant,
  onDeleteCelebrant,
  onToggleStatus,
  onOpenImportModal,
  onResetData,
  senderName,
  currentTheme = 'pink',
}) => {
  const activeThemeConfig = THEMES[currentTheme] || THEMES.pink;
  const isLight = activeThemeConfig.isLight;
  const [searchQuery, setSearchQuery] = useState('');
  const [occasionFilter, setOccasionFilter] = useState<'all' | OccasionType>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'upcoming-7' | 'pending' | 'wished'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCelebrant, setEditingCelebrant] = useState<Celebrant | null>(null);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const [showAllPhones, setShowAllPhones] = useState(false);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountryCode, setFormCountryCode] = useState('+91');
  const [formOccasion, setFormOccasion] = useState<OccasionType>('birthday');
  const [formDate, setFormDate] = useState('');
  const [formRelationship, setFormRelationship] = useState<RelationshipType>('Family');
  const [formYears, setFormYears] = useState<string>('');
  const [formNotes, setFormNotes] = useState('');

  // Sorted and filtered list
  const filteredCelebrants = useMemo(() => {
    return celebrants
      .map((c) => {
        const countdown = getCelebrationCountdown(c.date);
        return { ...c, countdown };
      })
      .filter((c) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchPhone = c.phone.includes(q);
          const matchRel = c.relationship.toLowerCase().includes(q);
          const matchNotes = (c.notes || '').toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchRel && !matchNotes) return false;
        }

        // Occasion filter
        if (occasionFilter !== 'all' && c.occasion !== occasionFilter) {
          return false;
        }

        // Time / status filter
        if (timeFilter === 'today' && !c.countdown.isToday) return false;
        if (timeFilter === 'upcoming-7' && (c.countdown.daysLeft > 7 || c.countdown.isToday)) return false;
        if (timeFilter === 'pending' && c.status !== 'pending') return false;
        if (timeFilter === 'wished' && c.status !== 'wished') return false;

        return true;
      })
      .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);
  }, [celebrants, searchQuery, occasionFilter, timeFilter]);

  const openAddModal = () => {
    setFormName('');
    setFormPhone('');
    setFormCountryCode('+91');
    setFormOccasion('birthday');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormRelationship('Family');
    setFormYears('');
    setFormNotes('');
    setEditingCelebrant(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: Celebrant) => {
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormCountryCode(c.countryCode || '+91');
    setFormOccasion(c.occasion);
    setFormDate(c.date);
    setFormRelationship(c.relationship);
    setFormYears(c.years ? String(c.years) : '');
    setFormNotes(c.notes || '');
    setEditingCelebrant(c);
    setIsAddModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDate.trim()) {
      alert('Please provide at least a name and celebration date.');
      return;
    }

    const yearsNum = formYears ? parseInt(formYears, 10) : undefined;

    if (editingCelebrant) {
      onUpdateCelebrant({
        ...editingCelebrant,
        name: formName.trim(),
        phone: formPhone.trim(),
        countryCode: formCountryCode,
        occasion: formOccasion,
        date: formDate,
        relationship: formRelationship,
        years: isNaN(yearsNum as number) ? undefined : yearsNum,
        notes: formNotes.trim(),
      });
    } else {
      onAddCelebrant({
        name: formName.trim(),
        phone: formPhone.trim(),
        countryCode: formCountryCode,
        occasion: formOccasion,
        date: formDate,
        relationship: formRelationship,
        years: isNaN(yearsNum as number) ? undefined : yearsNum,
        notes: formNotes.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'CountryCode', 'Occasion', 'Date', 'Relationship', 'Years', 'Notes', 'Status'];
    const rows = celebrants.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.countryCode}"`,
      `"${c.occasion}"`,
      `"${c.date}"`,
      `"${c.relationship}"`,
      c.years || '',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      c.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsapp_celebrants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDirectWhatsAppClick = (e: React.MouseEvent, c: Celebrant) => {
    e.stopPropagation();
    const defaultTmpl = DEFAULT_TEMPLATES.find((t) => t.occasion === c.occasion) || DEFAULT_TEMPLATES[0];
    const rawMsg = c.customMessage || defaultTmpl.template;
    const resolved = resolveMessage(c, rawMsg, senderName);
    const waLink = buildWhatsAppLink(c.phone, resolved, c.countryCode);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-xl border ${
      isLight ? 'bg-white border-pink-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
    }`}>
      {/* 1. Master Reference Table Card (Direct match of user image) */}
      <div className={`p-4 border-b ${isLight ? 'bg-pink-50/50 border-pink-200' : 'bg-slate-950/70 border-slate-800'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className={`w-4 h-4 ${isLight ? 'text-rose-600' : 'text-emerald-400'}`} />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Provided Reference Records
            </h4>
            <span className="opacity-50">·</span>
            <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Exact Data Table</span>
          </div>

          <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Click any button below to customize & send via WhatsApp
          </span>
        </div>

        <div className={`overflow-x-auto rounded-xl border shadow-inner ${isLight ? 'bg-white border-pink-200' : 'border-slate-800 bg-slate-900'}`}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-semibold text-[11px] uppercase tracking-wider ${
                isLight ? 'bg-pink-100/70 text-slate-700 border-pink-200' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                <th className="py-2.5 px-3 w-16 text-center font-mono-nums">Sl.no</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">DOB</th>
                <th className="py-2.5 px-4">Anniversary Date</th>
                <th className="py-2.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span>Mobile no.</span>
                    <button
                      type="button"
                      onClick={() => setShowAllPhones(!showAllPhones)}
                      className={`p-1 hover:text-slate-900 transition-colors cursor-pointer ${isLight ? 'text-slate-500' : 'text-slate-500 hover:text-white'}`}
                      title={showAllPhones ? 'Hide all phone numbers' : 'Reveal all phone numbers'}
                    >
                      {showAllPhones ? (
                        <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right">Instant WhatsApp Triggers</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-pink-100' : 'divide-slate-800/80'}`}>
              {MASTER_PERSON_RECORDS.map((record) => {
                const bdayItem = celebrants.find(
                  (c) => c.name.toLowerCase().includes(record.name.toLowerCase()) && c.occasion === 'birthday'
                );
                const annivItem = celebrants.find(
                  (c) => c.name.toLowerCase().includes(record.name.toLowerCase()) && c.occasion === 'anniversary'
                );
                const comboItem = celebrants.find(
                  (c) => c.name.toLowerCase().includes(record.name.toLowerCase()) && c.occasion === 'combo'
                );

                const isRevealed = showAllPhones || !!revealedPhones[record.name];

                return (
                  <tr key={record.slNo} className={`transition-colors ${isLight ? 'hover:bg-pink-50/50 text-slate-800' : 'hover:bg-slate-800/40 text-slate-200'}`}>
                    <td className={`py-3 px-3 text-center font-mono-nums font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {record.slNo}
                    </td>
                    <td className={`py-3 px-4 font-semibold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isLight ? 'bg-pink-100 text-rose-700 border border-pink-200' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      }`}>
                        {record.name.charAt(0)}
                      </div>
                      <span>{record.name}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                        <Cake className="w-3.5 h-3.5 text-amber-500" />
                        <span>{record.dob}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{record.anniversaryDate}</span>
                      </div>
                    </td>
                    {/* Mobile no. (Masked with toggle) */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono-nums">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{maskPhoneNumber(record.phone, isRevealed)}</span>
                        <button
                          type="button"
                          onClick={() => setRevealedPhones((prev) => ({ ...prev, [record.name]: !prev[record.name] }))}
                          className="p-1 hover:text-slate-900 transition-colors text-slate-400 cursor-pointer"
                          title={isRevealed ? 'Hide phone number' : 'Show phone number'}
                        >
                          {isRevealed ? (
                            <EyeOff className="w-3 h-3 text-rose-500" />
                          ) : (
                            <Eye className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {bdayItem && (
                          <button
                            type="button"
                            onClick={() => onSelectCelebrant(bdayItem)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              isLight ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800/60'
                            }`}
                            title="Preview Birthday message on WhatsApp"
                          >
                            <Cake className="w-3 h-3 text-amber-500" />
                            <span>Wish Birthday</span>
                          </button>
                        )}

                        {annivItem && (
                          <button
                            type="button"
                            onClick={() => onSelectCelebrant(annivItem)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              isLight ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300' : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60'
                            }`}
                            title="Preview Anniversary message on WhatsApp"
                          >
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span>Wish Anniversary</span>
                          </button>
                        )}

                        {comboItem && (
                          <button
                            type="button"
                            onClick={() => onSelectCelebrant(comboItem)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              isLight ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300' : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/60'
                            }`}
                            title="Preview Double Celebration message (Birthday + Anniversary)"
                          >
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            <span>Double Wish</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Top Controls Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, relationship..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>

          <button
            type="button"
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer whitespace-nowrap"
            title="Import Excel or CSV data"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bulk Import</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="Export CSV data"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Reset to sample dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Filter Tabs Segmented Control */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        {/* Occasion segmented buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setOccasionFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              occasionFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Occasions
          </button>
          <button
            type="button"
            onClick={() => setOccasionFilter('birthday')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              occasionFilter === 'birthday' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cake className="w-3 h-3 text-amber-400" />
            <span>Birthdays</span>
          </button>
          <button
            type="button"
            onClick={() => setOccasionFilter('anniversary')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              occasionFilter === 'anniversary' ? 'bg-slate-800 text-rose-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Anniversaries</span>
          </button>
        </div>

        {/* Time / Status filter buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setTimeFilter('all')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              timeFilter === 'all' ? 'text-white font-medium bg-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('today')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              timeFilter === 'today' ? 'text-emerald-400 font-medium bg-emerald-950/80 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('upcoming-7')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              timeFilter === 'upcoming-7' ? 'text-sky-300 font-medium bg-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            In 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('pending')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              timeFilter === 'pending' ? 'text-amber-300 font-medium bg-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* 4. Complete Events Schedule Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredCelebrants.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Cake className="w-10 h-10 text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No events match your criteria</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Try adjusting your search filters or click &apos;Add Contact&apos; to create a new celebration record.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium text-[11px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-4">Celebrant</th>
                <th className="py-2.5 px-3">Occasion</th>
                <th className="py-2.5 px-3">Next Date</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCelebrants.map((c) => {
                const isSelected = c.id === selectedId;
                const { daysLeft, isToday, formattedNextDate } = c.countdown;
                const badge = formatEventBadge(daysLeft);

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCelebrant(c)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-emerald-950/30 hover:bg-emerald-950/40 text-slate-100'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    {/* Celebrant Name & Relationship */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          c.occasion === 'birthday' 
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                            : c.occasion === 'combo'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {isToday && (
                              <span className="text-[10px] text-emerald-400 font-mono-nums font-bold">
                                · TODAY
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{c.relationship}</span>
                            {c.displayDate && (
                              <>
                                <span>·</span>
                                <span className="text-slate-400">{c.displayDate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Occasion */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {c.occasion === 'birthday' ? (
                          <Cake className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : c.occasion === 'combo' ? (
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        ) : (
                          <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className="capitalize text-slate-300 font-medium">
                          {c.occasion === 'combo' ? 'Birthday + Anniv' : c.occasion}
                        </span>
                      </div>
                    </td>

                    {/* Next Date & Countdown */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono-nums">
                      <div className="text-slate-200">{formattedNextDate}</div>
                      <div className={`text-[11px] font-medium ${
                        isToday ? 'text-emerald-400 font-bold' : daysLeft <= 7 ? 'text-sky-400' : 'text-slate-500'
                      }`}>
                        {badge.label}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono-nums text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{maskPhoneNumber(c.phone, showAllPhones || !!revealedPhones[c.id])}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevealedPhones((prev) => ({ ...prev, [c.id]: !prev[c.id] }));
                          }}
                          className="p-0.5 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                          title={revealedPhones[c.id] || showAllPhones ? 'Hide phone number' : 'Show phone number'}
                        >
                          {revealedPhones[c.id] || showAllPhones ? (
                            <EyeOff className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Eye className="w-3 h-3 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(c.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          c.status === 'wished'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                        }`}
                        title="Toggle status"
                      >
                        <Check className="w-3 h-3" />
                        <span>{c.status === 'wished' ? 'Wished' : 'Pending'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleDirectWhatsAppClick(e, c)}
                          className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Open directly in WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(c);
                          }}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit contact"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${c.name} from celebrations list?`)) {
                              onDeleteCelebrant(c.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">
              {editingCelebrant ? 'Edit Celebration Record' : 'Add Celebration Contact'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter recipient details to auto-generate customized WhatsApp birthday or anniversary greetings.
            </p>

            <form onSubmit={handleSaveContact} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name or Couple Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Amrendra Kumar or Nishu sinha"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Occasion *</label>
                  <select
                    value={formOccasion}
                    onChange={(e) => setFormOccasion(e.target.value as OccasionType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="birthday">🎂 Birthday</option>
                    <option value="anniversary">💍 Anniversary</option>
                    <option value="combo">🌟 Double Celebration (Both)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Country Code</label>
                  <input
                    type="text"
                    value={formCountryCode}
                    onChange={(e) => setFormCountryCode(e.target.value)}
                    placeholder="+91"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="9876543210 (digits only)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Relationship</label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value as RelationshipType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Parent">Parent / Elder</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Client">Client / Partner</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {formOccasion === 'birthday' ? 'Age Turning (Opt)' : 'Years Married (Opt)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formYears}
                    onChange={(e) => setFormYears(e.target.value)}
                    placeholder={formOccasion === 'birthday' ? 'e.g. 25' : 'e.g. 5'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Memories / Interests</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Birthday & Anniversary on 4th October"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-semibold shadow-xs"
                >
                  {editingCelebrant ? 'Save Changes' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
