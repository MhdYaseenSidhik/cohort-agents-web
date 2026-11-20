// Typed models that mirror public/data/SCHEMA.md (schemaVersion 3) exactly.
export const SCHEMA_VERSION = 3;
export const ALL_PLANTS = 'ALL_PLANTS';

export type Direction = 'higher_is_better' | 'lower_is_better' | 'neutral';

export interface ManifestFile {
  name: string;
  rows: number;
  generatedAt: string;
  source: { integrationId: string | null; syncId: string | null; assetId: string | null; sql: string | null };
}
export interface ForecastOutput { file: string; uri: string; bucket: string; name: string; rows: number | null }
export interface MetricsCheck {
  checkedAt: string;
  object: string;
  metricsExperimentId: string;
  forecastJsonExperimentId: string;
  experimentIdMatches: boolean;
  metricsHorizon: number;
  forecastJsonPredictionLength: number;
  horizonMatches: boolean;
  metricsForecastRows: number;
  forecastJsonRows: number;
  rowsMatch: boolean;
  backtestRmse: number;
  leaderboardBestRmse: number;
  note: string;
  generalizationVerdict: string | null;
  generalizationNote: string;
  result: string;
}
export interface ManifestForecast {
  experimentId: string;
  experimentCreatedAt: string;
  problemType: string;
  predictionLength: number;
  seriesCount: number;
  bestModel: string;
  metric: { name: string; value: number };
  backtestError: { mae: number; wape: number };
  verdict: string;
  verdictReasons: string[];
  forecastAssetId: string;
  forecastFrom: string;
  forecastTo: string;
  outputs: ForecastOutput[] | null;
  metricsCheck?: MetricsCheck;
}
export interface Manifest {
  schemaVersion: number;
  generatedAt: string;
  asOf: string;
  disclaimer: string;
  backcastIncluded: boolean;
  files: ManifestFile[];
  forecast: ManifestForecast | null;
}

export interface Plant { plantId: string; name: string; type: string; region: string }
export interface Coded { code: string; name: string }
export interface Dims {
  plants: Plant[];
  materialGroups: Coded[];
  materialTypes: Coded[];
  criticality: Coded[];
  movementClasses: string[];
  inventoryStatuses: string[];
}

export interface KpiCatalogItem { code: string; label: string; uom: string; direction: Direction; definition: string }
export interface KpiRow { month: string; plantId: string; kpiCode: string; value: number; scenario: string }
export interface Kpis { catalog: KpiCatalogItem[]; rows: KpiRow[] }

export interface SummaryRow {
  plantId: string; materialGroup: string; materialType: string; criticality: string;
  movementClass: string; inventoryStatus: string; abcClass: string;
  materials: number; availableQty: number; valueInr: number;
}
export interface InventorySummary { asOf: string; rows: SummaryRow[] }

export interface MaterialRow {
  materialId: string; plantId: string; description: string; materialGroup: string; materialType: string;
  criticality: string; abcClass: string; xyzClass: string; movementClass: string; inventoryStatus: string;
  availableQty: number; valueInr: number; daysOnHand: number; daysSinceLastConsumption: number;
  safetyStockQty: number; reorderPointQty: number; maxStockQty: number; trailing12mDemandQty: number;
}
export interface Materials { asOf: string; rows: MaterialRow[] }

export interface ReorderRow {
  recommendationId: string; materialId: string; plantId: string; materialGroup: string; materialType: string;
  criticality: string; priority: string; recommendedPrDate: string; recommendedQty: number;
  estimatedValueInr: number; availableQty: number; openPrQty: number; openPoQty: number;
  safetyStockQty: number; reorderPointQty: number; reason: string; shutdownId: string | null;
}
export interface Reorder { asOf: string; rows: ReorderRow[] }

export interface PlanRow {
  month: string; plantId: string; materialGroup: string; materialType: string; shutdownDriven: boolean;
  planValueInr: number; actualPoValueInr: number; actualGrValueInr: number; varianceInr: number; variancePct: number;
}
export interface PlanVsActual { rows: PlanRow[] }

export interface SeriesPoint {
  seriesId: string; materialId: string; plantId: string; materialGroup: string; materialType: string; month: string;
  predicted: number; lower: number | null; upper: number | null;
}
export interface ForecastRow extends SeriesPoint { horizon: number }
export interface Forecast {
  available: boolean; reason: string | null; kind: 'forecast'; experimentId: string; assetId: string;
  predictionLength: number; forecastFrom: string; forecastTo: string; horizons: number[]; note: string;
  byPlantMonth: { plantId: string; month: string; horizon: number; predicted: number }[];
  rows: ForecastRow[];
}
export interface HoldoutRow extends SeriesPoint { actual: number }
export interface Holdout {
  kind: 'backtest'; note: string; experimentId: string; predictionLength: number;
  metric: { name: string; value: number }; error: { mae: number; wape: number };
  leaderboard: { model: string; metric: number }[];
  byPlantMonth: { plantId: string; month: string; actual: number; predicted: number }[];
  series: HoldoutRow[];
}

export interface DatasetMap {
  'manifest': Manifest;
  'dims': Dims;
  'kpis': Kpis;
  'inventory_summary': InventorySummary;
  'materials': Materials;
  'reorder': Reorder;
  'plan_vs_actual': PlanVsActual;
  'forecast': Forecast;
  'forecast_holdout': Holdout;
}
export type DatasetName = keyof DatasetMap;
