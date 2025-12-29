"use client";

import React from 'react';
import { Calendar as RBCalendar, Views, dateFnsLocalizer, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import {
  format as dfFormat,
  parse as dfParse,
  startOfWeek as dfStartOfWeek,
  getDay as dfGetDay,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { fetchOccurrences, updateAppointmentTimes, CalendarOccurrence } from '@/app/lib/scheduling';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { 'en-US': enUS } as any;
const localizer = dateFnsLocalizer({
  format: dfFormat,
  parse: dfParse as any,
  startOfWeek: dfStartOfWeek,
  getDay: dfGetDay,
  locales,
});

const DnDCalendar: any = withDragAndDrop(RBCalendar as any);

type Event = { id: number; title: string; start: Date; end: Date; allDay?: boolean };

export default function CalendarClient() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [currentRange, setCurrentRange] = React.useState<{ start: Date; end: Date } | null>(null);
  const [view, setView] = React.useState<View>(Views.WEEK as unknown as View);
  const [date, setDate] = React.useState<Date>(new Date());

  const mapOccurrences = React.useCallback((items: CalendarOccurrence[]): Event[] => {
    return (items || []).map((e) => ({
      id: e.id,
      title: e.title,
      start: new Date(e.start),
      end: new Date(e.end),
      allDay: Boolean(e.allDay),
    }));
  }, []);

  const loadEvents = React.useCallback(async (range: { start: Date; end: Date }) => {
    setLoading(true);
    try {
      const items = await fetchOccurrences(range.start, range.end);
      setEvents(mapOccurrences(items));
    } catch (err) {
      // Best-effort: ignore for now, could toast later
       
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  }, [mapOccurrences]);

  React.useEffect(() => {
    // initialize with current week range
    const start = startOf(view, date);
    const end = endOf(view, date);
    const initial = { start, end };
    setCurrentRange(initial);
    // no await; load async
    loadEvents(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startOf(v: View, d: Date) {
    // rough approximations sufficient for initial fetch
    const dt = new Date(d);
    if (v === 'month') {
      const s = new Date(dt.getFullYear(), dt.getMonth(), 1);
      return s;
    }
    if (v === 'day') return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    // week default: start on Monday for alignment with backend
    const day = dt.getDay(); // 0 Sun..6 Sat
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    const s = new Date(dt);
    s.setDate(dt.getDate() + diff);
    s.setHours(0, 0, 0, 0);
    return s;
  }
  function endOf(v: View, d: Date) {
    const dt = new Date(d);
    if (v === 'month') {
      const e = new Date(dt.getFullYear(), dt.getMonth() + 1, 0, 23, 59, 59, 999);
      return e;
    }
    if (v === 'day') return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59, 999);
    const s = startOf('week', dt);
    const e = new Date(s);
    e.setDate(s.getDate() + 7);
    e.setMilliseconds(-1);
    return e;
  }

  const handleRangeChange = (range: any) => {
    // Range could be an array (month) or object (week/day)
    let start: Date, end: Date;
    if (Array.isArray(range)) {
      // month provides an array of dates (weeks in month view)
      start = new Date(range[0]);
      end = new Date(range[range.length - 1]);
    } else if (range?.start && range?.end) {
      start = new Date(range.start);
      end = new Date(range.end);
    } else {
      const s = startOf(view, date);
      const e = endOf(view, date);
      start = s; end = e;
    }
    const next = { start, end };
    setCurrentRange(next);
    loadEvents(next);
  };

  const onNavigate = (nextDate: Date) => {
    setDate(nextDate);
    const s = startOf(view, nextDate);
    const e = endOf(view, nextDate);
    const next = { start: s, end: e };
    setCurrentRange(next);
    loadEvents(next);
  };

  const onView = (nextView: View) => {
    setView(nextView);
    const s = startOf(nextView, date);
    const e = endOf(nextView, date);
    const next = { start: s, end: e };
    setCurrentRange(next);
    loadEvents(next);
  };

  const onEventDrop = async ({ event, start, end }: any) => {
    try {
      await updateAppointmentTimes(event.id, start, end);
      if (currentRange) await loadEvents(currentRange);
    } catch (err) {
       
      console.error('Failed to update appointment', err);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
          <div className="mt-2 text-xs text-gray-500 bg-white/80 backdrop-blur rounded px-2 py-1 border">Loading…</div>
        </div>
      )}
      <DnDCalendar
        localizer={localizer}
        events={events}
        defaultView={Views.WEEK as unknown as View}
        view={view}
        date={date}
        onView={onView}
        onNavigate={onNavigate}
        onRangeChange={handleRangeChange}
        onEventDrop={onEventDrop}
        resizable={false}
        popup
        style={{ height: 700 }}
      />
    </div>
  );
}
