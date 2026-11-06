import type { Stats } from '../types';
import { formatPercent } from '../lib/dates';

interface Props {
  stats: Stats | null;
}

export function StatsBar({ stats }: Props) {
  if (!stats) return null;
  const active = stats.byStatus.APPLIED + stats.byStatus.INTERVIEW;
  const items = [
    { label: 'Tracked', value: String(stats.total) },
    { label: 'Waiting for an answer', value: String(active) },
    { label: 'Response rate', value: formatPercent(stats.responseRate) },
    { label: 'Interviews & offers', value: formatPercent(stats.interviewRate) },
  ];
  return (
    <section className="stats" aria-label="Statistics">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <span className="stat-value">{item.value}</span>
          <span className="stat-label">{item.label}</span>
        </div>
      ))}
    </section>
  );
}
