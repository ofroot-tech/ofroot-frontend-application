// app/dashboard/jobs/_components/JobStatusBadge.tsx

import type { JobStatus } from '@/app/lib/api';

type Props = {
  status: JobStatus;
  className?: string;
};

const statusConfig: Record<JobStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  invoiced: { label: 'Invoiced', color: 'bg-purple-100 text-purple-800' },
  paid: { label: 'Paid', color: 'bg-green-200 text-green-900' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export function JobStatusBadge({ status, className = '' }: Props) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}
