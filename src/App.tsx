import React, { useState, useEffect, useMemo } from 'react';
import { Celebrant, OccasionType, RelationshipType, ThemeColor } from './types';
import { getInitialCelebrants } from './data/sampleCelebrants';
import { DEFAULT_TEMPLATES, resolveMessage } from './utils/templates';
import { THEMES } from './utils/themeStyles';
import { TopBar, ActiveTab } from './components/TopBar';
import { RemindersFrontPage } from './components/RemindersFrontPage';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { MessageEditor } from './components/MessageEditor';
import { ContactsTable } from './components/ContactsTable';
import { BulkImportModal } from './components/BulkImportModal';
import { QuickSendQueue } from './components/QuickSendQueue';
import { Cake, Heart, Sparkles, Send, Plus, ArrowLeft } from 'lucide-react';
import { getCelebrationCountdown } from './utils/dateUtils';

const STORAGE_KEY = 'wishpulse_celebrants_data_v4';
const SENDER_KEY = 'wishpulse_sender_name_v4';
const THEME_KEY = 'wishpulse_active_theme_pink_v2';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeColor) || 'pink';
  });

  const [celebrants, setCelebrants] = useState<Celebrant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasUpdatedNumber = parsed.some((c: Celebrant) => c.phone && c.phone.includes('9777837753'));
          if (hasUpdatedNumber) return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return getInitialCelebrants();
  });

  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem(SENDER_KEY) || 'Amrendra';
  });

  // Default to the Reminders front page!
  const [activeTab, setActiveTab] = useState<ActiveTab>('reminders');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Reminder Form State
  const [addName, setAddName] = useState('');
  const [addOccasion, setAddOccasion] = useState<OccasionType>('birthday');
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addPhone, setAddPhone] = useState('+919876543210');
  const [addRelationship, setAddRelationship] = useState<RelationshipType>('Family');
  const [addEventTitle, setAddEventTitle] = useState('');
  const [addNotes, setAddNotes] = useState('');

  // Selected celebrant for WhatsApp Studio
  const [selectedId, setSelectedId] = useState<string>(() => {
    const list = getInitialCelebrants();
    return list[0]?.id || '';
  });

  // Save celebrants to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(celebrants));
    } catch (err) {
      console.error('Failed to save celebrants to storage', err);
    }
  }, [celebrants]);

  // Save senderName to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SENDER_KEY, senderName);
    } catch (err) {
      console.error('Failed to save sender to storage', err);
    }
  }, [senderName]);

  // Save currentTheme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, currentTheme);
    } catch (err) {
      console.error('Failed to save theme to storage', err);
    }
  }, [currentTheme]);

  const activeCelebrant = useMemo(() => {
    return celebrants.find((c) => c.id === selectedId) || celebrants[0] || null;
  }, [celebrants, selectedId]);

  // Message drafts state
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});

  const currentMessageText = useMemo(() => {
    if (!activeCelebrant) return '';
    if (messageDrafts[activeCelebrant.id] !== undefined) {
      return messageDrafts[activeCelebrant.id];
    }
    const tmpl = DEFAULT_TEMPLATES.find((t) => t.occasion === activeCelebrant.occasion) || DEFAULT_TEMPLATES[0];
    return resolveMessage(activeCelebrant, activeCelebrant.customMessage || tmpl.template, senderName);
  }, [activeCelebrant, messageDrafts, senderName]);

  const handleUpdateMessageText = (newText: string) => {
    if (!activeCelebrant) return;
    setMessageDrafts((prev) => ({
      ...prev,
      [activeCelebrant.id]: newText,
    }));
  };

  const handleToggleStatus = (id: string) => {
    setCelebrants((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'wished' ? 'pending' : 'wished';
          return {
            ...c,
            status: newStatus,
            lastWishedAt: newStatus === 'wished' ? new Date().toISOString() : null,
          };
        }
        return c;
      })
    );
  };

  const handleAddCelebrant = (newContact: Omit<Celebrant, 'id' | 'status' | 'lastWishedAt'>) => {
    const created: Celebrant = {
      ...newContact,
      id: `cel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      lastWishedAt: null,
    };
    setCelebrants((prev) => [created, ...prev]);
    setSelectedId(created.id);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addDate.trim()) return;

    handleAddCelebrant({
      name: addName.trim(),
      phone: addPhone.trim(),
      countryCode: addPhone.startsWith('+') ? '' : '+91',
      occasion: addOccasion,
      date: addDate,
      relationship: addRelationship,
      eventTitle: addEventTitle.trim() || undefined,
      notes: addNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setAddName('');
    setAddEventTitle('');
    setAddNotes('');
  };

  const handleUpdateCelebrant = (updated: Celebrant) => {
    setCelebrants((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCelebrant = (id: string) => {
    setCelebrants((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (selectedId === id && filtered.length > 0) {
        setSelectedId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleImportCelebrants = (incoming: Celebrant[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setCelebrants(incoming);
      if (incoming.length > 0) {
        setSelectedId(incoming[0].id);
      }
    } else {
      setCelebrants((prev) => [...incoming, ...prev]);
      if (incoming.length > 0) {
        setSelectedId(incoming[0].id);
      }
    }
  };

  const handleResetData = () => {
    if (confirm('Reset to initial sample data of birthdays and anniversaries?')) {
      const initial = getInitialCelebrants();
      setCelebrants(initial);
      setSelectedId(initial[0].id);
      setMessageDrafts({});
    }
  };

  // Sorted upcoming list
  const upcomingList = useMemo(() => {
    return celebrants
      .map((c) => ({ ...c, countdown: getCelebrationCountdown(c.date) }))
      .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);
  }, [celebrants]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${THEMES[currentTheme]?.pageBg || 'bg-[#061412] text-slate-100'} font-sans antialiased`}>
      {/* Universal Top Bar */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* 1. FRONT PAGE: Reminders (with Birthday, Anniversary, Others buttons) */}
        {activeTab === 'reminders' && (
          <RemindersFrontPage
            celebrants={celebrants}
            onSelectCelebrant={(c) => {
              setSelectedId(c.id);
              setActiveTab('studio');
            }}
            onOpenStudio={(c) => {
              setSelectedId(c.id);
              setActiveTab('studio');
            }}
            onToggleStatus={handleToggleStatus}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            senderName={senderName}
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
          />
        )}

        {/* 2. WHATSAPP STUDIO: Live WhatsApp Chat Mockup & Message Customizer */}
        {activeTab === 'studio' && activeCelebrant && (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-150">
            {/* Studio Navigation Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('reminders')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Reminders</span>
                </button>
                <span className="text-xs text-slate-400">
                  Editing greeting for <strong className="text-white">{activeCelebrant.name}</strong>
                </span>
              </div>
            </div>

            {/* Quick celebrant selector pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">
                Select Reminder:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {upcomingList.map((c) => {
                  const isCurrent = c.id === activeCelebrant.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer border ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs font-semibold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {c.occasion === 'birthday' ? (
                        <Cake className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-200' : 'text-amber-400'}`} />
                      ) : c.occasion === 'combo' ? (
                        <Sparkles className={`w-3.5 h-3.5 ${isCurrent ? 'text-purple-200' : 'text-purple-400'}`} />
                      ) : c.occasion === 'other' ? (
                        <Sparkles className={`w-3.5 h-3.5 ${isCurrent ? 'text-sky-200' : 'text-sky-400'}`} />
                      ) : (
                        <Heart className={`w-3.5 h-3.5 ${isCurrent ? 'text-rose-200' : 'text-rose-400'}`} />
                      )}
                      <span>{c.name}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        ({c.occasion === 'birthday' ? 'Birthday' : c.occasion === 'combo' ? 'Double' : c.occasion === 'other' ? 'Other' : 'Anniv'})
                      </span>
                      {c.countdown.isToday && (
                        <span className="text-[10px] font-bold text-amber-300">
                          TODAY
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Screen Workspace: Editor on Left, Realistic WhatsApp Simulator on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
              {/* Left Column: Message Editor & Customizer */}
              <div className="lg:col-span-6 h-full flex flex-col">
                <MessageEditor
                  celebrant={activeCelebrant}
                  messageText={currentMessageText}
                  onUpdateMessage={handleUpdateMessageText}
                  senderName={senderName}
                  onUpdateSenderName={setSenderName}
                />
              </div>

              {/* Right Column: Realistic WhatsApp Device Simulator */}
              <div className="lg:col-span-6 h-full flex flex-col">
                <WhatsAppSimulator
                  celebrant={activeCelebrant}
                  messageText={currentMessageText}
                  onToggleStatus={handleToggleStatus}
                  senderName={senderName}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. MASTER RECORDS: Data Table with user's exact reference from image */}
        {activeTab === 'records' && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-150">
            <ContactsTable
              celebrants={celebrants}
              selectedId={selectedId}
              onSelectCelebrant={(c) => {
                setSelectedId(c.id);
                setActiveTab('studio');
              }}
              onAddCelebrant={handleAddCelebrant}
              onUpdateCelebrant={handleUpdateCelebrant}
              onDeleteCelebrant={handleDeleteCelebrant}
              onToggleStatus={handleToggleStatus}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onResetData={handleResetData}
              senderName={senderName}
              currentTheme={currentTheme}
            />
          </div>
        )}

        {/* 4. SEND QUEUE: Step-by-step rapid dispatcher */}
        {activeTab === 'queue' && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-150">
            <QuickSendQueue
              celebrants={celebrants}
              onToggleStatus={handleToggleStatus}
              senderName={senderName}
              onSelectCelebrant={(c) => {
                setSelectedId(c.id);
                setActiveTab('studio');
              }}
            />
          </div>
        )}
      </main>

      {/* Global Quick Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">
              Add New Reminder
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Schedule a birthday, anniversary, or special occasion reminder with instant WhatsApp message generation.
            </p>

            <form onSubmit={handleQuickAddSubmit} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recipient / Couple Name *</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Amrendra Kumar or Nishu sinha"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Occasion Switcher */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Reminder Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddOccasion('birthday')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all ${
                      addOccasion === 'birthday'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Cake className="w-3.5 h-3.5 text-amber-400" />
                    <span>Birthday</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddOccasion('anniversary')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all ${
                      addOccasion === 'anniversary'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Anniversary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddOccasion('other')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all ${
                      addOccasion === 'other'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Others</span>
                  </button>
                </div>
              </div>

              {addOccasion === 'other' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custom Event Title</label>
                  <input
                    type="text"
                    value={addEventTitle}
                    onChange={(e) => setAddEventTitle(e.target.value)}
                    placeholder="e.g. Work Milestone, Festival Blessing, Promotion"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono-nums"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Relationship</label>
                  <select
                    value={addRelationship}
                    onChange={(e) => setAddRelationship(e.target.value as RelationshipType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Parent">Parent / Elder</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Client">Client</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="+919876543210 (with country code)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-nums focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Personal Notes (Optional)</label>
                <input
                  type="text"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="e.g. Loves photography, favorite sweet is kaju katli"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Data Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCelebrants={handleImportCelebrants}
      />
    </div>
  );
}
