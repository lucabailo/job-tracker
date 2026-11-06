import { guessType, parseJobExport } from './importJobs';

describe('guessType', () => {
  it('reads the contract type from the hours text', () => {
    expect(guessType('Full-time')).toBe('FULL_TIME');
    expect(guessType('15-20 h/week')).toBe('PART_TIME');
    expect(guessType('Paid internship')).toBe('INTERNSHIP');
    expect(guessType('')).toBe('FULL_TIME');
  });
});

describe('parseJobExport', () => {
  it('turns exported offers into wishlist applications', () => {
    const file = JSON.stringify({
      jobs: [
        {
          title: 'Junior Backend Developer',
          company: 'Fjord Logistics',
          location: 'Copenhagen',
          hours: 'Full-time',
          category: 'Sviluppo software',
          deadline: '2026-11-20',
          url: 'https://jobs.example.com/42',
          source: 'Jobindex',
          why: 'Java and Spring Boot, thesis possible',
        },
      ],
    });

    const [app] = parseJobExport(file);

    expect(app).toMatchObject({
      company: 'Fjord Logistics',
      role: 'Junior Backend Developer',
      type: 'FULL_TIME',
      status: 'WISHLIST',
      deadline: '2026-11-20',
      jobUrl: 'https://jobs.example.com/42',
    });
    expect(app.notes).toContain('thesis possible');
    expect(app.notes).toContain('Found on Jobindex');
  });

  it('accepts a plain array and drops unusable values', () => {
    const [app] = parseJobExport(JSON.stringify([{ title: 'Student Developer', url: 'not a link', deadline: 'soon' }]));
    expect(app.company).toBe('Unknown company');
    expect(app.jobUrl).toBeNull();
    expect(app.deadline).toBeNull();
  });

  it('explains what is wrong with a bad file', () => {
    expect(() => parseJobExport('{oops')).toThrow('not valid JSON');
    expect(() => parseJobExport('{"days": []}')).toThrow('No list of offers');
    expect(() => parseJobExport('{"jobs": []}')).toThrow('no offers');
  });
});
