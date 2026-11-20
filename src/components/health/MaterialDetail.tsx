import { useMemo } from 'react';
import { X } from 'lucide-react';
import { formatInr, formatInrFull, formatNumber } from '../../data/format';
import { backtestMaterial, FORECAST_PLANT, materialSeries } from '../../data/forecastSelectors';
import type { Forecast, Holdout, MaterialRow, ReorderRow } from '../../data/types';
import { useDataset } from '../../data/useDataset';
import { BandChart } from '../forecast/BandChart';
import { Badge } from '../ui/Panel';
import { ErrorState, Skeleton } from '../ui/States';
import { BacktestSeries } from './BacktestSeries';

function Fact({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="grid gap-1"><dt className="text-xs text-muted">{label}</dt><dd className="text-sm font-medium text-ink num" title={title}>{value}</dd></div>
  );
}

function ForecastBlock({ m, fc, ho }: { m: MaterialRow; fc: Forecast; ho: Holdout }) {
  const rows = useMemo(() => materialSeries(fc.rows, m.materialId, m.plantId, fc.predictionLength), [fc, m]);
  const bt = useMemo(() => backtestMaterial(ho.series, m.materialId, m.plantId), [ho, m]);
  return (
    <div className="grid gap-4">
      <div>
        <h4 className="text-sm font-semibold text-ink mb-2">{`${fc.predictionLength}-month forecast with 0.1–0.9 band`}</h4>
        {rows.length ? <BandChart rows={rows} label={`Forecast for ${m.materialId}`} /> : <p className="text-sm text-muted">No forecast series for this material.</p>}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">Backtest on held-out months <Badge tone="warn">Backtest, not a forecast</Badge></h4>
        {bt.length ? <BacktestSeries rows={bt} label={`Backtest for ${m.materialId}`} /> : <p className="text-sm text-muted">No backtest series for this material.</p>}
      </div>
    </div>
  );
}

export function MaterialDetail({ m, reorder, onClose }: { m: MaterialRow; reorder: ReorderRow[]; onClose: () => void }) {
  const covered = m.plantId === FORECAST_PLANT;
  const fc = useDataset('forecast');
  const ho = useDataset('forecast_holdout');
  const rec = reorder.find((r) => r.materialId === m.materialId && r.plantId === m.plantId);
  return (
    <aside role="dialog" aria-modal="false" aria-label={`Material ${m.materialId}`} className="card p-4 md:p-6 grid gap-6 shadow-3">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-ink">{m.description}</h3>
          <p className="text-sm text-muted num">{m.materialId} · {m.plantId} · {m.materialType} · {m.materialGroup.replace(/_/g, ' ')}</p>
        </div>
        <button type="button" className="btn" onClick={onClose} aria-label="Close material detail"><X size={16} aria-hidden="true" /> Close</button>
      </header>
      <section aria-label="Stock and classification">
        <h4 className="text-sm font-semibold text-ink mb-2">Stock and classification</h4>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Fact label="Available" value={formatNumber(m.availableQty, 1)} />
          <Fact label="Value" value={formatInr(m.valueInr)} title={formatInrFull(m.valueInr)} />
          <Fact label="Days on hand" value={formatNumber(m.daysOnHand, 0)} />
          <Fact label="Days since consumption" value={formatNumber(m.daysSinceLastConsumption, 0)} />
          <Fact label="Safety stock" value={formatNumber(m.safetyStockQty, 1)} />
          <Fact label="Reorder point" value={formatNumber(m.reorderPointQty, 1)} />
          <Fact label="Max stock" value={formatNumber(m.maxStockQty, 1)} />
          <Fact label="12-month demand" value={formatNumber(m.trailing12mDemandQty, 1)} />
          <Fact label="Status" value={m.inventoryStatus.replace('_', ' ')} />
          <Fact label="Movement" value={m.movementClass.replace('_', ' ')} />
          <Fact label="Criticality" value={m.criticality} />
          <Fact label="ABC / XYZ" value={`${m.abcClass} / ${m.xyzClass}`} />
        </dl>
      </section>
      <section aria-label="Reorder recommendation">
        <h4 className="text-sm font-semibold text-ink mb-2">Reorder recommendation</h4>
        {rec ? (
          <div className="grid gap-2 text-sm">
            <p className="flex flex-wrap items-center gap-2"><Badge tone={rec.priority === 'HIGH' ? 'bad' : rec.priority === 'MEDIUM' ? 'warn' : 'neutral'}>{rec.priority}</Badge><span className="num">PR by {rec.recommendedPrDate} · qty {formatNumber(rec.recommendedQty, 1)} · {formatInr(rec.estimatedValueInr)}</span>{rec.shutdownId && <Badge tone="info">Shutdown {rec.shutdownId}</Badge>}</p>
            <p className="text-muted">{rec.reason}</p>
          </div>
        ) : <p className="text-sm text-muted">No reorder recommendation for this material.</p>}
      </section>
      <section aria-label="Forecast and backtest">
        {!covered ? (
          <p className="text-sm text-muted rounded-md bg-surface-2 p-3">Forecast and backtest cover plant {FORECAST_PLANT} only; this material is held at {m.plantId}.</p>
        ) : fc.error || ho.error ? <ErrorState message={fc.error || ho.error || ''} onRetry={() => { fc.retry(); ho.retry(); }} /> : fc.data && ho.data ? <ForecastBlock m={m} fc={fc.data} ho={ho.data} /> : <Skeleton height="h-48" />}
      </section>
    </aside>
  );
}
