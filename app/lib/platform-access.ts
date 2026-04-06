import type { User } from '@/app/lib/api';
import { isPaidPlan } from '@/app/lib/plans';

export const PLATFORM_EDITIONS = ['helpr', 'ontask'] as const;

export type PlatformEdition = (typeof PLATFORM_EDITIONS)[number];

type PlatformAccessInput = {
  plan?: string | null;
  top_role?: string | null;
  product_slug?: string | null;
  tenantFeatures?: string[] | null;
};

export type PlatformAccessSnapshot = {
  enabledEditions: PlatformEdition[];
  enabledFeatures: string[];
};

export const PLATFORM_EDITION_CATALOG: Record<
  PlatformEdition,
  {
    name: string;
    label: string;
    description: string;
    featureKeys: string[];
  }
> = {
  helpr: {
    name: 'Helpr',
    label: 'Growth edition',
    description: 'Lead capture, routing, follow-up, and attribution on the shared platform.',
    featureKeys: [
      'edition_helpr',
      'landing_pages',
      'crm_leads',
      'crm_workflows',
      'lead_routing',
      'competitive_analysis',
    ],
  },
  ontask: {
    name: 'OnTask',
    label: 'Operations edition',
    description: 'Billing, invoicing, execution workflows, and customer operations on the same shared platform.',
    featureKeys: [
      'edition_ontask',
      'billing',
      'invoices',
      'quotes',
      'payments',
      'reviews',
      'jobs',
      'crm_contacts',
      'activity',
      'payment_reminders',
    ],
  },
};

function normalizeFeatureKey(value: string): string {
  return String(value || '').trim().toLowerCase();
}

export function normalizeEdition(value: unknown): PlatformEdition | null {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'helpr' || normalized === 'ontask') return normalized;
  return null;
}

export function listFeatureKeysForEdition(edition: PlatformEdition): string[] {
  return PLATFORM_EDITION_CATALOG[edition].featureKeys.slice();
}

export function derivePlatformAccess(input: PlatformAccessInput): PlatformAccessSnapshot {
  const role = String(input.top_role || '').trim().toLowerCase();
  const tenantFeatures = Array.isArray(input.tenantFeatures)
    ? input.tenantFeatures.map(normalizeFeatureKey).filter(Boolean)
    : [];
  const editions = new Set<PlatformEdition>();

  if (role === 'owner' || role === 'admin') {
    PLATFORM_EDITIONS.forEach((edition) => editions.add(edition));
  }

  for (const featureKey of tenantFeatures) {
    const inferredEdition = normalizeEdition(featureKey.replace(/^edition_/, ''));
    if (featureKey.startsWith('edition_') && inferredEdition) {
      editions.add(inferredEdition);
      continue;
    }

    for (const edition of PLATFORM_EDITIONS) {
      if (PLATFORM_EDITION_CATALOG[edition].featureKeys.includes(featureKey)) {
        editions.add(edition);
      }
    }
  }

  const productEdition = normalizeEdition(input.product_slug);
  if (productEdition) editions.add(productEdition);

  // Backward-compatible default for existing paid accounts that predate edition
  // tracking. We can tighten this once tenant entitlements are fully managed.
  if (editions.size === 0 && isPaidPlan(input.plan)) {
    PLATFORM_EDITIONS.forEach((edition) => editions.add(edition));
  }

  const enabledEditions = PLATFORM_EDITIONS.filter((edition) => editions.has(edition));
  const enabledFeatures = Array.from(
    new Set([
      ...tenantFeatures,
      ...enabledEditions.flatMap((edition) => PLATFORM_EDITION_CATALOG[edition].featureKeys),
    ])
  );

  return { enabledEditions, enabledFeatures };
}

export function hasEditionAccess(
  user: Pick<User, 'plan' | 'top_role' | 'product_slug' | 'enabled_features' | 'enabled_editions'> | null | undefined,
  edition: PlatformEdition
): boolean {
  const explicit = Array.isArray(user?.enabled_editions) ? user.enabled_editions : [];
  if (explicit.includes(edition)) return true;

  const derived = derivePlatformAccess({
    plan: user?.plan,
    top_role: user?.top_role,
    product_slug: user?.product_slug,
    tenantFeatures: user?.enabled_features,
  });

  return derived.enabledEditions.includes(edition);
}
