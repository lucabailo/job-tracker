import type { EmploymentType, JobApplicationInput } from '../types';

/** One offer as it appears in an exported job-search file. Every field is optional. */
interface ExportedJob {
  title?: unknown;
  company?: unknown;
  location?: unknown;
  hours?: unknown;
  category?: unknown;
  deadline?: unknown;
  url?: unknown;
  source?: unknown;
  why?: unknown;
}

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const cut = (value: string, max: number) => (value.length > max ? value.slice(0, max - 1) + '…' : value);

/** Guesses the contract type from a free-text hours field such as "Full-time" or "15-20 h/week". */
export function guessType(hours: string): EmploymentType {
  const h = hours.toLowerCase();
  if (h.includes('intern')) return 'INTERNSHIP';
  if (h.includes('full')) return 'FULL_TIME';
  if (h === '') return 'FULL_TIME';
  return 'PART_TIME';
}

function toInput(job: ExportedJob): JobApplicationInput | null {
  const role = text(job.title);
  const company = text(job.company);
  if (!role && !company) return null;

  const url = text(job.url);
  const deadline = text(job.deadline);
  const notes = [text(job.why), text(job.hours), text(job.category), text(job.source) && `Found on ${text(job.source)}`]
    .filter(Boolean)
    .join('\n');

  return {
    company: cut(company || 'Unknown company', 120),
    role: cut(role || 'Untitled position', 160),
    location: cut(text(job.location), 120) || null,
    jobUrl: /^https?:\/\/\S+$/i.test(url) && url.length <= 500 ? url : null,
    type: guessType(text(job.hours)),
    status: 'WISHLIST',
    appliedOn: null,
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null,
    notes: cut(notes, 4000) || null,
  };
}

/**
 * Reads an exported file: either `{ "jobs": [...] }` or a plain array of offers.
 * Throws a readable error when the file is not in that shape.
 */
export function parseJobExport(raw: string): JobApplicationInput[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  const jobs = Array.isArray(data) ? data : (data as { jobs?: unknown })?.jobs;
  if (!Array.isArray(jobs)) {
    throw new Error('No list of offers found in the file.');
  }
  const inputs = jobs
    .filter((j): j is ExportedJob => typeof j === 'object' && j !== null)
    .map(toInput)
    .filter((j): j is JobApplicationInput => j !== null);
  if (inputs.length === 0) {
    throw new Error('The file contains no offers to import.');
  }
  return inputs;
}
