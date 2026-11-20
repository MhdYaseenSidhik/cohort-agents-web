import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, matchDims, parseFilters, serializeFilters } from '../filters';
import { filterPlan, filterReorder, planBy, reorderTotals, sortReorder, sumBy, vitalStockouts } from '../inventorySelectors';
import type { MaterialRow, PlanRow, ReorderRow, SummaryRow } from '../types';

const s = (p: string, t: string, g: string, v: number, n = 1, extra: Partial<SummaryRow> = {}): SummaryRow => ({ plantId: p, materialGroup: g, materialType: t, criticality: 'VITAL', movementClass: 'ACTIVE', inventoryStatus: 'NORMAL', abcClass: 'A', materials: n, availableQty: 1, valueInr: v, ...extra });
const rows = [s('HZL_DEMO_01', 'ZSPR', 'MECH', 100, 2), s('HZL_DEMO_02', 'ZSPR', 'MECH', 50), s('HZL_DEMO_02', 'ZSPN', 'ELEC', 25, 3)];

describe('filters and the URL', () => {
  it('round-trips through the query string', () => {
    const f = { ...DEFAULT_FILTERS, plant: 'HZL_DEMO_01', type: 'ZSPR', from: '2025-01' };
    expect(parseFilters(`?${serializeFilters(f)}`)).toEqual(f);
  });
  it('defaults to All plants with an empty query', () => {
    expect(serializeFilters(DEFAULT_FILTERS)).toBe('');
    expect(parseFilters('').plant).toBe('ALL_PLANTS');
  });
  it('matchDims applies plant, type, group and criticality', () => {
    const r = s('HZL_DEMO_01', 'ZSPR', 'MECH', 1);
    expect(matchDims(r, { ...DEFAULT_FILTERS, type: 'ZSPN' })).toBe(false);
    expect(matchDims(r, { ...DEFAULT_FILTERS, plant: 'HZL_DEMO_02' })).toBe(false);
    expect(matchDims(r, { ...DEFAULT_FILTERS, crit: 'ESSENTIAL' })).toBe(false);
    expect(matchDims(r, { ...DEFAULT_FILTERS, crit: 'ESSENTIAL' }, { crit: false })).toBe(true);
  });
});

describe('summary aggregation', () => {
  it('All plants sums real plants by dimension, sorted by value', () => {
    const out = sumBy(rows, 'materialType');
    expect(out).toEqual([{ key: 'ZSPR', value: 150, materials: 3 }, { key: 'ZSPN', value: 25, materials: 3 }]);
  });
  it('groups by plant', () => {
    expect(sumBy(rows, 'plantId').map((x) => x.key)).toEqual(['HZL_DEMO_01', 'HZL_DEMO_02']);
  });
});

const m = (over: Partial<MaterialRow>): MaterialRow => ({ materialId: 'M', plantId: 'HZL_DEMO_01', description: 'd', materialGroup: 'MECH', materialType: 'ZSPR', criticality: 'VITAL', abcClass: 'A', xyzClass: 'X', movementClass: 'ACTIVE', inventoryStatus: 'STOCKOUT', availableQty: 0, valueInr: 0, daysOnHand: 0, daysSinceLastConsumption: 0, safetyStockQty: 0, reorderPointQty: 0, maxStockQty: 0, trailing12mDemandQty: 1, ...over });

describe('alerts', () => {
  it('keeps VITAL stockouts and critical shortages only, by demand', () => {
    const out = vitalStockouts([m({ materialId: 'A', trailing12mDemandQty: 5 }), m({ materialId: 'B', criticality: 'DESIRABLE' }), m({ materialId: 'C', inventoryStatus: 'NORMAL' }), m({ materialId: 'D', inventoryStatus: 'CRITICAL_SHORTAGE', trailing12mDemandQty: 9 })], DEFAULT_FILTERS);
    expect(out.map((x) => x.materialId)).toEqual(['D', 'A']);
  });
});

const ro = (id: string, priority: string, date: string, value: number, shutdownId: string | null = null): ReorderRow => ({ recommendationId: id, materialId: id, plantId: 'HZL_DEMO_01', materialGroup: 'MECH', materialType: 'ZSPR', criticality: 'VITAL', priority, recommendedPrDate: date, recommendedQty: 1, estimatedValueInr: value, availableQty: 0, openPrQty: 0, openPoQty: 0, safetyStockQty: 0, reorderPointQty: 0, reason: 'r', shutdownId });

describe('replenishment', () => {
  const list = [ro('a', 'LOW', '2026-01-01', 5), ro('b', 'HIGH', '2026-03-01', 10, 'SD1'), ro('c', 'HIGH', '2026-02-01', 20), ro('d', 'MEDIUM', '2026-02-01', 1)];
  it('sorts by priority then PR date', () => {
    expect(sortReorder(list).map((x) => x.recommendationId)).toEqual(['c', 'b', 'd', 'a']);
  });
  it('filters by priority and shutdown-linked flag', () => {
    expect(filterReorder(list, DEFAULT_FILTERS, { priority: 'HIGH' })).toHaveLength(2);
    expect(filterReorder(list, DEFAULT_FILTERS, { shutdownOnly: true }).map((x) => x.recommendationId)).toEqual(['b']);
    expect(filterReorder(list, { ...DEFAULT_FILTERS, type: 'ZSPN' })).toHaveLength(0);
  });
  it('totals count, value and per-priority', () => {
    const t = reorderTotals(list);
    expect(t.count).toBe(4);
    expect(t.value).toBe(36);
    expect(t.byPriority.HIGH).toEqual({ count: 2, value: 30 });
  });
});

const pr = (month: string, plant: string, g: string, plan: number, po: number, gr: number, variance: number): PlanRow => ({ month, plantId: plant, materialGroup: g, materialType: 'ZSPR', shutdownDriven: false, planValueInr: plan, actualPoValueInr: po, actualGrValueInr: gr, varianceInr: variance, variancePct: 0 });

describe('plan vs actual', () => {
  const list = [pr('2024-01', 'HZL_DEMO_01', 'MECH', 10, 12, 11, 2), pr('2024-01', 'HZL_DEMO_02', 'MECH', 5, 4, 4, -1), pr('2024-02', 'HZL_DEMO_01', 'ELEC', 7, 7, 7, 0)];
  it('sums across plants for All plants and by month', () => {
    const out = planBy(filterPlan(list, DEFAULT_FILTERS), 'month');
    expect(out[0]).toEqual({ key: '2024-01', plan: 15, po: 16, gr: 15, variance: 1 });
  });
  it('applies plant and month range', () => {
    expect(filterPlan(list, { ...DEFAULT_FILTERS, plant: 'HZL_DEMO_01', from: '2024-02' })).toHaveLength(1);
  });
  it('returns nothing for a filter that matches nothing', () => {
    expect(filterPlan(list, { ...DEFAULT_FILTERS, type: 'ZSPN' })).toHaveLength(0);
  });
});
