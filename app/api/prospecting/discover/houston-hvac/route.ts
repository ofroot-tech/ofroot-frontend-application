import {NextRequest} from 'next/server';
import {getAuthTokenFromRequest} from '@/app/lib/cookies';
import {fail, ok} from '@/app/lib/response';
import {getUserFromSessionToken} from '@/app/lib/supabase-store';
import {buildTdlrProspects, TDLR_SOURCE_URL, type TdlrLicenseRow} from '@/app/dashboard/prospecting/tdlr-discovery';

export const runtime = 'nodejs';
export const maxDuration = 20;

const DATASET_ID = '7358-krk7';
const RESOURCE_URL = `https://data.texas.gov/resource/${DATASET_ID}.json`;
const METADATA_URL = `https://data.texas.gov/api/views/${DATASET_ID}`;
const FETCH_LIMIT = 5000;
const IMPORT_LIMIT = 100;

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return fail('Please sign in again.', 401);
  const user = await getUserFromSessionToken(token).catch(() => null);
  if (!user) return fail('Your session has expired. Please sign in again.', 401);

  const params = new URLSearchParams({
    '$select': 'license_type,license_number,business_county,business_name,license_expiration_date_mmddccyy,owner_name,license_subtype',
    '$where': "upper(license_type)='A/C CONTRACTOR' AND upper(business_county)='HARRIS' AND license_expiration_date_mmddccyy IS NOT NULL",
    '$limit': String(FETCH_LIMIT),
  });

  try {
    const headers = {'User-Agent': 'OfRoot-Prospecting/1.0 (communications@ofroot.technology)'};
    const [licensesResponse, metadataResponse] = await Promise.all([
      fetch(`${RESOURCE_URL}?${params}`, {headers, next: {revalidate: 604800}, signal: AbortSignal.timeout(15000)}),
      fetch(METADATA_URL, {headers, next: {revalidate: 604800}, signal: AbortSignal.timeout(15000)}),
    ]);
    if (!licensesResponse.ok) return fail('Texas licensing data is temporarily unavailable. Try again later.', 502);

    const rows = await licensesResponse.json() as TdlrLicenseRow[];
    const metadata = metadataResponse.ok ? await metadataResponse.json() as {rowsUpdatedAt?: number} : {};
    const fetchedAt = new Date().toISOString();
    const datasetUpdatedAt = metadata.rowsUpdatedAt ? new Date(metadata.rowsUpdatedAt * 1000).toISOString() : null;
    const prospects = buildTdlrProspects(rows, datasetUpdatedAt || fetchedAt, todayUtc())
      .map((prospect) => ({...prospect, importedAt: fetchedAt}))
      .sort((a, b) => a.businessName.localeCompare(b.businessName));

    return ok({
      prospects: prospects.slice(0, IMPORT_LIMIT),
      availableCount: prospects.length,
      fetchedAt,
      datasetUpdatedAt,
      source: {name: 'Texas TDLR All Licenses', url: TDLR_SOURCE_URL},
      scope: {market: 'Houston / Harris County', industry: 'HVAC', limit: IMPORT_LIMIT},
      note: 'TDLR verifies licensing evidence. Website, email, and phone enrichment is still required before outreach.',
    }, {headers: {'Cache-Control': 'private, no-store'}});
  } catch {
    return fail('Texas licensing data could not be reached. Try again later.', 502);
  }
}
