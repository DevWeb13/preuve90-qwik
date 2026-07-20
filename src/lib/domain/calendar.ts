const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getDateKeyInTimeZone(value: Date | string, timeZone: string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("La date fournie est invalide.");
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export function calendarDayNumber(dateKey: string): number {
  const match = DATE_KEY_PATTERN.exec(dateKey);
  if (!match) {
    throw new Error(`Clé calendaire invalide : ${dateKey}`);
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const timestamp = Date.UTC(year, month - 1, day);
  const normalized = new Date(timestamp);

  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day
  ) {
    throw new Error(`Clé calendaire impossible : ${dateKey}`);
  }

  return timestamp / 86_400_000;
}

export function differenceInCalendarDays(startDateKey: string, endDateKey: string): number {
  return calendarDayNumber(endDateKey) - calendarDayNumber(startDateKey);
}
