import {scoreProspect, type Prospect} from './prospecting-utils';

export const TDLR_SOURCE = 'Texas TDLR · A/C contractors';
export const TDLR_SOURCE_URL = 'https://data.texas.gov/dataset/TDLR-All-Licenses/7358-krk7';

export type TdlrLicenseRow = {
  license_type?: string;
  license_number?: string;
  business_county?: string;
  business_name?: string;
  license_expiration_date_mmddccyy?: string;
  owner_name?: string;
  license_subtype?: string;
};

function parseExpiration(value = '') {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return '';
  return `${match[3]}-${match[1]}-${match[2]}`;
}

function ownerName(value = '') {
  const [last, rest] = value.split(',').map((part) => part.trim());
  if (!rest) return value.trim();
  return `${rest} ${last}`.replace(/\s+/g, ' ').trim();
}

export function buildTdlrProspects(rows: TdlrLicenseRow[], fetchedAt: string, today: string) {
  const seenBusinesses = new Set<string>();
  return rows.flatMap<Prospect>((row) => {
    const businessName = row.business_name?.trim() || '';
    const licenseNumber = row.license_number?.trim() || '';
    const expiresAt = parseExpiration(row.license_expiration_date_mmddccyy);
    const businessKey = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!businessName || !licenseNumber || !expiresAt || expiresAt < today || seenBusinesses.has(businessKey)) return [];
    seenBusinesses.add(businessKey);
    const facts = [
      `Texas TDLR A/C Contractor license ${licenseNumber}`,
      `listed in Harris County`,
      `license expiration ${row.license_expiration_date_mmddccyy}`,
      row.license_subtype ? `classification ${row.license_subtype}` : '',
    ].filter(Boolean).join(' · ');
    const draft = {
      id: `tdlr-acr-${licenseNumber}`,
      businessName,
      vertical: 'HVAC',
      market: 'Houston / Harris County',
      website: '', email: '', phone: '',
      contactName: ownerName(row.owner_name),
      contactTitle: row.owner_name ? 'TDLR license owner' : '',
      source: TDLR_SOURCE,
      sourceId: `tdlr-acr:${licenseNumber}`,
      sourceUrl: TDLR_SOURCE_URL,
      sourceUpdatedAt: fetchedAt,
      licenseNumber,
      licenseExpiresAt: expiresAt,
      importedAt: fetchedAt,
      verifiedFacts: facts,
      inferredNeed: '',
      outreachStatus: 'uncontacted' as const,
      nextAction: 'Find website and contact route',
      nextActionAt: '',
      lastContactedAt: '',
      outreachOutcome: 'not_set' as const,
      notes: '',
    };
    return [{...draft, score: scoreProspect(draft)}];
  });
}
