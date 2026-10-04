import React from 'react';
import { Sparkles, Calendar, Heart, Cake, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Celebrant } from '../types';
import { getCelebrationCountdown } from '../utils/dateUtils';

interface Props {
  celebrants: Celebrant[];
  onSelectCelebrant: (c: Celebrant) => void;
  selectedId: string;
}

export const CelebrationBanner: React.FC<Props> = ({
  celebrants,
  onSelectCelebrant,
  selectedId,
}) => {
  // Find celebrations today
  const todayCelebrants = celebrants.filter((c) => {
    const { isToday } = getCelebrationCountdown(c.date);
    return isToday;
  });

  // Find celebrations upcoming within 7 days (excluding today)
  const upcomingThisWeek = celebrants.filter((c) => {
    const { daysLeft, isToday } = getCelebrationCountdown(c.date);
    return !isToday && daysLeft <= 7;
  });

  const totalCount = celebrants.length;
  const wishedCount = celebrants.filter((c) => c.status === 'wished').length;

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Highlight for Today or Next Upcoming */}
        <div className="flex-1">
          {todayCelebrants.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  <span>Happening Today!</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400 font-normal">
                    {todayCelebrants.length} {todayCelebrants.length === 1 ? 'celebration' : 'celebrations'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {todayCelebrants.map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => {
                        onSelectCelebrant(tc);
                        triggerConfetti();
                      }}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                        selectedId === tc.id
                          ? 'text-emerald-300 underline underline-offset-4'
                          : 'text-slate-100 hover:text-emerald-300'
                      }`}
                    >
                      {tc.occasion === 'birthday' ? (
                        <Cake className="w-4 h-4 text-amber-400 inline" />
                      ) : tc.occasion === 'combo' ? (
                        <Sparkles className="w-4 h-4 text-purple-400 inline" />
                      ) : (
                        <Heart className="w-4 h-4 text-rose-400 inline" />
                      )}
                      <span>{tc.name}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({tc.occasion === 'birthday' ? 'Birthday' : tc.occasion === 'combo' ? 'Birthday & Anniversary' : 'Anniversary'})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : upcomingThisWeek.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-sky-400" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider">
                  <span>Next Celebration</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400 font-normal">
                    {getCelebrationCountdown(upcomingThisWeek[0].date).formattedNextDate}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCelebrant(upcomingThisWeek[0])}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-sky-300 transition-colors mt-0.5"
                >
                  <span>{upcomingThisWeek[0].name}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({upcomingThisWeek[0].occasion === 'birthday' ? 'Birthday' : 'Anniversary'} in{' '}
                    {getCelebrationCountdown(upcomingThisWeek[0].date).daysLeft} days)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">No Celebrations in the Next 7 Days</h4>
                <p className="text-xs text-slate-400">Add or import your dates to prepare upcoming WhatsApp greetings.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Tabular Metrics with unboxed text */}
        <div className="flex items-center gap-6 text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Total People</span>
            <span className="text-base font-semibold text-slate-200 font-mono-nums">{totalCount}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Today</span>
            <span className="text-base font-semibold text-emerald-400 font-mono-nums">
              {todayCelebrants.length}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">This Week</span>
            <span className="text-base font-semibold text-sky-400 font-mono-nums">
              {upcomingThisWeek.length}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Wished</span>
            <span className="text-base font-semibold text-slate-300 font-mono-nums">
              {wishedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
