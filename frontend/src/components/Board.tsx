import { STATUSES, STATUS_LABEL, type JobApplication, type Status } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  applications: JobApplication[];
  onStatusChange: (application: JobApplication, status: Status) => void;
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
}

export function groupByStatus(applications: JobApplication[]): Record<Status, JobApplication[]> {
  const groups = Object.fromEntries(STATUSES.map((s) => [s, [] as JobApplication[]])) as Record<
    Status,
    JobApplication[]
  >;
  for (const a of applications) groups[a.status].push(a);
  return groups;
}

export function Board({ applications, onStatusChange, onEdit, onDelete }: Props) {
  const groups = groupByStatus(applications);
  return (
    <div className="board">
      {STATUSES.map((status) => (
        <section key={status} className={`column column-${status.toLowerCase()}`} aria-label={STATUS_LABEL[status]}>
          <h2 className="column-title">
            {STATUS_LABEL[status]} <span className="column-count">{groups[status].length}</span>
          </h2>
          {groups[status].length === 0 ? (
            <p className="column-empty">Nothing here yet</p>
          ) : (
            groups[status].map((a) => (
              <ApplicationCard
                key={a.id}
                application={a}
                onStatusChange={(s) => onStatusChange(a, s)}
                onEdit={() => onEdit(a)}
                onDelete={() => onDelete(a)}
              />
            ))
          )}
        </section>
      ))}
    </div>
  );
}
