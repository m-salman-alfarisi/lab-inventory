export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatLongDate(value: Date | string = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function formatRelative(value: Date | string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;

  return formatDate(date);
}

export function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function startOfTodayUtc(): Date {
  return new Date(`${todayJakarta()}T00:00:00.000Z`);
}

export function isOverdue(loan: {
  status: string;
  dueDate: Date | string | null;
}): boolean {
  if (loan.status !== "DIPINJAM" || !loan.dueDate) return false;
  return toDateInput(loan.dueDate) < todayJakarta();
}

export function daysBetween(start: Date | string, end: Date | string): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(0, Math.ceil((b - a) / 86400000));
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parsePage(value: string | string[] | undefined): number {
  const raw = Number(firstParam(value));
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

export function buildQuery(
  basePath: string,
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function stockStatus(
  stock: number,
  minStock: number,
): "HABIS" | "MENIPIS" | "TERSEDIA" {
  if (stock <= 0) return "HABIS";
  if (stock <= minStock) return "MENIPIS";
  return "TERSEDIA";
}
