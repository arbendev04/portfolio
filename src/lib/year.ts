/** The calendar year of `date` (today by default) — keeps copyright lines current. */
export function currentYear(date: Date = new Date()): number {
  return date.getFullYear();
}
