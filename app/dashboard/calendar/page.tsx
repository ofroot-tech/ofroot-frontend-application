// app/dashboard/calendar/page.tsx
import CalendarClient from './CalendarClient';

export const metadata = {
  title: 'Calendar',
};

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-gray-600">Drag and drop to reschedule. Weekly view by default.</p>
      </div>
      <div className="bg-white border rounded-lg p-2">
        <CalendarClient />
      </div>
    </div>
  );
}
