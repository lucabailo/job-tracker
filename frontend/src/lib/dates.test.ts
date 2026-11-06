import { daysUntil, deadlineUrgency, describeDeadline, formatPercent } from './dates';

const today = new Date(2026, 10, 6); // 6 November 2026, local time

describe('daysUntil', () => {
  it('counts whole days, ignoring the time of day', () => {
    expect(daysUntil('2026-11-06', today)).toBe(0);
    expect(daysUntil('2026-11-10', today)).toBe(4);
    expect(daysUntil('2026-11-01', today)).toBe(-5);
  });

  it('works across month boundaries', () => {
    expect(daysUntil('2026-12-01', today)).toBe(25);
  });
});

describe('deadlineUrgency', () => {
  it('flags deadlines within a week as soon', () => {
    expect(deadlineUrgency('2026-11-13', today)).toBe('soon');
    expect(deadlineUrgency('2026-11-14', today)).toBe('later');
    expect(deadlineUrgency('2026-11-05', today)).toBe('overdue');
  });
});

describe('describeDeadline', () => {
  it('uses friendly wording', () => {
    expect(describeDeadline('2026-11-06', today)).toBe('Deadline today');
    expect(describeDeadline('2026-11-07', today)).toBe('Deadline tomorrow');
    expect(describeDeadline('2026-11-09', today)).toBe('Deadline in 3 days');
    expect(describeDeadline('2026-11-05', today)).toBe('Deadline passed 1 day ago');
  });
});

describe('formatPercent', () => {
  it('rounds to a whole percentage', () => {
    expect(formatPercent(2 / 3)).toBe('67%');
    expect(formatPercent(0)).toBe('0%');
  });
});
