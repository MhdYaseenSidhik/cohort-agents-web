import { matchDims, type Filters } from './filters';
import type { Forecast, ForecastRow, Holdout, HoldoutRow } from './types';

export const FORECAST_PLANT = 'HZL_DEMO_01';

/** Label for a horizon. The long view must carry the history caveat. */
export function horizonLabel(h: number, max: number): string {
  if (h === max) return `${h}-month forecast (maximum for 36 months of history)`;
  return `${h}-month forecast`;
}

/** Horizons the file lists, restricted to the ones the dashboard knows. */
export function horizonsOf(f: Forecast): number[] {
  return [...f.horizons].sort((a, b) => a - b);
}

export const rowsForHorizon = (rows: ForecastRow[], h: number) => rows.filter((r) => r.horizon <= h);

export function forecastCovers(f: Filters): boolean {
  return f.plant === 'ALL_PLANTS' || f.plant === FORECAST_PLANT;
}

/** Filter forecast rows by dimensions (criticality does not exist on forecast rows). */
export function filterForecast(rows: ForecastRow[], f: Filters, h: number): ForecastRow[] {
  return rowsForHorizon(rows, h).filter((r) => matchDims(r, f, { crit: false }));
}

export interface MonthPoint { month: string; predicted: number }

export function byMonth(rows: ForecastRow[]): MonthPoint[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.month, (m.get(r.month) ?? 0) + r.predicted);
  return [...m.entries()].map(([month, predicted]) => ({ month, predicted })).sort((a, b) => a.month.localeCompare(b.month));
}

export function byTypeMonth(rows: ForecastRow[]): Record<string, MonthPoint[]> {
  const out: Record<string, ForecastRow[]> = {};
  for (const r of rows) (out[r.materialType] ??= []).push(r);
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, byMonth(v)]));
}

export function byGroupTotal(rows: ForecastRow[]): { key: string; predicted: number }[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.materialGroup, (m.get(r.materialGroup) ?? 0) + r.predicted);
  return [...m.entries()].map(([key, predicted]) => ({ key, predicted })).sort((a, b) => b.predicted - a.predicted);
}

export interface MaterialForecast { materialId: string; plantId: string; materialGroup: string; materialType: string; predicted: number; months: number }

/** Total predicted per material over the horizon. Bounds are never summed. */
export function byMaterialTotal(rows: ForecastRow[]): MaterialForecast[] {
  const m = new Map<string, MaterialForecast>();
  for (const r of rows) {
    const k = r.seriesId;
    const a = m.get(k) ?? { materialId: r.materialId, plantId: r.plantId, materialGroup: r.materialGroup, materialType: r.materialType, predicted: 0, months: 0 };
    a.predicted += r.predicted;
    a.months += 1;
    m.set(k, a);
  }
  return [...m.values()].sort((a, b) => b.predicted - a.predicted);
}

export function materialSeries(rows: ForecastRow[], materialId: string, plantId: string, h: number): ForecastRow[] {
  return rowsForHorizon(rows, h).filter((r) => r.materialId === materialId && r.plantId === plantId).sort((a, b) => a.month.localeCompare(b.month));
}

export function byPlantMonthForHorizon(f: Forecast, plant: string, h: number): MonthPoint[] {
  const m = new Map<string, number>();
  for (const r of f.byPlantMonth) {
    if (r.horizon > h) continue;
    if (plant !== 'ALL_PLANTS' && r.plantId !== plant) continue;
    m.set(r.month, (m.get(r.month) ?? 0) + r.predicted);
  }
  return [...m.entries()].map(([month, predicted]) => ({ month, predicted })).sort((a, b) => a.month.localeCompare(b.month));
}

export interface BacktestPoint { month: string; actual: number; predicted: number }

export function backtestByMonth(h: Holdout, plant: string): BacktestPoint[] {
  const m = new Map<string, BacktestPoint>();
  for (const r of h.byPlantMonth) {
    if (plant !== 'ALL_PLANTS' && r.plantId !== plant) continue;
    const a = m.get(r.month) ?? { month: r.month, actual: 0, predicted: 0 };
    a.actual += r.actual;
    a.predicted += r.predicted;
    m.set(r.month, a);
  }
  return [...m.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function backtestMaterial(rows: HoldoutRow[], materialId: string, plantId: string): HoldoutRow[] {
  return rows.filter((r) => r.materialId === materialId && r.plantId === plantId).sort((a, b) => a.month.localeCompare(b.month));
}

/** Weighted absolute percentage error over backtest points (sum |a-p| / sum |a|). */
export function wape(points: { actual: number; predicted: number }[]): number | null {
  const den = points.reduce((a, p) => a + Math.abs(p.actual), 0);
  if (!den) return null;
  return points.reduce((a, p) => a + Math.abs(p.actual - p.predicted), 0) / den;
}

export function groupOutputs(outputs: { file: string }[]) {
  const g = { forecast: 0, backtest: 0, metrics: 0, other: 0 };
  for (const o of outputs) {
    if (o.file.startsWith('forecast')) g.forecast++;
    else if (o.file.startsWith('backtest')) g.backtest++;
    else if (o.file === 'metrics.json') g.metrics++;
    else g.other++;
  }
  return g;
}

/** Cross-check the forecast file against the recorded metrics.json check. */
export function forecastMatchesMetrics(f: Pick<Forecast, 'experimentId' | 'predictionLength'>, c: { metricsExperimentId: string; metricsHorizon: number } | undefined): { ok: boolean; reason: string | null } {
  if (!c) return { ok: false, reason: 'No metrics.json check is recorded in manifest.forecast.metricsCheck.' };
  if (c.metricsExperimentId !== f.experimentId) return { ok: false, reason: `metrics.json experimentId ${c.metricsExperimentId} differs from forecast.json ${f.experimentId}.` };
  if (c.metricsHorizon !== f.predictionLength) return { ok: false, reason: `metrics.json horizon ${c.metricsHorizon} differs from forecast.json predictionLength ${f.predictionLength}.` };
  return { ok: true, reason: null };
}
