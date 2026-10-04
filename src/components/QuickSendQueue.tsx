import React, { useState } from 'react';
import { 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Clock, 
  Cake, 
  Heart, 
  Sparkles, 
  RotateCcw,
  CheckCheck,
  MessageCircle,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Celebrant } from '../types';
import { DEFAULT_TEMPLATES, resolveMessage } from '../utils/templates';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { getCelebrationCountdown } from '../utils/dateUtils';

interface Props {
  celebrants: Celebrant[];
  onToggleStatus: (id: string) => void;
  senderName: string;
  onSelectCelebrant: (c: Celebrant) => void;
}

export const QuickSendQueue: React.FC<Props> = ({
  celebrants,
  onToggleStatus,
  senderName,
  onSelectCelebrant,
}) => {
  // Queue contains pending celebrations, prioritized by days left
  const pendingCelebrants = celebrants
    .filter((c) => c.status === 'pending')
    .map((c) => ({ ...c, countdown: getCelebrationCountdown(c.date) }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCelebrant = pendingCelebrants[currentIndex] || null;

  const currentTemplate = currentCelebrant
    ? DEFAULT_TEMPLATES.find((t) => t.occasion === currentCelebrant.occasion)
    : null;

  const resolvedMsg = currentCelebrant && currentTemplate
    ? resolveMessage(currentCelebrant, currentCelebrant.customMessage || currentTemplate.template, senderName)
    : '';

  const handleSendAndNext = () => {
    if (!currentCelebrant) return;

    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#25D366', '#FFD700', '#FF69B4'],
    });

    // Launch WhatsApp
    const waLink = buildWhatsAppLink(currentCelebrant.phone, resolvedMsg, currentCelebrant.countryCode);
    window.open(waLink, '_blank', 'noopener,noreferrer');

    // Mark as wished
    onToggleStatus(currentCelebrant.id);

    // If there are more pending items, advance or clamp
    if (currentIndex >= pendingCelebrants.length - 1) {
      setCurrentIndex(Math.max(0, pendingCelebrants.length - 2));
    }
  };

  const handleSkip = () => {
    if (currentIndex < pendingCelebrants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (pendingCelebrants.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">All Caught Up!</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Every upcoming birthday and anniversary celebration has been marked as wished. Great job keeping your connections warm!
        </p>
        <button
          type="button"
          onClick={() => {
            // Unmark first one to test again if desired
            if (celebrants.length > 0) {
              onToggleStatus(celebrants[0].id);
            }
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
        >
          Reset First Contact to Pending
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Queue Progress Bar Header */}
      <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Rapid WhatsApp Send Queue</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            {currentIndex + 1} of {pendingCelebrants.length} Pending
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            title="Previous celebrant"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-slate-400 font-mono-nums">
            {currentIndex + 1}/{pendingCelebrants.length}
          </span>
          <button
            type="button"
            disabled={currentIndex >= pendingCelebrants.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            title="Next celebrant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {currentCelebrant && (
        <div className="p-6 flex flex-col gap-6">
          {/* Celebrant Profile Card */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-inner ${
                currentCelebrant.occasion === 'birthday'
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                  : 'bg-gradient-to-tr from-rose-600 to-rose-400'
              }`}>
                {currentCelebrant.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{currentCelebrant.name}</h3>
                  {currentCelebrant.countdown.isToday && (
                    <span className="text-[10px] text-emerald-400 font-mono-nums font-bold">
                      · TODAY
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="capitalize flex items-center gap-1 font-medium text-slate-300">
                    {currentCelebrant.occasion === 'birthday' ? (
                      <Cake className="w-3.5 h-3.5 text-amber-400 inline" />
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-rose-400 inline" />
                    )}
                    {currentCelebrant.occasion}
                  </span>
                  <span>·</span>
                  <span>{currentCelebrant.relationship}</span>
                  {currentCelebrant.years && (
                    <>
                      <span>·</span>
                      <span className="font-mono-nums">{currentCelebrant.years} years</span>
                    </>
                  )}
                  <span>·</span>
                  <span className="font-mono-nums text-slate-300">{currentCelebrant.phone}</span>
                </div>

                {currentCelebrant.notes && (
                  <p className="text-xs text-slate-400 italic mt-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800/80 inline-block">
                    &ldquo;{currentCelebrant.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">Celebration Date</div>
              <div className="text-sm font-semibold text-slate-200 font-mono-nums">
                {currentCelebrant.countdown.formattedNextDate}
              </div>
              <div className={`text-xs font-semibold ${
                currentCelebrant.countdown.isToday ? 'text-emerald-400' : 'text-sky-400'
              }`}>
                {currentCelebrant.countdown.isToday ? 'Today! 🎉' : `In ${currentCelebrant.countdown.daysLeft} days`}
              </div>
            </div>
          </div>

          {/* WhatsApp Message Preview Bubble */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                WhatsApp Greeting to Send
              </label>
              <button
                type="button"
                onClick={() => onSelectCelebrant(currentCelebrant)}
                className="text-emerald-400 hover:underline"
              >
                Customize text & tone in editor &rarr;
              </button>
            </div>

            <div className="wa-wallpaper-pattern p-4 rounded-xl border border-slate-800">
              <div className="max-w-lg ml-auto bg-[#005c4b] text-slate-100 rounded-lg rounded-tr-none p-3.5 text-xs shadow-md">
                <div className="whitespace-pre-wrap leading-relaxed font-sans">
                  {resolvedMsg}
                </div>
                <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-300 opacity-80">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Skip for Now &rarr;
            </button>

            <button
              type="button"
              onClick={handleSendAndNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send in WhatsApp & Mark as Wished</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
