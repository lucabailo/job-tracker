import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationForm, validate } from './ApplicationForm';
import { Board, groupByStatus } from './Board';
import { ConfirmDialog } from './ConfirmDialog';
import type { JobApplication } from '../types';

function application(overrides: Partial<JobApplication>): JobApplication {
  return {
    id: 1,
    company: 'Nordlys Software',
    role: 'Junior Developer',
    location: 'Copenhagen',
    jobUrl: null,
    type: 'FULL_TIME',
    status: 'WISHLIST',
    appliedOn: null,
    deadline: null,
    notes: null,
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
    ...overrides,
  };
}

describe('validate', () => {
  it('requires company and role and checks the link', () => {
    const errors = validate({ ...application({}), company: ' ', role: '', jobUrl: 'jobindex.dk/123' });
    expect(Object.keys(errors).sort()).toEqual(['company', 'jobUrl', 'role']);
  });
});

describe('ApplicationForm', () => {
  it('does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Company is required')).toBeInTheDocument();
  });

  it('submits the typed values', async () => {
    const onSubmit = vi.fn();
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} />);

    await userEvent.type(screen.getByLabelText('Company'), 'Havn Robotics');
    await userEvent.type(screen.getByLabelText('Role'), 'Graduate Engineer');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ company: 'Havn Robotics', role: 'Graduate Engineer', status: 'WISHLIST' }),
    );
  });

  it('shows errors coming from the server', () => {
    render(
      <ApplicationForm serverErrors={{ role: 'size must be between 0 and 160' }} onSubmit={() => {}} onCancel={() => {}} />,
    );
    expect(screen.getByText('size must be between 0 and 160')).toBeInTheDocument();
  });
});

describe('Board', () => {
  const apps = [
    application({ id: 1, status: 'APPLIED' }),
    application({ id: 2, status: 'APPLIED', company: 'Lys Health' }),
    application({ id: 3, status: 'OFFER', company: 'Havn Robotics' }),
  ];

  it('groups applications by status', () => {
    const groups = groupByStatus(apps);
    expect(groups.APPLIED).toHaveLength(2);
    expect(groups.OFFER).toHaveLength(1);
    expect(groups.WISHLIST).toHaveLength(0);
  });

  it('puts each card in its column', () => {
    render(<Board applications={apps} onStatusChange={() => {}} onEdit={() => {}} onDelete={() => {}} />);

    const applied = screen.getByRole('region', { name: 'Applied' });
    expect(within(applied).getAllByRole('article')).toHaveLength(2);
    expect(within(screen.getByRole('region', { name: 'Offer' })).getByText('Havn Robotics')).toBeInTheDocument();
  });

  it('reports a status change from the dropdown', async () => {
    const onStatusChange = vi.fn();
    render(<Board applications={[apps[2]]} onStatusChange={onStatusChange} onEdit={() => {}} onDelete={() => {}} />);

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'REJECTED');

    expect(onStatusChange).toHaveBeenCalledWith(apps[2], 'REJECTED');
  });
});

describe('ConfirmDialog', () => {
  it('confirms, cancels, and closes on Escape', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog title="Delete application?" message="Gone forever" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByRole('alertdialog', { name: 'Delete application?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();

    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
