import { matchDims, type Filters } from './filters';
import type { MaterialRow, PlanRow, ReorderRow, SummaryRow } from './types';

export interface Slice { key: string; value: number; materials: number }

export type SummaryDim = 'materialType' | 'movementClass' | 'inventoryStatus' | 'criticality' | 'abcClass' | 'materialGroup' | 'plantId';

export function filterSummary(rows: SummaryRow[], f: Filters): SummaryRow[] {
  return rows.filter((r) => matchDims(r, f));
}

/** Sum value and material counts by a dimension. With All plants, plants are summed (real plants only). */
export function sumBy(rows: SummaryRow[], dim: SummaryDim): Slice[] {
  const m = new Map<string, Slice>();
  for (const r of rows) {
    const k = r[dim];
    const s = m.get(k) ?? { key: k, value: 0, materials: 0 };
    s.value += r.valueInr;
    s.materials += r.materials;
    m.set(k, s);
  }
  return [...m.values()].sort((a, b) => b.value - a.value);
}

export function totals(rows: SummaryRow[]) {
  return rows.reduce((a, r) => ({ value: a.value + r.valueInr, materials: a.materials + r.materials, qty: a.qty + r.availableQty }), { value: 0, materials: 0, qty: 0 });
}

export function filterMaterials(rows: MaterialRow[], f: Filters, extra: { status?: string; search?: string } = {}): MaterialRow[] {
  const q = extra.search?.trim().toLowerCase();
  return rows.filter(
    (r) =>
      matchDims(r, f) &&
      (!extra.status || r.inventoryStatus === extra.status) &&
      (!q || r.materialId.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)),
  );
}

export const ALERT_STATUSES = ['STOCKOUT', 'CRITICAL_SHORTAGE'];

/** Top alerts: VITAL spares in stockout / critical shortage, ordered by 12M demand. */
export function vitalStockouts(rows: MaterialRow[], f: Filters, limit = 8): MaterialRow[] {
  return rows
    .filter((r) => matchDims(r, f) && r.criticality === 'VITAL' && ALERT_STATUSES.includes(r.inventoryStatus))
    .sort((a, b) => b.trailing12mDemandQty - a.trailing12mDemandQty)
    .slice(0, limit);
}

export const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function filterReorder(rows: ReorderRow[], f: Filters, extra: { priority?: string; shutdownOnly?: boolean } = {}): ReorderRow[] {
  return rows.filter((r) => matchDims(r, f) && (!extra.priority || r.priority === extra.priority) && (!extra.shutdownOnly || Boolean(r.shutdownId)));
}

export function sortReorder(rows: ReorderRow[]): ReorderRow[] {
  return [...rows].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9) || a.recommendedPrDate.localeCompare(b.recommendedPrDate) || b.estimatedValueInr - a.estimatedValueInr,
  );
}

export function reorderTotals(rows: ReorderRow[]) {
  const byPriority: Record<string, { count: number; value: number }> = {};
  for (const r of rows) {
    const b = (byPriority[r.priority] ??= { count: 0, value: 0 });
    b.count += 1;
    b.value += r.estimatedValueInr;
  }
  return { count: rows.length, value: rows.reduce((a, r) => a + r.estimatedValueInr, 0), byPriority };
}

export function highPriorityReorders(rows: ReorderRow[], f: Filters, limit = 8): ReorderRow[] {
  return filterReorder(rows, f, { priority: 'HIGH' }).sort((a, b) => b.estimatedValueInr - a.estimatedValueInr).slice(0, limit);
}

export function filterPlan(rows: PlanRow[], f: Filters): PlanRow[] {
  return rows.filter((r) => matchDims(r, f, { crit: false }) && (!f.from || r.month >= f.from) && (!f.to || r.month <= f.to));
}

export interface PlanAgg { key: string; plan: number; po: number; gr: number; variance: number }

export function planBy(rows: PlanRow[], dim: 'month' | 'plantId' | 'materialGroup'): PlanAgg[] {
  const m = new Map<string, PlanAgg>();
  for (const r of rows) {
    const k = r[dim];
    const a = m.get(k) ?? { key: k, plan: 0, po: 0, gr: 0, variance: 0 };
    a.plan += r.planValueInr;
    a.po += r.actualPoValueInr;
    a.gr += r.actualGrValueInr;
    a.variance += r.varianceInr;
    m.set(k, a);
  }
  return [...m.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export const variancePct = (a: PlanAgg): number | null => (a.plan ? (a.variance / a.plan) * 100 : null);
