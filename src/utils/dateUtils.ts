export function getOrdinalSuffix(n: number): string {
  if (!n || isNaN(n)) return '';
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

/**
 * Returns celebration details for a given date string (YYYY-MM-DD or MM-DD)
 * relative to a reference date (defaults to current date).
 */
export function getCelebrationCountdown(dateStr: string, referenceDate: Date = new Date()): {
  daysLeft: number;
  isToday: boolean;
  isTomorrow: boolean;
  nextDate: Date;
  formattedNextDate: string;
  originalYear?: number;
} {
  if (!dateStr) {
    return {
      daysLeft: 999,
      isToday: false,
      isTomorrow: false,
      nextDate: new Date(),
      formattedNextDate: 'Unknown',
    };
  }

  const parts = dateStr.split('-');
  let month: number;
  let day: number;
  let originalYear: number | undefined;

  if (parts.length === 3) {
    originalYear = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0], 10) - 1;
    day = parseInt(parts[1], 10);
  } else {
    return {
      daysLeft: 999,
      isToday: false,
      isTomorrow: false,
      nextDate: new Date(),
      formattedNextDate: dateStr,
    };
  }

  const currentYear = referenceDate.getFullYear();
  const today = new Date(currentYear, referenceDate.getMonth(), referenceDate.getDate());

  let targetThisYear = new Date(currentYear, month, day);

  // If this year's date has already passed today, set to next year
  if (targetThisYear.getTime() < today.getTime()) {
    targetThisYear = new Date(currentYear + 1, month, day);
  }

  const diffTime = targetThisYear.getTime() - today.getTime();
  const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isToday = daysLeft === 0;
  const isTomorrow = daysLeft === 1;

  const formattedNextDate = targetThisYear.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    daysLeft,
    isToday,
    isTomorrow,
    nextDate: targetThisYear,
    formattedNextDate,
    originalYear,
  };
}

export function formatEventBadge(daysLeft: number): { label: string; urgency: 'today' | 'soon' | 'later' } {
  if (daysLeft === 0) {
    return { label: 'Today! 🎉', urgency: 'today' };
  }
  if (daysLeft === 1) {
    return { label: 'Tomorrow', urgency: 'soon' };
  }
  if (daysLeft <= 7) {
    return { label: `In ${daysLeft} days`, urgency: 'soon' };
  }
  if (daysLeft <= 30) {
    return { label: `In ${daysLeft} days`, urgency: 'later' };
  }
  return { label: `In ${daysLeft} days`, urgency: 'later' };
}
