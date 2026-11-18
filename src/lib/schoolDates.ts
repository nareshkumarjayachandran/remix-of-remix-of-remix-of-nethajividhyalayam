const SCHOOL_FOUNDING_YEAR = 2002;
const SCHOOL_FOUNDING_MONTH = 5; // June, zero-indexed
const SCHOOL_FOUNDING_DAY = 11;
const ACADEMIC_YEAR_START_MONTH = 5; // Academic year begins in June

export function getAcademicYear(date = new Date()): string {
  const startYear = date.getMonth() < ACADEMIC_YEAR_START_MONTH
    ? date.getFullYear() - 1
    : date.getFullYear();

  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export function getAcademicYearFull(date = new Date()): string {
  const startYear = date.getMonth() < ACADEMIC_YEAR_START_MONTH
    ? date.getFullYear() - 1
    : date.getFullYear();

  return `${startYear}–${startYear + 1}`;
}

export function getYearsOfExcellence(date = new Date()): number {
  const hasReachedAnniversary = date.getMonth() > SCHOOL_FOUNDING_MONTH
    || (date.getMonth() === SCHOOL_FOUNDING_MONTH && date.getDate() >= SCHOOL_FOUNDING_DAY);

  return date.getFullYear() - SCHOOL_FOUNDING_YEAR - (hasReachedAnniversary ? 0 : 1);
}