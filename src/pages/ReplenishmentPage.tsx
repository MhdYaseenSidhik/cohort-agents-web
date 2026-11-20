import { useMemo, useState } from 'react';
import { useFilters } from '../app/FilterContext';
import { ReorderTable } from '../components/replenishment/ReorderTable';
import { Badge, PageHeader } from '../components/ui/Panel';
import { Segmented } from '../components/ui/Segmented';
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States';
import { formatInr, formatInrFull, formatNumber } from '../data/format';
import { filterReorder, reorderTotals, sortReorder } from '../data/inventorySelectors';
import { useDataset } from '../data/useDataset';

export function ReplenishmentPage() {
  const { filters, reset } = useFilters();
  const reo = useDataset('reorder');
  const [priority, setPriority] = useState('');
  const [shutdownOnly, setShutdownOnly] = useState(false);
  const rows = useMemo(() => (reo.data ? sortReorder(filterReorder(reo.data.rows, filters, { priority, shutdownOnly })) : []), [reo.data, filters, priority, shutdownOnly]);
  const t = useMemo(() => reorderTotals(rows), [rows]);
  return (
    <div className="grid gap-6">
      <PageHeader title="Replenishment" description="Reorder recommendations by priority with the recommended PR date, quantity, value and reason. Shutdown-linked recommendations carry their shutdown id." />
      <div className="card p-3 md:p-4 flex flex-wrap items-center gap-4">
        <Segmented label="Priority" value={priority} onChange={setPriority} options={[{ value: '', label: 'All' }, { value: 'HIGH', label: 'High' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'LOW', label: 'Low' }]} />
        <label className="inline-flex items-center gap-2 min-h-10 text-sm text-ink cursor-pointer">
          <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={shutdownOnly} onChange={(e) => setShutdownOnly(e.target.checked)} />
          Shutdown-linked only
        </label>
      </div>
      {reo.error ? <ErrorState message={reo.error} onRetry={reo.retry} /> : reo.loading ? <LoadingBlock /> : rows.length === 0 ? (
        <EmptyState title="No reorder recommendations match" action={<button type="button" className="btn" onClick={() => { reset(); setPriority(''); setShutdownOnly(false); }}>Reset filters</button>}>Widen the plant, type or priority selection.</EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Totals">
            <div className="card p-4"><p className="text-sm text-muted">Recommendations</p><p className="text-2xl font-semibold text-ink num">{formatNumber(t.count)}</p></div>
            <div className="card p-4"><p className="text-sm text-muted">Estimated value</p><p className="text-2xl font-semibold text-ink num" title={formatInrFull(t.value)}>{formatInr(t.value)}</p></div>
            {(['HIGH', 'MEDIUM'] as const).map((p) => (
              <div key={p} className="card p-4"><p className="text-sm text-muted flex items-center gap-2">{p === 'HIGH' ? 'High' : 'Medium'} priority <Badge tone={p === 'HIGH' ? 'bad' : 'warn'}>{p}</Badge></p><p className="text-2xl font-semibold text-ink num">{formatNumber(t.byPriority[p]?.count ?? 0)}</p><p className="text-xs text-muted num" title={formatInrFull(t.byPriority[p]?.value ?? 0)}>{formatInr(t.byPriority[p]?.value ?? 0)}</p></div>
            ))}
          </div>
          <ReorderTable rows={rows} />
        </>
      )}
    </div>
  );
}
