import type { DatasetMap } from '../data/types';

const pl = (n: number) => `HZL_DEMO_0${n}`;
const fcRow = (id: string, month: string, horizon: number, predicted: number) => ({ seriesId: `${id}|${pl(1)}`, materialId: id, plantId: pl(1), materialGroup: 'MECHANICAL', materialType: 'ZSPR', month, horizon, predicted, lower: predicted - 2, upper: predicted + 2 });
const months = ['2025-11', '2025-12'];

export const FIXTURES: DatasetMap = {
  manifest: {
    schemaVersion: 3, generatedAt: '2026-11-20T18:26:00Z', asOf: '2025-12-31', backcastIncluded: true,
    disclaimer: 'Simulated POC figure. Not actual Vedanta or Hindustan Zinc performance and not a claim of realised savings.',
    files: [],
    forecast: {
      experimentId: 'EXP1', experimentCreatedAt: '2026-11-20T17:49:09.987Z', problemType: 'time_series', predictionLength: 11, seriesCount: 1,
      bestModel: 'WeightedEnsemble', metric: { name: 'RMSE', value: 11.924 }, backtestError: { mae: 5.477, wape: 1.172 }, verdict: 'warning',
      verdictReasons: ['Backtest WAPE is 1.172 (1 or more): the model is no better than predicting zero on held-out months.'],
      forecastAssetId: 'A', forecastFrom: '2026-01', forecastTo: '2026-11',
      outputs: [{ file: 'forecast-001.csv', uri: 'gs://b/forecast-001.csv', bucket: 'b', name: 'forecast-001.csv', rows: null }, { file: 'metrics.json', uri: 'gs://b/metrics.json', bucket: 'b', name: 'metrics.json', rows: null }],
      metricsCheck: { checkedAt: 'now', object: 'gs://b/metrics.json', metricsExperimentId: 'EXP1', forecastJsonExperimentId: 'EXP1', experimentIdMatches: true, metricsHorizon: 11, forecastJsonPredictionLength: 11, horizonMatches: true, metricsForecastRows: 3, forecastJsonRows: 3, rowsMatch: true, backtestRmse: 44.99, leaderboardBestRmse: 11.924, note: 'note', generalizationVerdict: null, generalizationNote: 'n', result: 'pass' },
    },
  },
  dims: {
    plants: [1, 2].map((n) => ({ plantId: pl(n), name: `Plant ${n}`, type: 'MINE', region: 'North' })),
    materialGroups: [{ code: 'MECHANICAL', name: 'MECHANICAL' }],
    materialTypes: [{ code: 'ZSPN', name: 'ZSPN' }, { code: 'ZSPR', name: 'ZSPR' }],
    criticality: [{ code: 'VITAL', name: 'Vital' }], movementClasses: ['ACTIVE'], inventoryStatuses: ['STOCKOUT', 'NORMAL'],
  },
  kpis: {
    catalog: [
      { code: 'GROSS_INVENTORY_VALUE_INR', label: 'Gross inventory value', uom: 'INR', direction: 'neutral', definition: 'Total value.' },
      { code: 'DAYS_ON_HAND', label: 'Days on hand', uom: 'DAYS', direction: 'lower_is_better', definition: 'Days of stock.' },
    ],
    rows: [
      ...months.flatMap((m, i) => [{ month: m, plantId: 'ALL_PLANTS', kpiCode: 'GROSS_INVENTORY_VALUE_INR', value: 5e9 + i * 1e8, scenario: 'S' }, { month: m, plantId: 'ALL_PLANTS', kpiCode: 'DAYS_ON_HAND', value: 190 - i * 3, scenario: 'S' }, { month: m, plantId: pl(1), kpiCode: 'DAYS_ON_HAND', value: 100 + i, scenario: 'S' }]),
    ],
  },
  inventory_summary: {
    asOf: '2025-12-31',
    rows: [
      { plantId: pl(1), materialGroup: 'MECHANICAL', materialType: 'ZSPR', criticality: 'VITAL', movementClass: 'ACTIVE', inventoryStatus: 'NORMAL', abcClass: 'A', materials: 3, availableQty: 10, valueInr: 1e7 },
      { plantId: pl(2), materialGroup: 'MECHANICAL', materialType: 'ZSPN', criticality: 'VITAL', movementClass: 'ACTIVE', inventoryStatus: 'STOCKOUT', abcClass: 'B', materials: 2, availableQty: 0, valueInr: 5e6 },
    ],
  },
  materials: {
    asOf: '2025-12-31',
    rows: [{ materialId: 'M1', plantId: pl(1), description: 'Bush Assembly', materialGroup: 'MECHANICAL', materialType: 'ZSPR', criticality: 'VITAL', abcClass: 'A', xyzClass: 'X', movementClass: 'ACTIVE', inventoryStatus: 'STOCKOUT', availableQty: 0, valueInr: 0, daysOnHand: 0, daysSinceLastConsumption: 5, safetyStockQty: 1, reorderPointQty: 2, maxStockQty: 3, trailing12mDemandQty: 9 }],
  },
  reorder: {
    asOf: '2025-12-31',
    rows: [{ recommendationId: 'R1', materialId: 'M1', plantId: pl(1), materialGroup: 'MECHANICAL', materialType: 'ZSPR', criticality: 'VITAL', priority: 'HIGH', recommendedPrDate: '2026-02-20', recommendedQty: 4, estimatedValueInr: 250000, availableQty: 0, openPrQty: 0, openPoQty: 0, safetyStockQty: 1, reorderPointQty: 2, reason: 'Below reorder point.', shutdownId: 'SD1' }],
  },
  plan_vs_actual: {
    rows: [{ month: '2024-01', plantId: pl(1), materialGroup: 'MECHANICAL', materialType: 'ZSPR', shutdownDriven: false, planValueInr: 100, actualPoValueInr: 120, actualGrValueInr: 110, varianceInr: 20, variancePct: 20 }],
  },
  forecast: {
    available: true, reason: null, kind: 'forecast', experimentId: 'EXP1', assetId: 'A', predictionLength: 11, forecastFrom: '2026-01', forecastTo: '2026-11', horizons: [3, 6, 11], note: 'Forecast note.',
    byPlantMonth: [{ plantId: pl(1), month: '2026-01', horizon: 1, predicted: 10 }, { plantId: pl(1), month: '2026-02', horizon: 2, predicted: 12 }],
    rows: [fcRow('M1', '2026-01', 1, 10), fcRow('M1', '2026-02', 2, 12), fcRow('M1', '2026-05', 5, 14), fcRow('M1', '2026-09', 9, 18)],
  },
  forecast_holdout: {
    kind: 'backtest', note: 'Predictions for held-out months the model did not see; not a forecast of future months.', experimentId: 'EXP1', predictionLength: 11,
    metric: { name: 'RMSE', value: 11.924 }, error: { mae: 5.477, wape: 1.172 }, leaderboard: [{ model: 'WeightedEnsemble', metric: 11.924 }],
    byPlantMonth: [{ plantId: pl(1), month: '2025-02', actual: 100, predicted: 60 }, { plantId: pl(1), month: '2025-03', actual: 90, predicted: 50 }],
    series: [{ seriesId: `M1|${pl(1)}`, materialId: 'M1', plantId: pl(1), materialGroup: 'MECHANICAL', materialType: 'ZSPR', month: '2025-02', actual: 1, predicted: 0.5, lower: 0, upper: 1 }],
  },
};
