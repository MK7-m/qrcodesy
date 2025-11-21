import type { DailyOpeningHours, RestaurantStatus } from '../types/restaurant';

// Simple status computation based on override then opening hours
export function computeRestaurantStatus(
  openingHours: DailyOpeningHours[] | null | undefined,
  statusOverride: 'auto' | 'open' | 'closed' | 'busy' | null | undefined,
  now: Date = new Date()
): RestaurantStatus {
  if (statusOverride && statusOverride !== 'auto') {
    if (statusOverride === 'open' || statusOverride === 'closed' || statusOverride === 'busy') {
      return statusOverride;
    }
  }

  if (!openingHours || openingHours.length === 0) return 'closed';

  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = dayNames[now.getDay()];
  const today = openingHours.find((d) => d.day === todayKey);
  if (!today || !today.ranges?.length) return 'closed';

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isOpen = today.ranges.some((range) => {
    const [fromH, fromM] = range.from.split(':').map(Number);
    const [toH, toM] = range.to.split(':').map(Number);
    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;
    return currentMinutes >= fromMinutes && currentMinutes <= toMinutes;
  });

  return isOpen ? 'open' : 'closed';
}

export function formatOpeningHours(openingHours: DailyOpeningHours[] | undefined): string {
  if (!openingHours || openingHours.length === 0) return 'غير محدد';

  // Take first day's first range as quick summary
  const firstDay = openingHours[0];
  if (!firstDay.ranges || firstDay.ranges.length === 0) return 'غير محدد';
  const firstRange = firstDay.ranges[0];
  return `${firstRange.from} – ${firstRange.to}`;
}
