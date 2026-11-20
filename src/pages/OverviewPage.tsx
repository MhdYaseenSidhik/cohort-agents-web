import { useFilters } from '../app/FilterContext';
import { KpiGrid } from '../components/overview/KpiGrid';
import { AlertsPanel } from '../components/overview/AlertsPanel';
import { KpiNotFiltered } from '../components/shell/NotFiltered';
import { PageHeader } from '../components/ui/Panel';
import { ALL_PLANTS } from '../data/types';

export function OverviewPage() {
  const { filters } = useFilters();
  return (
    <div className="grid gap-6">
      <PageHeader title="Overview" description={`Inventory position and the biggest risks. KPIs shown for ${filters.plant === ALL_PLANTS ? 'all plants (the source portfolio values, never a sum of plants)' : filters.plant}.`} />
      <KpiNotFiltered />
      <KpiGrid />
      <AlertsPanel />
    </div>
  );
}
