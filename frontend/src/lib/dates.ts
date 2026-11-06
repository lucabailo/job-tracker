const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from `today` to an ISO date (negative if it is in the past). */
export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - start) / DAY_MS);
}

export type DeadlineUrgency = 'overdue' | 'soon' | 'later';

/** A deadline is "soon" within a week, so it stands out on the board. */
export function deadlineUrgency(isoDate: string, today: Date = new Date()): DeadlineUrgency {
  const days = daysUntil(isoDate, today);
  if (days < 0) return 'overdue';
  if (days <= 7) return 'soon';
  return 'later';
}

export function describeDeadline(isoDate: string, today: Date = new Date()): string {
  const days = daysUntil(isoDate, today);
  if (days < 0) return `Deadline passed ${-days} day${days === -1 ? '' : 's'} ago`;
  if (days === 0) return 'Deadline today';
  if (days === 1) return 'Deadline tomorrow';
  return `Deadline in ${days} days`;
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
