import { ALL_PLANTS, type Direction, type KpiCatalogItem, type KpiRow } from './types';

export type Tone = 'good' | 'bad' | 'neutral';

/** Colour a change against catalog.direction. Neutral KPIs are never good or bad. */
export function toneFor(direction: Direction, change: number | null): Tone {
  if (change == null || change === 0 || direction === 'neutral') return 'neutral';
  const up = change > 0;
  if (direction === 'higher_is_better') return up ? 'good' : 'bad';
  return up ? 'bad' : 'good';
}

export function priorMonth(m: string, back = 1): string {
  const [y, mo] = m.split('-').map(Number);
  const idx = y * 12 + (mo - 1) - back;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, '0')}`;
}

/** The plantId whose rows feed a KPI view. All plants uses the source's ALL_PLANTS rows; plants are never summed. */
export const kpiPlantKey = (plant: string) => plant || ALL_PLANTS;

export interface KpiSeriesPoint { month: string; value: number }

export function kpiSeries(rows: KpiRow[], plant: string, code: string, from = '', to = ''): KpiSeriesPoint[] {
  const key = kpiPlantKey(plant);
  return rows
    .filter((r) => r.plantId === key && r.kpiCode === code && (!from || r.month >= from) && (!to || r.month <= to))
    .map((r) => ({ month: r.month, value: r.value }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export interface KpiSummary {
  item: KpiCatalogItem;
  latestMonth: string | null;
  latest: number | null;
  prior: number | null;
  change: number | null;
  yearAgo: number | null;
  changeYoY: number | null;
  tone: Tone;
  toneYoY: Tone;
  series: KpiSeriesPoint[];
  scenario: string | null;
}

export function summarizeKpi(rows: KpiRow[], item: KpiCatalogItem, plant: string, from = '', to = ''): KpiSummary {
  const key = kpiPlantKey(plant);
  const series = kpiSeries(rows, plant, item.code, from, to);
  const last = series.at(-1) ?? null;
  const all = rows.filter((r) => r.plantId === key && r.kpiCode === item.code);
  const byMonth = new Map(all.map((r) => [r.month, r.value]));
  const latestMonth = last?.month ?? null;
  const latest = last?.value ?? null;
  const prior = latestMonth ? byMonth.get(priorMonth(latestMonth)) ?? null : null;
  const yearAgo = latestMonth ? byMonth.get(priorMonth(latestMonth, 12)) ?? null : null;
  const change = latest != null && prior != null ? latest - prior : null;
  const changeYoY = latest != null && yearAgo != null ? latest - yearAgo : null;
  return {
    item, latestMonth, latest, prior, change, yearAgo, changeYoY,
    tone: toneFor(item.direction, change),
    toneYoY: toneFor(item.direction, changeYoY),
    series,
    scenario: all[0]?.scenario ?? null,
  };
}

export const OVERVIEW_KPIS = [
  'GROSS_INVENTORY_VALUE_INR', 'NON_MOVING_VALUE_INR', 'SLOW_MOVING_VALUE_INR', 'OBSOLETE_VALUE_INR',
  'EXCESS_INVENTORY_VALUE_INR', 'DAYS_ON_HAND', 'INVENTORY_TURNOVER_RATIO', 'CRITICAL_SPARE_AVAILABILITY_PCT',
  'STOCKOUT_MATERIAL_COUNT', 'UNDERSTOCK_MATERIAL_COUNT', 'POTENTIAL_INVENTORY_REDUCTION_INR', 'WORKING_CAPITAL_OPPORTUNITY_INR',
];
