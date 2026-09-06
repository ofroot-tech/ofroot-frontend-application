export type OutreachStatus = 'uncontacted' | 'researched' | 'email_drafted' | 'call_queued' | 'contacted';

export type Prospect = {
  id: string;
  businessName: string;
  vertical: string;
  market: string;
  website: string;
  email: string;
  phone: string;
  source: string;
  importedAt: string;
  verifiedFacts: string;
  inferredNeed: string;
  score: number;
  outreachStatus: OutreachStatus;
  notes: string;
};

type CsvRow = Record<string, string>;

const aliases: Record<string, string[]> = {
  businessName: ['business', 'business_name', 'company', 'company_name', 'name'],
  vertical: ['vertical', 'industry', 'service', 'category'],
  market: ['market', 'city', 'location', 'metro'],
  website: ['website', 'url', 'domain'],
  email: ['email', 'email_address'],
  phone: ['phone', 'phone_number', 'telephone'],
  verifiedFacts: ['verified_facts', 'evidence', 'facts', 'notes'],
  inferredNeed: ['inferred_need', 'need', 'likely_need', 'opportunity'],
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

export function scoreProspect(prospect: Pick<Prospect, 'vertical' | 'website' | 'email' | 'phone' | 'verifiedFacts' | 'inferredNeed'>) {
  const verticalFit = ['plumbing', 'hvac', 'roofing'].includes(prospect.vertical.toLowerCase()) ? 35 : 15;
  const contactability = [prospect.website, prospect.email, prospect.phone].filter(Boolean).length * 12;
  return Math.min(100, verticalFit + contactability + (prospect.verifiedFacts ? 18 : 0) + (prospect.inferredNeed ? 11 : 0));
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
      source, importedAt, verifiedFacts: valueFor(row, 'verifiedFacts'), inferredNeed: valueFor(row, 'inferredNeed'),
      outreachStatus: 'uncontacted' as const, notes: '',
    };
    return {...draft, score: scoreProspect(draft)};
  }).filter((prospect) => Boolean(prospect.businessName));
}

export function prospectKey(prospect: Pick<Prospect, 'website' | 'email' | 'phone' | 'businessName' | 'market'>) {
  const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean(prospect.website) || clean(prospect.email) || clean(prospect.phone) || `${clean(prospect.businessName)}-${clean(prospect.market)}`;
}

export function emailDraft(prospect: Prospect) {
  const offer = ['plumbing', 'hvac', 'roofing'].includes(prospect.vertical.toLowerCase()) ? 'lead capture, routing, and follow-up' : 'automation and reliable growth operations';
  return `Subject: A question about ${prospect.businessName}'s ${offer}\n\nHi {{first_name}},\n\nI came across ${prospect.businessName}${prospect.verifiedFacts ? ` and noticed ${prospect.verifiedFacts}` : ''}. We help ${prospect.vertical.toLowerCase()} teams remove the gaps between a new inquiry, a fast response, and a booked conversation.\n\nWould it be useful to compare how your team currently handles ${offer}? I can share a short, practical view of what we would check first.\n\nBest,\nDimitri`;
}

export function callScript(prospect: Prospect) {
  return `Opening\nHi {{first_name}}, this is Dimitri with OfRoot. We work with ${prospect.vertical.toLowerCase()} teams on lead response and follow-up systems. Is now an okay time for one quick question?\n\nDiscovery\n• When a new lead comes in, who owns the first response?\n• Where do inquiries tend to wait or get lost?\n• What would a reliable handoff or follow-up look like for your team?\n\nLikely concern to test\n${prospect.inferredNeed || 'Ask what is slowing lead response or growth operations before proposing a solution.'}\n\nIf they say “we already have software”\nThat makes sense. We usually look at the handoffs between the tools and the people using them, then decide whether any change is warranted.\n\nNext step\nOffer a 20-minute working session to map the current flow and identify the smallest useful improvement.`;
}
