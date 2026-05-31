export interface TimeSlot {
  id: string;
  date: Date;
  label: string;
}

const WEEKDAY_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const SATURDAY_HOURS = [10, 11, 12, 13, 14, 15];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatSlotId(date: Date, hour: number): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}T${pad(hour)}:00`;
}

function formatSlotLabel(date: Date, hour: number, locale: string): string {
  const datePart = date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timePart = `${pad(hour)}:00`;
  return `${datePart} — ${timePart}`;
}

function getHoursForDay(day: number): number[] {
  if (day === 0) return [];
  if (day === 6) return SATURDAY_HOURS;
  return WEEKDAY_HOURS;
}

export function generateAvailableSlots(
  daysAhead = 14,
  locale = 'es-CO'
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const hours = getHoursForDay(date.getDay());
    for (const hour of hours) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      slots.push({
        id: formatSlotId(date, hour),
        date: slotDate,
        label: formatSlotLabel(date, hour, locale),
      });
    }
  }

  return slots;
}
