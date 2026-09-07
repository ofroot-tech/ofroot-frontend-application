import {mergeDiscoveredProspects, normalizeProspect, prospectKey, scoreProspect, uniqueProspects} from '../app/dashboard/prospecting/prospecting-utils';
import {buildTdlrProspects} from '../app/dashboard/prospecting/tdlr-discovery';

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
    expect(prospect).toMatchObject({sourceId: '', licenseNumber: '', nextAction: '', nextActionAt: '', lastContactedAt: '', outreachOutcome: 'not_set'});
    expect(prospect?.score).toBe(scoreProspect(base));
  });

  it('repairs the research action on a saved TDLR record from either schema', () => {
    const prospect = normalizeProspect({id: 'tdlr-acr-1234', businessName: 'Current Air LLC', licenseNumber: '1234', vertical: 'HVAC', market: 'Houston / Harris County', nextAction: ''});
    expect(prospect?.nextAction).toBe('Find website and contact route');
  });
});

describe('TDLR discovery', () => {
  it('keeps current licenses, converts public owner names, and excludes expired rows', () => {
    const prospects = buildTdlrProspects([
      {business_name: 'Current Air LLC', license_number: '1234', business_county: 'HARRIS', owner_name: 'DOE, JANE Q', license_subtype: 'AE', license_expiration_date_mmddccyy: '12/31/2027'},
      {business_name: 'Old Air LLC', license_number: '5678', business_county: 'HARRIS', license_expiration_date_mmddccyy: '01/01/2025'},
    ], '2026-09-07T12:00:00.000Z', '2026-09-07');

    expect(prospects).toHaveLength(1);
    expect(prospects[0]).toMatchObject({businessName: 'Current Air LLC', contactName: 'JANE Q DOE', contactTitle: 'TDLR license owner', licenseNumber: '1234', nextAction: 'Find website and contact route'});
    expect(prospects[0].verifiedFacts).toContain('Texas TDLR A/C Contractor license 1234');
  });

  it('deduplicates source records even when later contact data differs', () => {
    const [prospect] = buildTdlrProspects([{business_name: 'Current Air LLC', license_number: '1234', license_expiration_date_mmddccyy: '12/31/2027'}], '2026-09-07T12:00:00.000Z', '2026-09-07');
    expect(uniqueProspects([prospect], [{...prospect, id: 'second', phone: '713-555-0100'}])).toEqual([]);
  });

  it('refreshes source evidence without overwriting operator contact work', () => {
    const [prospect] = buildTdlrProspects([{business_name: 'Current Air LLC', license_number: '1234', owner_name: 'DOE, JANE', license_expiration_date_mmddccyy: '12/31/2027'}], '2026-09-07T12:00:00.000Z', '2026-09-07');
    const existing = {...prospect, email: 'owner@current-air.example', notes: 'Called Monday', nextAction: ''};
    const incoming = {...prospect, sourceUpdatedAt: '2026-09-14T12:00:00.000Z', licenseExpiresAt: '2028-12-31', verifiedFacts: 'Updated license evidence'};
    const result = mergeDiscoveredProspects([existing], [incoming]);

    expect(result).toMatchObject({added: 0, refreshed: 1});
    expect(result.prospects[0]).toMatchObject({email: 'owner@current-air.example', notes: 'Called Monday', nextAction: 'Find website and contact route', sourceUpdatedAt: '2026-09-14T12:00:00.000Z', licenseExpiresAt: '2028-12-31', verifiedFacts: 'Updated license evidence'});
  });
});

it('imports a named contact and uses it in draft outreach', () => {
  const [prospect] = require('../app/dashboard/prospecting/prospecting-utils').buildProspects(require('../app/dashboard/prospecting/prospecting-utils').parseCsv('company,first_name,title,email\nAcme HVAC,Avery,Owner,avery@acme.example'), 'CSV import');
  expect(prospect).toMatchObject({contactName: 'Avery', contactTitle: 'Owner'});
  expect(require('../app/dashboard/prospecting/prospecting-utils').emailDraft(prospect)).toContain('Hi Avery,');
});
