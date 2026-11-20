# Data profile (public/data/, schemaVersion 3, asOf 2025-12-31)

Computed by `scripts/profile-data.mjs` against `main` at d8b9537. Disclaimer (manifest): *Simulated POC figure. Not actual Vedanta or Hindustan Zinc performance and not a claim of realised savings.*

| File | Rows (manifest = file) | Notes |
|---|---|---|
| dims.json | 6 | 6 plants HZL_DEMO_01..06, 12 material groups, types ZSPN + ZSPR, criticality VITAL/ESSENTIAL/DESIRABLE, 4 movement classes, 8 inventory statuses |
| kpis.json | 5075 | 25 KPI codes in catalog; 7 plant keys (ALL_PLANTS + 6); months 2023-01..2025-12 (36, 2023 is a backcast); no duplicates, no nulls |
| inventory_summary.json | 4596 | ZSPN, ZSPR; ABC A/B/C; total valueInr 5,125,222,946.78 (equals ALL_PLANTS GROSS_INVENTORY_VALUE_INR 2025-12) |
| materials.json | 34717 | one row per material x plant; no empty descriptions |
| reorder.json | 3916 | priorities HIGH/MEDIUM/LOW; 694 rows carry a shutdownId |
| plan_vs_actual.json | 5843 | months 2024-01..2025-12 (24); 6 plants |
| forecast.json | 65560 | available=true, experiment 6b0088153b3f4b47b7dcd1a8, predictionLength 11, 2026-01..2026-11, horizons [3,6,11], 5960 series, HZL_DEMO_01 only, bands present on every row, 11 byPlantMonth rows, no interval on byPlantMonth |
| forecast_holdout.json | 65560 | kind=backtest, months 2025-02..2025-12, metric RMSE 11.924, MAE 5.477, WAPE 1.172, leaderboard 3 models, 11 byPlantMonth rows |

## Findings that shape the build
- **Opportunity KPIs have one month only.** DUPLICATE_SKU_OPPORTUNITY_INR, POTENTIAL_INVENTORY_REDUCTION_INR/_PCT, WORKING_CAPITAL_OPPORTUNITY_INR (scenario MODELED_OPPORTUNITY) and TARGET_INVENTORY_REDUCTION_PCT (POC_SCENARIO) each have 1 month (7 rows). No trend, no prior-month change: shown as "no prior month".
- **Forecast is HZL_DEMO_01 only.** The All plants view of the forecast therefore equals HZL_DEMO_01 and is labelled so. Other plants show an empty state.
- **Horizons are 3, 6 and 11.** The 12-month view does not exist; the long view is labelled "11-month forecast (maximum for 36 months of history)".
- **Backtest WAPE 1.172** (>= 1): the model is no better than predicting zero. The verdict is `warning` and is shown on the forecast and backtest screens.
- **Backtest vs forecast volume.** The backtest predicted total is 0.52 of the actual (under-prediction).
- 11 forecast rows are negative (more reversals than issues). Values are not clipped.
- Forecast rows sum by material type: ZSPN 67,019.78; ZSPR 127,011.58 (total 194,031.35 = byPlantMonth total).
- manifest.forecast.outputs lists 68 gs:// objects (37 forecast, 30 backtest, metrics.json), bucket `contextflow_predictions_forecast`; per-file `rows` are null (only the 65,560 total is known).
- metrics.json gate: this seat has no `gcp_read_object`; the Data Agent's recorded `metricsCheck` (experimentId, horizon 11, rows 65,560 match) is shown as the source and re-verified against forecast.json in a unit test.
