import React, { useState, useRef, useEffect } from 'react';
import { Plus, Palette, Check } from 'lucide-react';
import { ThemeColor } from '../types';
import { THEMES } from '../utils/themeStyles';

export type ActiveTab = 'reminders' | 'studio' | 'records' | 'queue';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
}

export const TopBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenImportModal,
  currentTheme,
  onThemeChange,
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeConfig = THEMES[currentTheme] || THEMES.pink;
  const isLight = activeThemeConfig.isLight;

  return (
    <header className={`flex items-center justify-between px-6 py-3.5 border-b shrink-0 transition-colors ${activeThemeConfig.headerBg}`}>
      {/* Zone 1: Wordmark */}
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          onTabChange('reminders');
        }}
        className={`text-lg font-black tracking-tight transition-colors whitespace-nowrap ${
          isLight ? 'text-rose-950 hover:text-rose-600' : 'text-white hover:text-emerald-400'
        }`}
      >
        WishPulse
      </a>

      {/* Zone 2: Nav links */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => onTabChange('reminders')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-rose-600 text-white shadow-xs'
              : isLight
              ? 'text-slate-700 hover:text-rose-600 hover:bg-pink-100/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Reminders
        </button>

        <button
          type="button"
          onClick={() => onTabChange('studio')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'studio'
              ? 'bg-rose-600 text-white shadow-xs font-semibold'
              : isLight
              ? 'text-slate-700 hover:text-rose-600 hover:bg-pink-100/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          WhatsApp Studio
        </button>

        <button
          type="button"
          onClick={() => onTabChange('records')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'records'
              ? 'bg-rose-600 text-white shadow-xs font-semibold'
              : isLight
              ? 'text-slate-700 hover:text-rose-600 hover:bg-pink-100/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Master Records
        </button>

        <button
          type="button"
          onClick={() => onTabChange('queue')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-rose-600 text-white shadow-xs font-semibold'
              : isLight
              ? 'text-slate-700 hover:text-rose-600 hover:bg-pink-100/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Send Queue
        </button>
      </nav>

      {/* Zone 3: Actions + Color Theme Palette Switcher */}
      <div className="flex items-center gap-2">
        {/* Color Palette Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-xs ${
              isLight
                ? 'bg-white hover:bg-pink-50 text-slate-800 border-pink-200'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
            }`}
            title="Change background color theme of the page"
          >
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: activeThemeConfig.dotColor }}
            />
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">{activeThemeConfig.name}</span>
          </button>

          {themeMenuOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
              isLight ? 'bg-white border-pink-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 mb-1 border-b ${
                isLight ? 'border-pink-100 text-slate-500' : 'border-slate-800 text-slate-400'
              }`}>
                Choose Page Color
              </div>
              {Object.values(THEMES).map((th) => {
                const isSelected = th.id === currentTheme;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      onThemeChange(th.id);
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? isLight
                          ? 'bg-pink-100 text-rose-950 font-bold'
                          : 'bg-slate-800 text-white font-semibold'
                        : isLight
                        ? 'text-slate-700 hover:bg-pink-50'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full ring-1 ring-black/10 shrink-0"
                        style={{ backgroundColor: th.dotColor }}
                      />
                      <span>{th.name}</span>
                    </div>
                    {isSelected && <Check className={`w-3.5 h-3.5 ${isLight ? 'text-rose-600' : 'text-emerald-400'}`} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenImportModal}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
            isLight
              ? 'bg-white hover:bg-pink-50 text-slate-700 border-pink-200'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          Import Data
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Reminder</span>
        </button>
      </div>
    </header>
  );
};
