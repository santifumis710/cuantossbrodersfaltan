// All Tuesday calculations for Broders
// First Tuesday: March 10, 2026
// Last Tuesday: December 1, 2026

const FIRST_TUESDAY = new Date(2026, 2, 10); // Month is 0-indexed
const LAST_TUESDAY = new Date(2026, 11, 1);

/**
 * Get all Tuesdays between start and end (inclusive)
 */
export function getAllTuesdays() {
  const tuesdays = [];
  const current = new Date(FIRST_TUESDAY);
  
  while (current <= LAST_TUESDAY) {
    tuesdays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  
  return tuesdays;
}

/**
 * Get the total number of Tuesdays
 */
export function getTotalTuesdays() {
  return getAllTuesdays().length;
}

/**
 * Get the number of the current Tuesday (1-indexed), or null if today is not Tuesday
 */
export function getCurrentTuesdayNumber() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (today.getDay() !== 2) return null; // Not Tuesday
  
  const tuesdays = getAllTuesdays();
  const index = tuesdays.findIndex(t => 
    t.getFullYear() === today.getFullYear() &&
    t.getMonth() === today.getMonth() &&
    t.getDate() === today.getDate()
  );
  
  return index >= 0 ? index + 1 : null;
}

/**
 * How many Tuesdays have passed (including today if it's Tuesday)
 */
export function getTuesdaysPassed() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const tuesdays = getAllTuesdays();
  let count = 0;
  
  for (const t of tuesdays) {
    if (t <= today) count++;
  }
  
  return count;
}

/**
 * How many Tuesdays remain (not counting today)
 */
export function getTuesdaysRemaining() {
  return getTotalTuesdays() - getTuesdaysPassed();
}

/**
 * Format a date as "Martes #N - DD de MES"
 */
export function formatTuesday(tuesdayNumber) {
  const tuesdays = getAllTuesdays();
  if (tuesdayNumber < 1 || tuesdayNumber > tuesdays.length) return '';
  
  const date = tuesdays[tuesdayNumber - 1];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  return `Martes #${tuesdayNumber} - ${date.getDate()} de ${months[date.getMonth()]}`;
}

/**
 * Get list of tuesdays as options for photo upload selector
 * Returns array of { value: number, label: string }
 */
export function getTuesdayOptions() {
  const tuesdays = getAllTuesdays();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return tuesdays
    .filter(t => t <= today)
    .map((t, i) => ({
      value: i + 1,
      label: formatTuesday(i + 1),
    }));
}
