import {
  AUTOMATION_CATALOG,
  getAutomationCatalogItem,
  isAutomationCatalogId,
  type AutomationCatalogId,
  type AutomationDeliveryStatus,
} from '@/app/lib/automation-catalog';
import { findLatestAutomationLeadByEmail, getUserFromSessionToken } from '@/app/lib/supabase-store';

export type AutomationStageId =
  | 'intake_submitted'
  | 'discovery_planning'
  | 'build_in_progress'
  | 'qa_review'
  | 'live';

export type AutomationStageState = 'complete' | 'current' | 'upcoming';

export type AutomationStage = {
  id: AutomationStageId;
  label: string;
  description: string;
  state: AutomationStageState;
};

export type AutomationSelectionStatus = {
  id: AutomationCatalogId;
  label: string;
  description: string;
  status: Exclude<AutomationDeliveryStatus, 'not_selected'>;
};

export type AutomationCatalogStatus = {
  id: AutomationCatalogId;
  label: string;
  description: string;
  selected: boolean;
  status: AutomationDeliveryStatus;
};

export type AutomationBuildProgress = {
  available: boolean;
  reason?: string;
  email: string;
  leadId?: number;
  leadStatus?: string | null;
  currentStage: AutomationStageId | 'not_started';
  blocked: boolean;
  blockedReason?: string;
  lastUpdatedAt?: string | null;
  stages: AutomationStage[];
  selectedAutomations: AutomationSelectionStatus[];
  catalogAutomations: AutomationCatalogStatus[];
};

const STAGES: Array<Omit<AutomationStage, 'state'>> = [
  {
    id: 'intake_submitted',
    label: 'Intake submitted',
    description: 'We received your onboarding details and automation requirements.',
  },
  {
    id: 'discovery_planning',
    label: 'Discovery and planning',
    description: 'We review your stack, define scope, and confirm success criteria.',
  },
  {
    id: 'build_in_progress',
    label: 'Build in progress',
    description: 'Automation workflows, lead routing, and integrations are being implemented.',
  },
  {
    id: 'qa_review',
    label: 'QA and handoff',
    description: 'We validate behavior, edge cases, and document operating instructions.',
  },
  {
    id: 'live',
    label: 'Automations online',
    description: 'Your selected automations are online and ready for monitoring.',
  },
];

const stageIndexById = STAGES.reduce<Record<AutomationStageId, number>>((acc, stage, index) => {
  acc[stage.id] = index;
  return acc;
}, {} as Record<AutomationStageId, number>);

function normalizeStatus(status?: string | null) {
  return String(status || '').trim().toLowerCase();
}

function stageFromLeadStatus(status?: string | null): AutomationStageId {
  const normalized = normalizeStatus(status);
  if (normalized === 'routed') return 'discovery_planning';
  if (normalized === 'accepted') return 'build_in_progress';
  if (normalized === 'quoted') return 'qa_review';
  if (normalized === 'won') return 'live';
  return 'intake_submitted';
}

function stageDefaultAutomationStatus(
  stage: AutomationStageId | 'not_started'
): Exclude<AutomationDeliveryStatus, 'not_selected'> {
  if (stage === 'live') return 'online';
  if (stage === 'build_in_progress' || stage === 'qa_review') return 'in_progress';
  return 'queued';
}

function normalizeAutomationDeliveryStatus(
  value: unknown,
  fallback: Exclude<AutomationDeliveryStatus, 'not_selected'>
): Exclude<AutomationDeliveryStatus, 'not_selected'> {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'online') return 'online';
  if (normalized === 'in_progress' || normalized === 'building' || normalized === 'build_in_progress') return 'in_progress';
  if (normalized === 'queued' || normalized === 'planned' || normalized === 'pending') return 'queued';
  return fallback;
}

function buildStages(currentIndex: number | null): AutomationStage[] {
  return STAGES.map((stage, index) => {
    let state: AutomationStageState = 'upcoming';
    if (currentIndex != null) {
      if (index < currentIndex) state = 'complete';
      if (index === currentIndex) state = 'current';
    }
    return { ...stage, state };
  });
}

function inferSelectedAutomations(meta: Record<string, any>): AutomationCatalogId[] {
  const services = meta?.automation_services || {};
  const selectedRaw = Array.isArray(services?.selected_automations)
    ? services.selected_automations
    : [];

  const selected: AutomationCatalogId[] = [];
  for (const raw of selectedRaw) {
    const value = String(raw);
    if (isAutomationCatalogId(value) && !selected.includes(value)) {
      selected.push(value);
    }
  }

  if (selected.length > 0) return selected;

  const fallback: AutomationCatalogId[] = [];
  if (services?.csv_capture_enabled !== false) fallback.push('lead_capture_csv');
  if (services?.auto_response_enabled === true) {
    const channel = String(meta?.onboarding?.primary_channel || '').toLowerCase();
    if (channel === 'instagram' || channel === 'both') fallback.push('instagram_dm_autoresponder');
    if (channel === 'facebook' || channel === 'both') fallback.push('facebook_dm_autoresponder');
  }

  return Array.from(new Set(fallback));
}

function buildSelectedAutomations(params: {
  selectedIds: AutomationCatalogId[];
  stage: AutomationStageId | 'not_started';
  statusesFromMeta: Record<string, unknown>;
}): AutomationSelectionStatus[] {
  const fallback = stageDefaultAutomationStatus(params.stage);

  return params.selectedIds.map((id) => {
    const item = getAutomationCatalogItem(id);
    const metaStatus = params.statusesFromMeta?.[id];
    return {
      id,
      label: item.label,
      description: item.description,
      status: normalizeAutomationDeliveryStatus(metaStatus, fallback),
    };
  });
}

function buildCatalogAutomations(selected: AutomationSelectionStatus[]): AutomationCatalogStatus[] {
  const selectedMap = new Map(selected.map((item) => [item.id, item]));

  return AUTOMATION_CATALOG.map((item) => {
    const selectedItem = selectedMap.get(item.id);
    if (!selectedItem) {
      return {
        id: item.id,
        label: item.label,
        description: item.description,
        selected: false,
        status: 'not_selected',
      } satisfies AutomationCatalogStatus;
    }

    return {
      id: item.id,
      label: item.label,
      description: item.description,
      selected: true,
      status: selectedItem.status,
    } satisfies AutomationCatalogStatus;
  });
}

export async function getAutomationBuildProgressForToken(token: string): Promise<AutomationBuildProgress> {
  const me = await getUserFromSessionToken(token);
  if (!me) {
    return {
      available: false,
      reason: 'Unauthorized',
      email: '',
      currentStage: 'not_started',
      blocked: false,
      stages: buildStages(null),
      selectedAutomations: [],
      catalogAutomations: buildCatalogAutomations([]),
    };
  }

  const email = String(me?.email || '').trim().toLowerCase();

  if (!email) {
    return {
      available: false,
      reason: 'No account email found for this user.',
      email: '',
      currentStage: 'not_started',
      blocked: false,
      stages: buildStages(null),
      selectedAutomations: [],
      catalogAutomations: buildCatalogAutomations([]),
    };
  }

  try {
    const latest = await findLatestAutomationLeadByEmail(email);
    if (!latest) {
      return {
        available: true,
        email,
        currentStage: 'not_started',
        blocked: false,
        stages: buildStages(null),
        selectedAutomations: [],
        catalogAutomations: buildCatalogAutomations([]),
      };
    }

    const meta = (latest.meta || {}) as Record<string, any>;
    const metaBuild = meta?.automation_build || {};
    const fromMeta = String(metaBuild?.current_stage || '') as AutomationStageId;
    const currentStage = fromMeta && fromMeta in stageIndexById ? fromMeta : stageFromLeadStatus(latest.status);
    const currentIndex = stageIndexById[currentStage];

    const leadStatus = normalizeStatus(latest.status);
    const blocked = Boolean(metaBuild?.blocked) || leadStatus === 'failed' || leadStatus === 'lost';
    const blockedReason =
      typeof metaBuild?.blocked_reason === 'string' && metaBuild.blocked_reason.trim()
        ? metaBuild.blocked_reason.trim()
        : blocked
        ? 'Build is currently paused. Our team will follow up with next actions.'
        : undefined;

    const selectedIds = inferSelectedAutomations(meta);
    const statusesFromMeta =
      meta?.automation_services && typeof meta.automation_services === 'object'
        ? (meta.automation_services.automation_statuses as Record<string, unknown>) || {}
        : {};

    const selectedAutomations = buildSelectedAutomations({
      selectedIds,
      stage: currentStage,
      statusesFromMeta,
    });

    return {
      available: true,
      email,
      leadId: latest.id,
      leadStatus: latest.status || null,
      currentStage,
      blocked,
      blockedReason,
      lastUpdatedAt: latest.updated_at || latest.created_at || null,
      stages: buildStages(currentIndex),
      selectedAutomations,
      catalogAutomations: buildCatalogAutomations(selectedAutomations),
    };
  } catch (err: any) {
    return {
      available: false,
      reason: err?.body?.message || err?.message || 'Unable to fetch automation progress right now.',
      email,
      currentStage: 'not_started',
      blocked: false,
      stages: buildStages(null),
      selectedAutomations: [],
      catalogAutomations: buildCatalogAutomations([]),
    };
  }
}
