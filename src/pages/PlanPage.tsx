import { useMemo } from 'react';
import { useFilters } from '../app/FilterContext';
import { PlanChart } from '../components/plan/PlanChart';
import { PlanTable } from '../components/plan/PlanTable';
import { PageHeader, Panel } from '../components/ui/Panel';
import { EmptyState, ErrorState, LoadingBlock } from '../components/ui/States';
import { filterPlan, planBy } from '../data/inventorySelectors';
import { useDataset } from '../data/useDataset';

export function PlanPage() {
  const { filters, reset } = useFilters();
  const plan = useDataset('plan_vs_actual');
  const rows = useMemo(() => (plan.data ? filterPlan(plan.data.rows, filters) : []), [plan.data, filters]);
  return (
    <div className="grid gap-6">
      <PageHeader title="Plan versus actual" description="Plan, PO and goods-receipt value and the variance, by month, plant and material group. Data starts January 2024. With All plants the values are sums of the real plants. Criticality is not a dimension of this file, so that filter does not apply." />
      {plan.error ? <ErrorState message={plan.error} onRetry={plan.retry} /> : plan.loading ? <LoadingBlock /> : rows.length === 0 ? (
        <EmptyState title="No plan data matches these filters" action={<button type="button" className="btn" onClick={reset}>Reset filters</button>}>Plan-versus-actual covers 2024-01 to 2025-12.</EmptyState>
      ) : (
        <>
          <Panel title="By month" subtitle="Plan, PO and GR value (INR)."><PlanChart rows={planBy(rows, 'month')} /></Panel>
          <div className="grid xl:grid-cols-2 gap-4">
            <Panel title="By plant"><PlanTable title="Plant" rows={planBy(rows, 'plantId')} /></Panel>
            <Panel title="By material group"><PlanTable title="Material group" rows={planBy(rows, 'materialGroup')} /></Panel>
          </div>
          <Panel title="By month (table)"><PlanTable title="Month" rows={planBy(rows, 'month')} /></Panel>
        </>
      )}
    </div>
  );
}
