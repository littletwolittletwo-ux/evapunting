export function formatAUD(value: number | null | undefined): string {
  if (value == null) return '$0.00';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date, weekday: boolean) => {
    const parts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    if (weekday) parts.weekday = 'short';
    return d.toLocaleDateString('en-AU', parts);
  };
  return `${fmt(s, true)} – ${fmt(e, true)}`;
}
