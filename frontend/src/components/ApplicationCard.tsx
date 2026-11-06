import { STATUSES, STATUS_LABEL, TYPE_LABEL, type JobApplication, type Status } from '../types';
import { deadlineUrgency, describeDeadline, formatDate } from '../lib/dates';

interface Props {
  application: JobApplication;
  onStatusChange: (status: Status) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ApplicationCard({ application: a, onStatusChange, onEdit, onDelete }: Props) {
  // A deadline only matters while the application has not been sent yet.
  const showDeadline = a.deadline !== null && a.status === 'WISHLIST';

  return (
    <article className="card" aria-label={`${a.role} at ${a.company}`}>
      <header className="card-head">
        <h3 className="card-company">{a.company}</h3>
        <span className={`badge badge-${a.type.toLowerCase()}`}>{TYPE_LABEL[a.type]}</span>
      </header>
      <p className="card-role">
        {a.jobUrl ? (
          <a href={a.jobUrl} target="_blank" rel="noreferrer">
            {a.role}
          </a>
        ) : (
          a.role
        )}
      </p>
      {a.location && <p className="card-meta">{a.location}</p>}
      {a.appliedOn && <p className="card-meta">Applied {formatDate(a.appliedOn)}</p>}
      {showDeadline && (
        <p className={`card-deadline deadline-${deadlineUrgency(a.deadline!)}`}>{describeDeadline(a.deadline!)}</p>
      )}
      {a.notes && <p className="card-notes">{a.notes}</p>}
      <footer className="card-actions">
        <label className="visually-hidden" htmlFor={`status-${a.id}`}>
          Status
        </label>
        <select
          id={`status-${a.id}`}
          value={a.status}
          onChange={(e) => onStatusChange(e.target.value as Status)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="button" className="link-button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="link-button danger" onClick={onDelete}>
          Delete
        </button>
      </footer>
    </article>
  );
}
