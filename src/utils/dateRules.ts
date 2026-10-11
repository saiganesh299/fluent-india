import { CourseId, EnrolmentStatus } from '../types';

/**
 * Adds months to a Date with month-end clamping.
 * e.g. Jan 31 + 1 month => Feb 28 (or 29 in leap years)
 */
export function addMonthsWithClamping(date: Date, monthsToAdd: number): Date {
  const result = new Date(date.getTime());
  const expectedMonth = (result.getMonth() + monthsToAdd) % 12;
  const targetYear = result.getFullYear() + Math.floor((result.getMonth() + monthsToAdd) / 12);

  result.setFullYear(targetYear);
  result.setMonth(result.getMonth() + monthsToAdd);

  // If month overflowed due to day count difference, clamp to last day of expected month
  if (result.getMonth() !== ((expectedMonth + 12) % 12)) {
    result.setDate(0); // Last day of previous month
  }
  return result;
}

/**
 * Calculates Course End Date based on:
 * - 15-day course: startDate + 14 days (start date is Day 1)
 * - 7-day crash course: startDate + 6 days
 * - 1-month course: add 1 calendar month with month-end clamping, then subtract 1 day.
 * Example: 5 Oct 2026 -> 4 Nov 2026
 */
export function calculateCourseEndDate(startDateStr: string, courseId: CourseId): string {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day);

  if (courseId === 'crash') {
    // 7 days total: + 6 days
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return formatDateIso(end);
  }

  if (courseId === 'shortterm') {
    // 15 days total: + 14 days
    const end = new Date(start);
    end.setDate(end.getDate() + 14);
    return formatDateIso(end);
  }

  // 1-month course: add 1 month with clamping, then minus 1 day
  const oneMonthLater = addMonthsWithClamping(start, 1);
  oneMonthLater.setDate(oneMonthLater.getDate() - 1);
  return formatDateIso(oneMonthLater);
}

/**
 * Calculates Material Access Expiry:
 * Exactly 3 calendar months after the course end date, with month-end clamping.
 * Example: 4 Nov 2026 -> 4 Feb 2027
 */
export function calculateMaterialAccessExpiry(courseEndDateStr: string, bufferMonths = 3): string {
  const [year, month, day] = courseEndDateStr.split('-').map(Number);
  const courseEnd = new Date(year, month - 1, day);
  const expiry = addMonthsWithClamping(courseEnd, bufferMonths);
  return formatDateIso(expiry);
}

/**
 * Computes enrolment status relative to today's date
 */
export function computeEnrolmentStatus(startDateStr: string, courseEndDateStr: string, materialAccessUntilStr: string): EnrolmentStatus {
  const todayStr = getTodayIso();
  if (todayStr < startDateStr) {
    return 'upcoming';
  }
  if (todayStr <= courseEndDateStr) {
    return 'ongoing';
  }
  if (todayStr <= materialAccessUntilStr) {
    return 'material_only';
  }
  return 'expired';
}

/**
 * Days remaining until a target date. Returns negative if past.
 */
export function getDaysRemaining(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayIso(): string {
  return formatDateIso(new Date());
}

/**
 * Formats ISO date to human readable e.g. "14 Apr 2025" or "31 Jan 2027"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
