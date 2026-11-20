const CR = 1e7;
const LAKH = 1e5;

/** Indian lakh / crore formatting for INR: ₹1.25 Cr, ₹4.3 L. */
export function formatInr(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  const sign = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (a >= CR) return `${sign}₹${trim(a / CR, 2)} Cr`;
  if (a >= LAKH) return `${sign}₹${trim(a / LAKH, 1)} L`;
  return `${sign}₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(a)}`;
}

export function formatInrFull(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(v)}`;
}

function trim(n: number, d: number): string {
  const s = n.toFixed(d);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}

export function formatNumber(v: number | null | undefined, digits = 0): string {
  if (v == null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v);
}

export function formatPct(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v.toFixed(1)}%`;
}

export function formatQty(v: number | null | undefined, unit = 'units'): string {
  if (v == null) return '—';
  return `${formatNumber(v, 1)} ${unit}`;
}

/** Format a KPI value by its catalog unit. */
export function formatKpi(v: number | null | undefined, uom: string): string {
  switch (uom) {
    case 'INR': return formatInr(v);
    case 'PCT': return formatPct(v);
    case 'DAYS': return `${formatNumber(v, 1)} days`;
    case 'RATIO': return `${formatNumber(v, 2)}×`;
    default: return formatNumber(v, 0);
  }
}

export function formatKpiFull(v: number | null | undefined, uom: string): string {
  if (uom === 'INR') return formatInrFull(v);
  return formatKpi(v, uom);
}

export function formatDelta(v: number | null, uom: string): string {
  if (v == null) return '—';
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (uom === 'INR') return `${sign}${formatInr(a)}`;
  if (uom === 'PCT') return `${sign}${a.toFixed(1)} pp`;
  return `${sign}${formatNumber(a, 2)}`;
}

export function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Number(mo) - 1]} ${y}`;
}
