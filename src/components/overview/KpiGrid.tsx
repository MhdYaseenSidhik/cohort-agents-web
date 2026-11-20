import { useMemo } from 'react';
import { useCore } from '../../app/CoreData';
import { useFilters } from '../../app/FilterContext';
import { OVERVIEW_KPIS, summarizeKpi } from '../../data/kpiSelectors';
import { KpiTile } from '../kpi/KpiTile';
import { EmptyState } from '../ui/States';

export function KpiGrid() {
  const { kpis } = useCore();
  const { filters } = useFilters();
  const tiles = useMemo(
    () => OVERVIEW_KPIS.map((c) => kpis.catalog.find((i) => i.code === c)).filter((i): i is NonNullable<typeof i> => Boolean(i)).map((i) => summarizeKpi(kpis.rows, i, filters.plant, filters.from, filters.to)),
    [kpis, filters.plant, filters.from, filters.to],
  );
  if (tiles.every((t) => t.latest == null)) return <EmptyState title="No KPI values in this month range">Widen the month range or reset the filters.</EmptyState>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {tiles.map((t) => <KpiTile key={t.item.code} s={t} />)}
    </div>
  );
}
