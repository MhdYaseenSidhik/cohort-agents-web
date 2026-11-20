import { Filter } from 'lucide-react';
import { useFilters } from '../../app/FilterContext';
import { hasDimFilter } from '../../data/filters';

/** KPIs exist per plant only: say so plainly when a type, group or criticality filter is set. */
export function KpiNotFiltered() {
  const { filters } = useFilters();
  if (!hasDimFilter(filters)) return null;
  const parts = [filters.type && `material type ${filters.type}`, filters.group && `group ${filters.group}`, filters.crit && `criticality ${filters.crit}`].filter(Boolean).join(', ');
  return (
    <div role="note" className="flex gap-3 items-start rounded-md bg-warning-soft text-warning px-4 py-3 text-sm">
      <Filter size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p>KPI values are published per plant only, so they are <strong className="font-semibold">not filtered by {parts}</strong>. They show the plant selection above. Charts and tables that carry these dimensions are filtered.</p>
    </div>
  );
}
