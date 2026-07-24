export interface DeadlineStatus {
  phase: "before" | "after";
  duration: string;
  primary: string;
  secondary?: "Résultats officiels en attente";
}

function pluralize(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function formatDeadlineDuration(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(Math.abs(milliseconds) / 60_000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${pluralize(days, "jour", "jours")}, ${pluralize(
      hours,
      "heure",
      "heures",
    )} et ${pluralize(minutes, "minute", "minutes")}`;
  }

  if (hours > 0) {
    return `${pluralize(hours, "heure", "heures")} et ${pluralize(
      minutes,
      "minute",
      "minutes",
    )}`;
  }

  return pluralize(minutes, "minute", "minutes");
}

export function getDeadlineStatus(
  validationDeadline: string | Date,
  now: Date = new Date(),
): DeadlineStatus {
  const difference =
    new Date(validationDeadline).getTime() - now.getTime();
  const duration = formatDeadlineDuration(difference);

  if (difference > 0) {
    return {
      phase: "before",
      duration,
      primary: `Clôture dans ${duration}`,
    };
  }

  return {
    phase: "after",
    duration,
    primary: `Grille clôturée depuis ${duration}`,
    secondary: "Résultats officiels en attente",
  };
}
