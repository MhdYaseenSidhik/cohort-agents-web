import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS } from '../filters';
import { backtestByMonth, byGroupTotal, byMaterialTotal, byMonth, byPlantMonthForHorizon, byTypeMonth, filterForecast, forecastCovers, forecastMatchesMetrics, groupOutputs, horizonLabel, horizonsOf, rowsForHorizon, wape } from '../forecastSelectors';
import { checkSchemaVersion } from '../loader';
import type { Forecast, ForecastRow } from '../types';

const r = (id: string, type: string, group: string, month: string, horizon: number, predicted: number): ForecastRow => ({ seriesId: `${id}|P`, materialId: id, plantId: 'HZL_DEMO_01', materialGroup: group, materialType: type, month, horizon, predicted, lower: predicted - 1, upper: predicted + 1 });
const rows = [r('A', 'ZSPR', 'G1', '2026-01', 1, 10), r('A', 'ZSPR', 'G1', '2026-02', 2, 20), r('A', 'ZSPR', 'G1', '2026-04', 4, 40), r('B', 'ZSPN', 'G2', '2026-01', 1, 5), r('B', 'ZSPN', 'G2', '2026-02', 2, -3)];

describe('horizon filtering', () => {
  it('keeps rows up to the horizon', () => {
    expect(rowsForHorizon(rows, 1)).toHaveLength(2);
    expect(rowsForHorizon(rows, 3)).toHaveLength(4);
    expect(rowsForHorizon(rows, 11)).toHaveLength(5);
  });
  it('labels the long view with the history caveat, exactly', () => {
    expect(horizonLabel(11, 11)).toBe('11-month forecast (maximum for 36 months of history)');
    expect(horizonLabel(3, 11)).toBe('3-month forecast');
    expect(horizonLabel(6, 11)).toBe('6-month forecast');
  });
  it('lists only the horizons the file lists', () => {
    expect(horizonsOf({ horizons: [6, 3, 11] } as Forecast)).toEqual([3, 6, 11]);
  });
});

describe('forecast aggregation', () => {
  it('sums predicted by month and by type; negatives are not clipped', () => {
    expect(byMonth(rows)).toEqual([{ month: '2026-01', predicted: 15 }, { month: '2026-02', predicted: 17 }, { month: '2026-04', predicted: 40 }]);
    expect(byTypeMonth(rows).ZSPN).toEqual([{ month: '2026-01', predicted: 5 }, { month: '2026-02', predicted: -3 }]);
  });
  it('sums by group and by material, sorted descending', () => {
    expect(byGroupTotal(rows).map((g) => g.key)).toEqual(['G1', 'G2']);
    const m = byMaterialTotal(rows);
    expect(m[0]).toMatchObject({ materialId: 'A', predicted: 70, months: 3 });
  });
  it('never exposes a summed band', () => {
    expect(Object.keys(byMaterialTotal(rows)[0])).not.toContain('lower');
    expect(Object.keys(byMonth(rows)[0])).toEqual(['month', 'predicted']);
  });
  it('filters by type and group at a horizon, ignoring criticality', () => {
    expect(filterForecast(rows, { ...DEFAULT_FILTERS, type: 'ZSPN' }, 11)).toHaveLength(2);
    expect(filterForecast(rows, { ...DEFAULT_FILTERS, type: 'ZSPR', crit: 'VITAL' }, 3)).toHaveLength(2);
    expect(filterForecast(rows, { ...DEFAULT_FILTERS, group: 'NOPE' }, 11)).toHaveLength(0);
  });
  it('covers All plants and HZL_DEMO_01 only', () => {
    expect(forecastCovers(DEFAULT_FILTERS)).toBe(true);
    expect(forecastCovers({ ...DEFAULT_FILTERS, plant: 'HZL_DEMO_01' })).toBe(true);
    expect(forecastCovers({ ...DEFAULT_FILTERS, plant: 'HZL_DEMO_02' })).toBe(false);
  });
  it('byPlantMonth honours the horizon and plant', () => {
    const f = { byPlantMonth: [{ plantId: 'HZL_DEMO_01', month: '2026-01', horizon: 1, predicted: 4 }, { plantId: 'HZL_DEMO_01', month: '2026-04', horizon: 4, predicted: 9 }] } as Forecast;
    expect(byPlantMonthForHorizon(f, 'ALL_PLANTS', 3)).toEqual([{ month: '2026-01', predicted: 4 }]);
    expect(byPlantMonthForHorizon(f, 'HZL_DEMO_02', 11)).toEqual([]);
  });
});

describe('backtest', () => {
  it('aggregates actual and predicted by month and computes WAPE', () => {
    const pts = backtestByMonth({ byPlantMonth: [{ plantId: 'P', month: '2025-02', actual: 10, predicted: 5 }, { plantId: 'P', month: '2025-03', actual: 10, predicted: 25 }] } as never, 'ALL_PLANTS');
    expect(pts).toHaveLength(2);
    expect(wape(pts)).toBeCloseTo(1, 5);
    expect(wape([{ actual: 0, predicted: 1 }])).toBeNull();
  });
});

describe('provenance', () => {
  it('groups outputs by kind', () => {
    expect(groupOutputs([{ file: 'forecast-001.csv' }, { file: 'backtest-001.csv' }, { file: 'backtest-002.csv' }, { file: 'metrics.json' }])).toEqual({ forecast: 1, backtest: 2, metrics: 1, other: 0 });
  });
  it('flags an experiment or horizon mismatch against metrics.json', () => {
    const f = { experimentId: 'E1', predictionLength: 11 };
    expect(forecastMatchesMetrics(f, { metricsExperimentId: 'E1', metricsHorizon: 11 }).ok).toBe(true);
    expect(forecastMatchesMetrics(f, { metricsExperimentId: 'E2', metricsHorizon: 11 }).ok).toBe(false);
    expect(forecastMatchesMetrics(f, { metricsExperimentId: 'E1', metricsHorizon: 12 }).reason).toMatch(/horizon/);
    expect(forecastMatchesMetrics(f, undefined).ok).toBe(false);
  });
  it('names a schemaVersion mismatch', () => {
    expect(checkSchemaVersion(3)).toBeNull();
    expect(checkSchemaVersion(2)).toMatch(/schemaVersion mismatch.*2.*3/);
  });
});
