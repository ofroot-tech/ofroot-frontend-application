import { Cpu, GitBranch, HeartPulse, Scale, ShieldCheck } from 'lucide-react';
import type { NewsCategory } from '@/app/lib/news/types';

export const topics: { id: NewsCategory; label: string; short: string; description: string; icon: typeof Cpu }[] = [
  { id: 'ai', label: 'Artificial intelligence', short: 'AI', description: 'Models, research & what comes next', icon: Cpu },
  { id: 'integrations', label: 'Integrations', short: 'Integrations', description: 'The tools connecting everything', icon: GitBranch },
  { id: 'healthcare', label: 'Healthcare & startups', short: 'Healthcare', description: 'New ideas. Better outcomes.', icon: HeartPulse },
  { id: 'policy', label: 'Policy & regulation', short: 'Policy', description: 'The rules shaping technology', icon: Scale },
  { id: 'cybersecurity', label: 'Cybersecurity', short: 'Cybersecurity', description: 'Threats, trust & digital defense', icon: ShieldCheck },
];

export function formatPublished(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Publication date unavailable';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(date);
}
