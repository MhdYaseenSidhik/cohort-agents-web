import { useFilters } from '../app/FilterContext';
import { ScorecardTable } from '../components/scorecard/ScorecardTable';
import { KpiNotFiltered } from '../components/shell/NotFiltered';
import { PageHeader } from '../components/ui/Panel';
import { ALL_PLANTS } from '../data/types';

export function ScorecardPage() {
  const { filters } = useFilters();
  return (
    <div className="grid gap-6">
      <PageHeader title="KPI scorecard" description={`Every KPI in the catalog for ${filters.plant === ALL_PLANTS ? 'all plants (source portfolio rows)' : filters.plant}: latest value, trend, change versus the prior month and the same month last year. Green means better and red means worse, judged by each KPI's direction; neutral KPIs are grey.`} />
      <KpiNotFiltered />
      <ScorecardTable />
    </div>
  );
}
