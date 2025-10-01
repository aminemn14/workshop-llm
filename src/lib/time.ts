export function getWeekNumber(date: Date = new Date()): number {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
}

export function getIsoWeekYear(date: Date = new Date()): number {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  return tmp.getUTCFullYear();
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Utilitaires complémentaires pour la semaine ISO (bornes lundi/vendredi) et parsing simple
export function getWeekBounds(date: Date): { monday: Date; friday: Date } {
  const day = date.getDay() || 7; // 1..7 (lundi=1)
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { monday, friday };
}

export function parseDateLoose(input: string): Date {
  const slash = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/;
  const dash = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/;
  if (slash.test(input)) {
    const [, dd, mm, yyyy] = input.match(slash)!;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  if (dash.test(input)) {
    const [, yyyy, mm, dd] = input.match(dash)!;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const t = Date.parse(input);
  return isNaN(t) ? new Date() : new Date(t);
}