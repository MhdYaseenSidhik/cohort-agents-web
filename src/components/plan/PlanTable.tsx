import { formatInr, formatInrFull, formatPct } from '../../data/format';
import { variancePct, type PlanAgg } from '../../data/inventorySelectors';

export function PlanTable({ title, rows }: { title: string; rows: PlanAgg[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-auto max-h-[50vh]">
        <table className="w-full min-w-[34rem] border-separate border-spacing-0">
          <caption className="sr-only">{title}</caption>
          <thead><tr>{[title, 'Plan', 'PO value', 'GR value', 'Variance', 'Variance %'].map((h, i) => <th key={h} scope="col" className={`th ${i ? 'text-right' : ''}`}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const p = variancePct(r);
              return (
                <tr key={r.key} className="hover:bg-surface-2 transition-colors">
                  <td className="td font-medium text-ink">{r.key.replace(/_/g, ' ')}</td>
                  <td className="td text-right num" title={formatInrFull(r.plan)}>{formatInr(r.plan)}</td>
                  <td className="td text-right num" title={formatInrFull(r.po)}>{formatInr(r.po)}</td>
                  <td className="td text-right num" title={formatInrFull(r.gr)}>{formatInr(r.gr)}</td>
                  <td className="td text-right num" title={formatInrFull(r.variance)}>{formatInr(r.variance)}</td>
                  <td className="td text-right num">{p == null ? '—' : formatPct(p)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
