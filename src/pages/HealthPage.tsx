import { useMemo, useState } from 'react';
import { useFilters } from '../app/FilterContext';
import { Breadcrumb } from '../components/health/Breadcrumb';
import { BreakdownChart } from '../components/health/BreakdownChart';
import { GroupTable } from '../components/health/GroupTable';
import { MaterialDetail } from '../components/health/MaterialDetail';
import { MaterialList } from '../components/health/MaterialList';
import { TypeSplit } from '../components/health/TypeSplit';
import { PageHeader, Panel } from '../components/ui/Panel';
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../components/ui/States';
import { filterMaterials, filterSummary, sumBy } from '../data/inventorySelectors';
import { ALL_PLANTS, type MaterialRow } from '../data/types';
import { useDataset } from '../data/useDataset';

function Drill() {
  const { filters, setFilters } = useFilters();
  const summary = useDataset('inventory_summary');
  const mats = useDataset('materials');
  const reo = useDataset('reorder');
  const [open, setOpen] = useState<MaterialRow | null>(null);
  const rows = useMemo(() => (summary.data ? filterSummary(summary.data.rows, filters) : []), [summary.data, filters]);
  const level = filters.plant === ALL_PLANTS ? 'plant' : filters.group ? 'material' : 'group';
  const list = useMemo(() => (mats.data && level === 'material' ? filterMaterials(mats.data.rows, filters) : []), [mats.data, filters, level]);

  const crumbs = [
    { label: 'All plants', onClick: level !== 'plant' ? () => { setFilters({ plant: ALL_PLANTS, group: '' }); setOpen(null); } : undefined },
    ...(level !== 'plant' ? [{ label: filters.plant, onClick: level === 'material' ? () => { setFilters({ group: '' }); setOpen(null); } : undefined }] : []),
    ...(level === 'material' ? [{ label: filters.group.replace(/_/g, ' ') }] : []),
  ];
  const title = level === 'plant' ? 'Plants' : 'Material groups';
  const slices = level === 'plant' ? sumBy(rows, 'plantId') : sumBy(rows, 'materialGroup');

  return (
    <Panel title="Drill-down" subtitle="Plant, then material group, then material list, then material detail. The path is kept in the URL filters.">
      <Breadcrumb items={crumbs} />
      {summary.error ? <ErrorState message={summary.error} onRetry={summary.retry} /> : summary.loading ? <Skeleton height="h-48" /> : level === 'material' ? (
        mats.error ? <ErrorState message={mats.error} onRetry={mats.retry} /> : mats.loading ? <Skeleton height="h-72" /> : (
          <>
            <MaterialList rows={list} onOpen={setOpen} />
            {open && <MaterialDetail m={open} reorder={reo.data?.rows ?? []} onClose={() => setOpen(null)} />}
          </>
        )
      ) : (
        <GroupTable title={title} slices={slices} onPick={(k) => { if (level === 'plant') setFilters({ plant: k }); else setFilters({ group: k }); }} />
      )}
    </Panel>
  );
}

export function HealthPage() {
  const { filters, setFilters } = useFilters();
  const summary = useDataset('inventory_summary');
  const rows = useMemo(() => (summary.data ? filterSummary(summary.data.rows, filters) : []), [summary.data, filters]);
  const metric = 'value' as const;
  return (
    <div className="grid gap-6">
      <PageHeader title="Inventory health" description="Value and material counts by material type, movement class, inventory status, criticality and ABC class, then drill from plant to material. With All plants these are sums of the real plants." />
      {summary.error ? <ErrorState message={summary.error} onRetry={summary.retry} /> : summary.loading ? <LoadingBlock /> : rows.length === 0 ? (
        <EmptyState title="No inventory matches these filters" action={<button type="button" className="btn" onClick={() => setFilters({ type: '', group: '', crit: '' })}>Clear type, group and criticality</button>}>Try a different plant or clear the material filters.</EmptyState>
      ) : (
        <>
          <TypeSplit slices={sumBy(rows, 'materialType')} active={filters.type} onPick={(k) => setFilters({ type: k })} />
          <div className="grid lg:grid-cols-2 gap-4">
            <BreakdownChart title="By movement class" slices={sumBy(rows, 'movementClass')} metric={metric} />
            <BreakdownChart title="By inventory status" slices={sumBy(rows, 'inventoryStatus')} metric={metric} />
            <BreakdownChart title="By criticality" slices={sumBy(rows, 'criticality')} metric={metric} onPick={(k) => setFilters({ crit: filters.crit === k ? '' : k })} />
            <BreakdownChart title="By ABC class" slices={sumBy(rows, 'abcClass')} metric={metric} />
          </div>
        </>
      )}
      <Drill />
    </div>
  );
}
