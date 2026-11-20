import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useFilters } from '../../app/FilterContext';
import { formatInr, formatInrFull, formatNumber } from '../../data/format';
import { highPriorityReorders, vitalStockouts } from '../../data/inventorySelectors';
import { useDataset } from '../../data/useDataset';
import { Badge, Panel } from '../ui/Panel';
import { EmptyState, ErrorState, Skeleton } from '../ui/States';

export function AlertsPanel() {
  const { filters, go } = useFilters();
  const mats = useDataset('materials');
  const reo = useDataset('reorder');
  const stock = useMemo(() => (mats.data ? vitalStockouts(mats.data.rows, filters) : []), [mats.data, filters]);
  const high = useMemo(() => (reo.data ? highPriorityReorders(reo.data.rows, filters) : []), [reo.data, filters]);
  const err = mats.error || reo.error;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Panel title="VITAL spares out of stock" subtitle="Stockout or critical shortage, ordered by trailing 12-month demand." badge={<Badge tone="bad">Top alerts</Badge>}>
        {err ? <ErrorState message={err} onRetry={() => { mats.retry(); reo.retry(); }} /> : mats.loading ? <Skeleton height="h-48" /> : stock.length === 0 ? (
          <EmptyState title="No VITAL stockouts match these filters">Change plant, type or group to see more.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {stock.map((m) => (
              <li key={`${m.materialId}|${m.plantId}`} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{m.description}</p>
                  <p className="text-xs text-muted num">{m.materialId} · {m.plantId} · {m.materialType}</p>
                </div>
                <Badge tone="bad">{m.inventoryStatus.replace('_', ' ')}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel
        title="High-priority reorders"
        subtitle="Largest estimated value first."
        actions={<button type="button" className="btn" onClick={() => go('replenishment')}>All replenishment <ArrowRight size={16} aria-hidden="true" /></button>}
      >
        {err ? null : reo.loading ? <Skeleton height="h-48" /> : high.length === 0 ? (
          <EmptyState title="No high-priority reorders match these filters" />
        ) : (
          <ul className="divide-y divide-line">
            {high.map((r) => (
              <li key={r.recommendationId} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate num">{r.materialId} · {r.plantId}</p>
                  <p className="text-xs text-muted num">PR by {r.recommendedPrDate} · qty {formatNumber(r.recommendedQty, 1)}{r.shutdownId ? ' · shutdown-linked' : ''}</p>
                </div>
                <span className="num font-semibold text-ink" title={formatInrFull(r.estimatedValueInr)}>{formatInr(r.estimatedValueInr)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
