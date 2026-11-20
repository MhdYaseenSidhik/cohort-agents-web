# Dashboard plan

Every screen shows the manifest disclaimer and the as-of date (2025-12-31) in the shell footer and a banner. Every tile shows unit, definition (tooltip) and as-of. Money uses Indian formatting (₹1.25 Cr, ₹4.3 L) with the full value in a tooltip. Percentages one decimal.

Global filters (URL query string): `plant` (ALL or HZL_DEMO_0n), `type` (ZSPR | ZSPN), `group`, `crit`, `from`, `to` (month range). Screen is the hash route.

## 1. Overview (#/)
- KPI tiles from kpis.json for the selected plant (ALL_PLANTS rows for All plants, never summed): gross inventory value, non-moving, slow-moving, obsolete, excess, days on hand, turnover, critical spare availability, stockout count, understock count, potential reduction INR, working capital opportunity. Each: latest value, sparkline over the month range, change vs prior month, coloured by catalog.direction (neutral never red/green); single-month KPIs say "no prior month".
- Notice when a type/group/criticality filter is set: KPIs are per plant, not filtered by it.
- Top alerts: VITAL STOCKOUT / CRITICAL_SHORTAGE materials (materials.json) and HIGH-priority reorders (reorder.json), filtered, top 8 by value, with link to replenishment.
- States: skeleton tiles, error with retry, empty message when a filter matches nothing.

## 2. KPI scorecard (#/scorecard)
- Table of all 25 catalog KPIs: label, unit, latest, prior month, change, same month last year, sparkline, direction badge. Plant selector via the global filter, plus an All plants column set. Colour by direction. Sort by label or change.

## 3. Inventory health (#/health)
- inventory_summary.json: value and material count by material type (ZSPR vs ZSPN), movement class, inventory status, criticality, ABC class (bar charts); filters plant/type/group/crit apply; All plants sums plants.
- Drill-down: plant -> material group -> material list (materials.json, virtualised, sort, search) -> material detail drawer (stock, classification, reorder recommendation, backtest series and forecast when present). Breadcrumb back.
- Empty state when the filters match nothing.

## 4. Replenishment (#/replenishment)
- reorder.json: totals (count, value), table by priority with PR date, qty, value, reason, shutdown flag; filters priority, shutdown-linked, plant/type/group/crit; sort; virtualised.

## 5. Demand forecast (#/forecast)
- Horizon selector 3 | 6 | 11 from forecast.json.horizons. Label for 11: "11-month forecast (maximum for 36 months of history)".
- Line chart: byPlantMonth predicted for the horizon (no band). Material-type chart: sum of rows by month for ZSPR/ZSPN with horizon filter. Material-group bars. Material table (rows, summed over the horizon) with predicted mean and lower-upper band per month shown for the selected material in a band chart. Bounds are never summed.
- Model facts from manifest: experiment id, created at, best model, metric RMSE, backtest MAE/WAPE, months covered, series count.
- Verdict warning panel (WAPE 1.172) always visible. Forecast covers HZL_DEMO_01 only: other plants show an empty state saying so.
- Backtest card: actual vs predicted (byPlantMonth, 2025-02..2025-12), clearly titled "Backtest (held-out months, not a forecast)", with leaderboard.
- metrics.json check panel from manifest.forecast.metricsCheck and the list of gs:// URIs (grouped: 37 forecast, 30 backtest, metrics.json).

## 6. Plan versus actual (#/plan)
- plan_vs_actual.json: plan, PO, GR value and variance by month (chart), by plant and by material group (tables); filters plant/type/group/month range.

## Data-module contract
All fetching through `loadDataset(name)`; manifest, dims and kpis at start; large files lazily. schemaVersion mismatch (!= 3) shows an error naming it.

## GAPS
- Forecast and backtest exist for HZL_DEMO_01 only (training scope); no forecast for plants 02..06.
- No 12-month horizon (history is 36 months); long view is 11 months.
- No forecast for criticality or ABC (not in forecast rows); criticality filter does not apply to the forecast.
- Opportunity KPIs have a single month: no trend or prior-month change.
- Per-file row counts of the 68 GCS outputs are unknown (null in manifest); only the 65,560 total is known.
- Generalisation verdict not read back (manifest note); shown as unknown.
- metrics.json not re-read from GCS by the dashboard seat (no gcp_read_object tool, anonymous HTTP is 403); the recorded metricsCheck is shown.
- plan_vs_actual starts 2024-01; kpis include the 2023 backcast.
- Forecast figures are net consumption quantities (units), not INR.
