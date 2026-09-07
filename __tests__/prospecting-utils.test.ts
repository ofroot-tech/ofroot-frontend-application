import {normalizeProspect, prospectKey, scoreProspect} from '../app/dashboard/prospecting/prospecting-utils';

describe('prospecting utilities', () => {
  const base = {vertical: 'HVAC', website: 'https://example.com', email: 'team@example.com', phone: '555-0100', verifiedFacts: ''};

  it('does not increase priority from an unverified inference', () => {
    const inferredCandidate = {...base, inferredNeed: 'Likely loses calls'};
    expect(scoreProspect(base)).toBe(scoreProspect(inferredCandidate));
  });

  it('deduplicates equivalent website variants', () => {
    expect(prospectKey({...base, businessName: 'Example', market: 'Austin'})).toBe(prospectKey({...base, website: 'http://www.example.com/services', businessName: 'Example', market: 'Austin'}));
  });

  it('migrates earlier browser records with actionable defaults', () => {
    const prospect = normalizeProspect({id: 'old-row', businessName: 'Example HVAC', ...base, source: 'Existing browser import', importedAt: '2026-09-06T00:00:00.000Z', inferredNeed: 'Could need follow-up', outreachStatus: 'researched', notes: ''});
    expect(prospect).toMatchObject({nextAction: '', nextActionAt: '', lastContactedAt: '', outreachOutcome: 'not_set'});
    expect(prospect?.score).toBe(scoreProspect(base));
  });
});
