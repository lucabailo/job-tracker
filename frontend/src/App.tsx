import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { api, ApiError } from './api/client';
import { Board } from './components/Board';
import { ApplicationForm } from './components/ApplicationForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { StatsBar } from './components/StatsBar';
import { parseJobExport } from './lib/importJobs';
import { TYPES, TYPE_LABEL, type EmploymentType, type JobApplication, type JobApplicationInput, type Stats } from './types';

type Editing = { mode: 'create' } | { mode: 'edit'; application: JobApplication } | null;

export default function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<EmploymentType | ''>('');
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<JobApplication | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    try {
      const [list, summary] = await Promise.all([
        api.list({ q: search, type: type || undefined }),
        api.stats(),
      ]);
      setApplications(list);
      setStats(summary);
      setError(null);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [search, type]);

  // Debounce typing in the search box so we do not send a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(reload, 250);
    return () => clearTimeout(timer);
  }, [reload]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  async function save(input: JobApplicationInput) {
    try {
      if (editing?.mode === 'edit') {
        await api.update(editing.application.id, input);
      } else {
        await api.create(input);
      }
      setEditing(null);
      setFormErrors({});
      await reload();
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fieldErrors).length > 0) {
        setFormErrors(e.fieldErrors);
      } else {
        setError(e instanceof Error ? e.message : 'Could not save');
      }
    }
  }

  async function importFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again later
    if (!file) return;
    try {
      const inputs = parseJobExport(await file.text());
      const { imported, skipped } = await api.importMany(inputs);
      setNotice(
        `Imported ${imported} offer${imported === 1 ? '' : 's'} into the wishlist` +
          (skipped ? `, skipped ${skipped} already tracked.` : '.'),
      );
      setError(null);
      await reload();
    } catch (err) {
      setNotice(null);
      setError(err instanceof Error ? `Import failed: ${err.message}` : 'Import failed');
    }
  }

  function closeForm() {
    setEditing(null);
    setFormErrors({});
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Job Tracker</h1>
          <p className="subtitle">Every application, from wishlist to offer.</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="button-secondary" onClick={() => fileInput.current?.click()}>
            Import offers
          </button>
          <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={importFile} />
          <button type="button" className="button-primary" onClick={() => setEditing({ mode: 'create' })}>
            + New application
          </button>
        </div>
      </header>

      <StatsBar stats={stats} />

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search company or role"
          aria-label="Search company or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value as EmploymentType | '')}>
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      {notice && (
        <p className="notice" role="status">
          {notice}
          <button type="button" className="link-button" aria-label="Dismiss" onClick={() => setNotice(null)}>
            ✕
          </button>
        </p>
      )}

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <Board
          applications={applications}
          onStatusChange={(a, status) => run(() => api.changeStatus(a.id, status))}
          onEdit={(a) => setEditing({ mode: 'edit', application: a })}
          onDelete={setToDelete}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete application?"
          message={`${toDelete.role} at ${toDelete.company} will be removed. This cannot be undone.`}
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            const id = toDelete.id;
            setToDelete(null);
            run(() => api.remove(id));
          }}
        />
      )}

      {editing && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <ApplicationForm
              initial={editing.mode === 'edit' ? editing.application : undefined}
              serverErrors={formErrors}
              onSubmit={save}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
