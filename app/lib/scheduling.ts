// app/lib/scheduling.ts
// Scheduling helpers for appointments and calendar events

import { http } from './api';

export type CalendarOccurrence = {
  id: number;
  appointment_id: number;
  title: string;
  start: string; // ISO8601
  end: string;   // ISO8601
  allDay?: boolean;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval?: number;
    byWeekday?: number[] | null;
    until?: string | null;
  } | null;
};

export type AppointmentsIndexResponse = {
  events: CalendarOccurrence[];
};

function toISO(d: Date) {
  // Always send ISO strings the backend expects (UTC acceptable)
  return d.toISOString();
}

export async function fetchOccurrences(rangeStart: Date, rangeEnd: Date) {
  const params = new URLSearchParams();
  params.set('start', toISO(rangeStart));
  params.set('end', toISO(rangeEnd));
  const path = `/appointments?${params.toString()}`;
  const res = await http.get<AppointmentsIndexResponse>(path, { cache: 'no-store' as any });
  return res.events || [];
}

export async function updateAppointmentTimes(appointmentId: number, start: Date, end: Date) {
  const path = `/appointments/${appointmentId}`;
  return http.putJson<{ appointment: any }>(path, {
    starts_at: toISO(start),
    ends_at: toISO(end),
  });
}
