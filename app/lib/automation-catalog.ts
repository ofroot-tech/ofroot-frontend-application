export const AUTOMATION_CATALOG = [
  {
    id: 'lead_capture_csv',
    label: 'Lead Capture to CSV',
    description: 'Capture every qualified lead and make it export-ready for operations and follow-up.',
  },
  {
    id: 'instagram_dm_autoresponder',
    label: 'Instagram DM Auto-Responder',
    description: 'Reply to inbound Instagram DMs with scripted qualification and routing logic.',
  },
  {
    id: 'facebook_dm_autoresponder',
    label: 'Facebook DM Auto-Responder',
    description: 'Respond to Facebook Messenger inquiries with instant prompts and lead collection.',
  },
  {
    id: 'lead_qualification_routing',
    label: 'Lead Qualification and Routing',
    description: 'Score leads, apply qualification rules, and route them to the right owner or queue.',
  },
  {
    id: 'booking_handoff',
    label: 'Appointment Booking Handoff',
    description: 'Move qualified leads into booking flows with reminders and handoff notifications.',
  },
  {
    id: 'followup_reactivation',
    label: 'Follow-Up Reactivation',
    description: 'Trigger reminders and reactivation outreach for stalled leads and missed responses.',
  },
] as const;

export const AUTOMATION_CATALOG_IDS = AUTOMATION_CATALOG.map((item) => item.id) as [
  (typeof AUTOMATION_CATALOG)[number]['id'],
  ...(typeof AUTOMATION_CATALOG)[number]['id'][]
];

export type AutomationCatalogItem = (typeof AUTOMATION_CATALOG)[number];
export type AutomationCatalogId = AutomationCatalogItem['id'];
export type AutomationDeliveryStatus = 'queued' | 'in_progress' | 'online' | 'not_selected';

const catalogMap = new Map<AutomationCatalogId, AutomationCatalogItem>(
  AUTOMATION_CATALOG.map((item) => [item.id, item])
);

export function isAutomationCatalogId(value: string): value is AutomationCatalogId {
  return catalogMap.has(value as AutomationCatalogId);
}

export function getAutomationCatalogItem(id: AutomationCatalogId): AutomationCatalogItem {
  return catalogMap.get(id)!;
}

export function formatAutomationServiceSummary(ids: AutomationCatalogId[]): string {
  const labels = ids.flatMap((id) => {
    const label = catalogMap.get(id)?.label;
    return label ? [label] : [];
  });
  return labels.join(' + ');
}
