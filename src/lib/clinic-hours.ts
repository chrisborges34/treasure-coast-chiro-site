// Single source of truth for the clinic's business hours, shared by the
// homepage "Hours of Operation" section and the booking form's slot picker.

export const SLOT_MINUTES = 30;

// 0 = Sunday ... 6 = Saturday
const WEEKDAY_WINDOWS: Record<number, [string, string][]> = {
  1: [
    ["09:00", "12:00"],
    ["14:30", "18:00"],
  ], // Monday
  2: [
    ["09:00", "12:00"],
    ["14:30", "18:00"],
  ], // Tuesday
  3: [
    ["09:00", "12:00"],
    ["14:30", "18:00"],
  ], // Wednesday
  4: [
    ["09:00", "12:00"],
    ["14:30", "18:00"],
  ], // Thursday
  5: [
    ["09:00", "12:00"],
    ["14:30", "18:00"],
  ], // Friday
};

export const HOURS_DISPLAY = [
  ["Monday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Tuesday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Wednesday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Thursday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
  ["Friday", "9:00AM–12:00PM, 2:30PM–6:00PM"],
] as const;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}:00`;
}

export function formatTimeLabel(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${mStr} ${period}`;
}

/** All bookable slot start times (HH:MM:SS) for a given local Date, or [] if closed that day. */
export function getSlotsForDate(date: Date): string[] {
  const windows = WEEKDAY_WINDOWS[date.getDay()];
  if (!windows) return [];

  const slots: string[] = [];
  for (const [start, end] of windows) {
    let cursor = toMinutes(start);
    const endMinutes = toMinutes(end);
    while (cursor + SLOT_MINUTES <= endMinutes) {
      slots.push(toTimeString(cursor));
      cursor += SLOT_MINUTES;
    }
  }
  return slots;
}

export function isClinicOpenOn(date: Date): boolean {
  return Boolean(WEEKDAY_WINDOWS[date.getDay()]);
}

/** YYYY-MM-DD in local time (avoids UTC-shift bugs from toISOString()). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}
