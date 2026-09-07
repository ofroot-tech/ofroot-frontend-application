export type OutreachStatus = 'uncontacted' | 'researched' | 'email_drafted' | 'call_queued' | 'contacted';
export type OutreachOutcome = 'not_set' | 'positive' | 'no_response' | 'not_a_fit' | 'do_not_contact';

export type Prospect = {
  id: string;
  businessName: string;
  vertical: string;
  market: string;
  website: string;
  email: string;
  phone: string;
  contactName: string;
  contactTitle: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  sourceUpdatedAt: string;
  licenseNumber: string;
  licenseExpiresAt: string;
  importedAt: string;
  verifiedFacts: string;
  inferredNeed: string;
  score: number;
  outreachStatus: OutreachStatus;
  nextAction: string;
  nextActionAt: string;
  lastContactedAt: string;
  outreachOutcome: OutreachOutcome;
  notes: string;
};

type CsvRow = Record<string, string>;

const statuses: OutreachStatus[] = ['uncontacted', 'researched', 'email_drafted', 'call_queued', 'contacted'];
const outcomes: OutreachOutcome[] = ['not_set', 'positive', 'no_response', 'not_a_fit', 'do_not_contact'];

const aliases: Record<string, string[]> = {
  businessName: ['business', 'business_name', 'company', 'company_name', 'name'],
  vertical: ['vertical', 'industry', 'service', 'category'],
  market: ['market', 'city', 'location', 'metro'],
  website: ['website', 'url', 'domain'],
  email: ['email', 'email_address'],
  phone: ['phone', 'phone_number', 'telephone'],
  contactName: ['contact_name', 'contact', 'full_name', 'decision_maker', 'first_name'],
  contactTitle: ['contact_title', 'title', 'job_title', 'role'],
  verifiedFacts: ['verified_facts', 'evidence', 'facts', 'notes'],
  inferredNeed: ['inferred_need', 'need', 'likely_need', 'opportunity'],
  sourceId: ['source_id', 'external_id'],
  sourceUrl: ['source_url'],
  sourceUpdatedAt: ['source_updated_at'],
  licenseNumber: ['license_number', 'license'],
  licenseExpiresAt: ['license_expires_at', 'license_expiration_date'],
};

function valueFor(row: CsvRow, field: keyof typeof aliases) {
  const key = aliases[field].find((candidate) => row[candidate]);
  return key ? row[key].trim() : '';
}

function parseLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseLine(lines[0]).map((header) => header.toLowerCase().trim().replace(/\s+/g, '_'));
  return lines.slice(1).map((line) => headers.reduce<CsvRow>((row, header, index) => {
    row[header] = parseLine(line)[index] || '';
    return row;
  }, {}));
}

type ScoreableProspect = Pick<Prospect, 'vertical' | 'website' | 'email' | 'phone' | 'verifiedFacts'>;

export function scoreProspect(prospect: ScoreableProspect) {
  const verticalFit = ['plumbing', 'hvac', 'roofing'].includes(prospect.vertical.toLowerCase()) ? 35 : 15;
  const contactability = [prospect.website, prospect.email, prospect.phone].filter(Boolean).length * 12;
  return Math.min(100, verticalFit + contactability + (prospect.verifiedFacts ? 18 : 0));
}

export function scoreReasons(prospect: ScoreableProspect) {
  const reasons = [
    ['plumbing', 'hvac', 'roofing'].includes(prospect.vertical.toLowerCase()) ? 'target vertical' : 'other vertical',
    ...(['website', 'email', 'phone'] as const).filter((field) => Boolean(prospect[field])).map((field) => `${field} available`),
  ];
  if (prospect.verifiedFacts) reasons.push('verified evidence');
  return reasons;
}

export function normalizeProspect(raw: Partial<Prospect>): Prospect | null {
  if (!raw.id || !raw.businessName) return null;
  const draft = {
    id: raw.id,
    businessName: raw.businessName,
    vertical: raw.vertical || 'Unclassified',
    market: raw.market || 'Unspecified market',
    website: raw.website || '',
    email: raw.email || '',
    phone: raw.phone || '',
    contactName: raw.contactName || '',
    contactTitle: raw.contactTitle || '',
    source: raw.source || 'Previous browser import',
    sourceId: raw.sourceId || '',
    sourceUrl: raw.sourceUrl || '',
    sourceUpdatedAt: raw.sourceUpdatedAt || raw.importedAt || '',
    licenseNumber: raw.licenseNumber || '',
    licenseExpiresAt: raw.licenseExpiresAt || '',
    importedAt: raw.importedAt || new Date().toISOString(),
    verifiedFacts: raw.verifiedFacts || '',
    inferredNeed: raw.inferredNeed || '',
    outreachStatus: statuses.includes(raw.outreachStatus as OutreachStatus) ? raw.outreachStatus as OutreachStatus : 'uncontacted',
    nextAction: raw.nextAction || '',
    nextActionAt: raw.nextActionAt || '',
    lastContactedAt: raw.lastContactedAt || '',
    outreachOutcome: outcomes.includes(raw.outreachOutcome as OutreachOutcome) ? raw.outreachOutcome as OutreachOutcome : 'not_set',
    notes: raw.notes || '',
  };
  return {...draft, score: scoreProspect(draft)};
}

export function buildProspects(rows: CsvRow[], source: string): Prospect[] {
  const importedAt = new Date().toISOString();
  return rows.map((row, index) => {
    const businessName = valueFor(row, 'businessName');
    const draft = {
      id: `${importedAt}-${index}-${businessName || 'row'}`,
      businessName,
      vertical: valueFor(row, 'vertical') || 'Unclassified',
      market: valueFor(row, 'market') || 'Unspecified market',
      website: valueFor(row, 'website'), email: valueFor(row, 'email'), phone: valueFor(row, 'phone'),
      contactName: valueFor(row, 'contactName'), contactTitle: valueFor(row, 'contactTitle'),
      source, importedAt, verifiedFacts: valueFor(row, 'verifiedFacts'), inferredNeed: valueFor(row, 'inferredNeed'),
      sourceId: valueFor(row, 'sourceId'), sourceUrl: valueFor(row, 'sourceUrl'), sourceUpdatedAt: valueFor(row, 'sourceUpdatedAt'),
      licenseNumber: valueFor(row, 'licenseNumber'), licenseExpiresAt: valueFor(row, 'licenseExpiresAt'),
      outreachStatus: 'uncontacted' as const, nextAction: '', nextActionAt: '', lastContactedAt: '', outreachOutcome: 'not_set' as const, notes: '',
    };
    return {...draft, score: scoreProspect(draft)};
  }).filter((prospect) => Boolean(prospect.businessName));
}

export function normalizedWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    return new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return trimmed.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  }
}

export function prospectKey(prospect: Pick<Prospect, 'website' | 'email' | 'phone' | 'businessName' | 'market'>) {
  const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalizedWebsite(prospect.website) || clean(prospect.email) || clean(prospect.phone) || `${clean(prospect.businessName)}-${clean(prospect.market)}`;
}

export function prospectKeys(prospect: Pick<Prospect, 'sourceId' | 'website' | 'email' | 'phone' | 'businessName' | 'market'>) {
  const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return [
    prospect.sourceId ? `source:${clean(prospect.sourceId)}` : '',
    normalizedWebsite(prospect.website) ? `domain:${normalizedWebsite(prospect.website)}` : '',
    prospect.email ? `email:${clean(prospect.email)}` : '',
    prospect.phone ? `phone:${clean(prospect.phone)}` : '',
    `name-market:${clean(prospect.businessName)}-${clean(prospect.market)}`,
  ].filter(Boolean);
}

export function uniqueProspects(existing: Prospect[], incoming: Prospect[]) {
  const keys = new Set(existing.flatMap(prospectKeys));
  const unique: Prospect[] = [];
  for (const prospect of incoming) {
    const candidateKeys = prospectKeys(prospect);
    if (candidateKeys.some((key) => keys.has(key))) continue;
    unique.push(prospect);
    candidateKeys.forEach((key) => keys.add(key));
  }
  return unique;
}

export function mergeDiscoveredProspects(existing: Prospect[], incoming: Prospect[]) {
  const prospects = [...existing];
  let added = 0;
  let refreshed = 0;

  for (const candidate of incoming) {
    const candidateKeys = new Set(prospectKeys(candidate));
    const index = prospects.findIndex((item) => prospectKeys(item).some((key) => candidateKeys.has(key)));
    if (index < 0) {
      prospects.push(candidate);
      added += 1;
      continue;
    }

    const current = prospects[index];
    if (!candidate.sourceId || candidate.sourceId !== current.sourceId) continue;
    const updated = {
      ...current,
      source: candidate.source,
      sourceUrl: candidate.sourceUrl,
      sourceUpdatedAt: candidate.sourceUpdatedAt,
      licenseNumber: candidate.licenseNumber,
      licenseExpiresAt: candidate.licenseExpiresAt,
      verifiedFacts: candidate.verifiedFacts,
      contactName: current.contactName || candidate.contactName,
      contactTitle: current.contactTitle || candidate.contactTitle,
      nextAction: current.nextAction || candidate.nextAction,
    };
    prospects[index] = {...updated, score: scoreProspect(updated)};
    refreshed += 1;
  }

  return {prospects, added, refreshed};
}

export function emailDraft(prospect: Prospect) {
  const offer = ['plumbing', 'hvac', 'roofing'].includes(prospect.vertical.toLowerCase()) ? 'lead capture, routing, and follow-up' : 'automation and reliable growth operations';
  const greeting = prospect.contactName.trim().split(/\s+/)[0] || 'there';
  return `Subject: A question about ${prospect.businessName}'s ${offer}\n\nHi ${greeting},\n\nI came across ${prospect.businessName}${prospect.verifiedFacts ? ` and noticed ${prospect.verifiedFacts}` : ''}. We help ${prospect.vertical.toLowerCase()} teams remove the gaps between a new inquiry, a fast response, and a booked conversation.\n\nWould it be useful to compare how your team currently handles ${offer}? I can share a short, practical view of what we would check first.\n\nBest,\nDimitri`;
}

export function callScript(prospect: Prospect) {
  const greeting = prospect.contactName.trim().split(/\s+/)[0] || 'there';
  return `Opening\nHi ${greeting}, this is Dimitri with OfRoot. We work with ${prospect.vertical.toLowerCase()} teams on lead response and follow-up systems. Is now an okay time for one quick question?\n\nDiscovery\n• When a new lead comes in, who owns the first response?\n• Where do inquiries tend to wait or get lost?\n• What would a reliable handoff or follow-up look like for your team?\n\nLikely concern to test\n${prospect.inferredNeed || 'Ask what is slowing lead response or growth operations before proposing a solution.'}\n\nIf they say “we already have software”\nThat makes sense. We usually look at the handoffs between the tools and the people using them, then decide whether any change is warranted.\n\nNext step\nOffer a 20-minute working session to map the current flow and identify the smallest useful improvement.`;
}
