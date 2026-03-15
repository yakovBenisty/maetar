export function normalizeColumnName(col: string): string {
  return col.replace(/^\uFEFF/, '').trim().replace(/\s+/g, '_');
}

export function parseDateString(value: string): Date | null {
  const v = value.trim();
  const [p1, p2] = v.split('/');
  const m = Number(p1);
  const y = Number(p2);
  if (Number.isFinite(m) && Number.isFinite(y) && m >= 1 && m <= 12 && y > 1900) {
    return new Date(Date.UTC(y, m - 1, 1));
  }
  return null;
}

export function formatValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  const asDate = parseDateString(trimmed);
  if (asDate) return asDate;
  return trimmed;
}

export function monthToDate(month: string): Date {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}
