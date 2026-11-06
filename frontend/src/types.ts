export const STATUSES = ['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'] as const;
export type Status = (typeof STATUSES)[number];

export const TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP'] as const;
export type EmploymentType = (typeof TYPES)[number];

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  location: string | null;
  jobUrl: string | null;
  type: EmploymentType;
  status: Status;
  appliedOn: string | null; // ISO date, e.g. "2026-11-06"
  deadline: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** What the form sends to the API on create and update. */
export type JobApplicationInput = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>;

export interface Stats {
  total: number;
  submitted: number;
  byStatus: Record<Status, number>;
  responseRate: number;
  interviewRate: number;
}

export const STATUS_LABEL: Record<Status, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

export const TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
};
