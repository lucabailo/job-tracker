import { useState, type FormEvent, type ReactNode } from 'react';
import {
  STATUSES,
  STATUS_LABEL,
  TYPES,
  TYPE_LABEL,
  type JobApplication,
  type JobApplicationInput,
} from '../types';

interface Props {
  initial?: JobApplication;
  /** Errors returned by the server, keyed by field name. */
  serverErrors?: Record<string, string>;
  onSubmit: (input: JobApplicationInput) => void;
  onCancel: () => void;
}

const EMPTY: JobApplicationInput = {
  company: '',
  role: '',
  location: '',
  jobUrl: '',
  type: 'FULL_TIME',
  status: 'WISHLIST',
  appliedOn: null,
  deadline: null,
  notes: '',
};

export function validate(input: JobApplicationInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.company.trim()) errors.company = 'Company is required';
  if (!input.role.trim()) errors.role = 'Role is required';
  if (input.jobUrl && !/^https?:\/\/\S+$/i.test(input.jobUrl.trim())) {
    errors.jobUrl = 'Must start with http:// or https://';
  }
  return errors;
}

export function ApplicationForm({ initial, serverErrors = {}, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<JobApplicationInput>(() =>
    initial ? { ...EMPTY, ...stripMeta(initial) } : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const shownErrors = { ...serverErrors, ...errors };

  function set<K extends keyof JobApplicationInput>(key: K, value: JobApplicationInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>{initial ? 'Edit application' : 'New application'}</h2>

      <Field label="Company" error={shownErrors.company}>
        <input value={values.company} onChange={(e) => set('company', e.target.value)} autoFocus />
      </Field>
      <Field label="Role" error={shownErrors.role}>
        <input value={values.role} onChange={(e) => set('role', e.target.value)} />
      </Field>

      <div className="form-row">
        <Field label="Type">
          <select value={values.type} onChange={(e) => set('type', e.target.value as JobApplicationInput['type'])}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={values.status}
            onChange={(e) => set('status', e.target.value as JobApplicationInput['status'])}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Location">
        <input value={values.location ?? ''} onChange={(e) => set('location', e.target.value)} />
      </Field>
      <Field label="Job posting link" error={shownErrors.jobUrl}>
        <input
          type="url"
          value={values.jobUrl ?? ''}
          placeholder="https://"
          onChange={(e) => set('jobUrl', e.target.value)}
        />
      </Field>

      <div className="form-row">
        <Field label="Deadline">
          <input type="date" value={values.deadline ?? ''} onChange={(e) => set('deadline', e.target.value || null)} />
        </Field>
        <Field label="Applied on">
          <input
            type="date"
            value={values.appliedOn ?? ''}
            onChange={(e) => set('appliedOn', e.target.value || null)}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea rows={3} value={values.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button-primary">
          Save
        </button>
      </div>
    </form>
  );
}

function stripMeta(a: JobApplication): JobApplicationInput {
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = a;
  return rest;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
