const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getUpcomingMonth() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const nextMonth = month + 1;
  if (nextMonth > 11) {
    return { month: 0, year: year + 1 };
  }
  return { month: nextMonth, year };
}

export function getUpcomingMonthName() {
  const { month, year } = getUpcomingMonth();
  return `${MONTH_NAMES[month]} ${year}`;
}

export function getAcademicYear() {
  const { month, year } = getUpcomingMonth();
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function isDateInActionPlanMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const { month, year } = getUpcomingMonth();
  return d.getMonth() === month && d.getFullYear() === year;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function getMonthYearForSheet() {
  const { month, year } = getUpcomingMonth();
  return `${MONTH_NAMES[month]} ${year}`;
}

export function getYearMonthForId() {
  const { month, year } = getUpcomingMonth();
  return `${year}${String(month + 1).padStart(2, '0')}`;
}

export function getMinDate() {
  const { month, year } = getUpcomingMonth();
  const d = new Date(year, month, 1);
  return d.toISOString().split('T')[0];
}

export function getMaxDate() {
  const { month, year } = getUpcomingMonth();
  const d = new Date(year, month + 1, 0);
  return d.toISOString().split('T')[0];
}
