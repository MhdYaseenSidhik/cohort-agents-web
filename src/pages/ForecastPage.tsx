import { useEffect, useMemo, useState } from 'react';
import { useCore } from '../app/CoreData';
import { useFilters } from '../app/FilterContext';
import { BacktestPanel } from '../components/forecast/BacktestPanel';
import { BandChart } from '../components/forecast/BandChart';
import { ForecastLineChart } from '../components/forecast/ForecastLineChart';
import { GroupBars } from '../components/forecast/GroupBars';
import { MaterialForecastTable } from '../components/forecast/MaterialForecastTable';
import { ModelFacts } from '../components/forecast/ModelFacts';
import { Provenance } from '../components/forecast/Provenance';
import { VerdictWarning } from '../components/forecast/VerdictWarning';
import { Badge, PageHeader, Panel } from '../components/ui/Panel';
import { Segmented } from '../components/ui/Segmented';
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States';
import { formatNumber, monthLabel } from '../data/format';
import { byGroupTotal, byMaterialTotal, byPlantMonthForHorizon, byTypeMonth, filterForecast, forecastCovers, FORECAST_PLANT, horizonLabel, horizonsOf, materialSeries } from '../data/forecastSelectors';
import { useDataset } from '../data/useDataset';

export function ForecastPage() {
  const { manifest } = useCore();
  const { filters, setFilters } = useFilters();
  const fcd = useDataset('forecast');
  const hod = useDataset('forecast_holdout');
  const [horizon, setHorizon] = useState<number>(0);
  const [picked, setPicked] = useState('');
  const fc = fcd.data;
  const horizons = fc ? horizonsOf(fc) : [];
  const max = fc?.predictionLength ?? 0;
  const h = horizon || max;

  const rows = useMemo(() => (fc ? filterForecast(fc.rows, filters, h) : []), [fc, filters, h]);
  const mats = useMemo(() => byMaterialTotal(rows), [rows]);
  const selected = picked && mats.some((m) => m.materialId === picked) ? picked : mats[0]?.materialId ?? '';
  const band = useMemo(() => (fc && selected ? materialSeries(fc.rows, selected, FORECAST_PLANT, h) : []), [fc, selected, h]);
  const plantLine = useMemo(() => (fc ? byPlantMonthForHorizon(fc, filters.plant, h) : []), [fc, filters.plant, h]);
  const typeLines = useMemo(() => Object.entries(byTypeMonth(rows)).map(([name, points]) => ({ name, points })), [rows]);
  const groups = useMemo(() => byGroupTotal(rows), [rows]);
  useEffect(() => setPicked(''), [filters.type, filters.group, h]);

  const covered = forecastCovers(filters);
  const months = fc ? [...new Set(rows.map((r) => r.month))].sort() : [];
  const unavailable = fc && !fc.available;

  return (
    <div className="grid gap-6">
      <PageHeader title="Demand forecast" description="Monthly net consumption forecast (movement 261 minus 262, in units) for plant HZL_DEMO_01, with the model's lower-upper band. Figures are simulated and indicative: see the verdict below." />
      <VerdictWarning />
      {fcd.error ? <ErrorState message={fcd.error} onRetry={fcd.retry} /> : fcd.loading || !fc ? <LoadingBlock label="Loading forecast" /> : unavailable ? (
        <EmptyState title="No forecast is available">{fc.reason ?? 'The forecast file reports available = false.'}</EmptyState>
      ) : (
        <>
          <Panel
            title={horizonLabel(h, max)}
            badge={<Badge tone="accent">Forecast</Badge>}
            subtitle={`${months.length ? `${monthLabel(months[0])} to ${monthLabel(months.at(-1)!)}` : '—'} · ${months.length} months · band is the 0.1–0.9 quantile range of one material; bounds are never summed.`}
            actions={<Segmented label="Forecast horizon" value={h} onChange={setHorizon} options={horizons.map((x) => ({ value: x, label: x === max ? `${x} months (max)` : `${x} months` }))} />}
          >
            {!covered ? (
              <EmptyState title={`No forecast for ${filters.plant}`} action={<button type="button" className="btn" onClick={() => setFilters({ plant: 'ALL_PLANTS' })}>Show all plants</button>}>The experiment was trained on {FORECAST_PLANT} only. Choose All plants or {FORECAST_PLANT}.</EmptyState>
            ) : rows.length === 0 ? (
              <EmptyState title="No forecast rows match these filters" action={<button type="button" className="btn" onClick={() => setFilters({ type: '', group: '' })}>Clear type and group</button>}>Criticality is not a dimension of the forecast, so that filter does not apply here.</EmptyState>
            ) : (
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <h3 className="text-sm font-semibold text-ink">Plant total by month (no band: quantiles cannot be summed)</h3>
                  <ForecastLineChart label={`Plant forecast by month, ${h} months`} series={[{ name: `${FORECAST_PLANT} (forecast)`, points: plantLine }]} />
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="grid gap-2 min-w-0">
                    <h3 className="text-sm font-semibold text-ink">By material type (ZSPR and ZSPN)</h3>
                    <ForecastLineChart label="Forecast by material type" series={typeLines} />
                  </div>
                  <div className="grid gap-2 min-w-0">
                    <h3 className="text-sm font-semibold text-ink">By material group, total over {h} months</h3>
                    <GroupBars rows={groups} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <h3 className="text-sm font-semibold text-ink">Material {selected} with lower-upper band, {h} months</h3>
                  {band.length ? <BandChart rows={band} label={`Forecast with band for ${selected}`} /> : <p className="text-sm text-muted">Select a material below.</p>}
                  <p className="text-xs text-muted">Negative values mean more reversals than issues are expected; values are not clipped.</p>
                </div>
                <MaterialForecastTable rows={mats} horizon={h} selected={selected} onSelect={setPicked} />
              </div>
            )}
          </Panel>
          <ModelFacts />
          {hod.error ? <ErrorState message={hod.error} onRetry={hod.retry} /> : hod.data ? <BacktestPanel ho={hod.data} /> : <LoadingBlock label="Loading backtest" />}
          <Provenance fc={fc} />
          <p className="text-xs text-muted num">Forecast {formatNumber(fc.rows.length)} rows · {formatNumber(manifest.forecast?.seriesCount ?? 0)} series · experiment {fc.experimentId}. {fc.note}</p>
        </>
      )}
    </div>
  );
}
