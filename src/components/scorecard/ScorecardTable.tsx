import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useCore } from '../../app/CoreData';
import { useFilters } from '../../app/FilterContext';
import { formatKpi, formatKpiFull, monthLabel } from '../../data/format';
import { summarizeKpi } from '../../data/kpiSelectors';
import { ChangeChip } from '../kpi/ChangeChip';
import { Sparkline } from '../kpi/Sparkline';
import { Badge } from '../ui/Panel';

type SortKey = 'label' | 'change';
const DIR_LABEL = { higher_is_better: 'Higher is better', lower_is_better: 'Lower is better', neutral: 'Neutral' } as const;

export function ScorecardTable() {
  const { kpis } = useCore();
  const { filters } = useFilters();
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'label', asc: true });
  const rows = useMemo(() => {
    const r = kpis.catalog.map((i) => summarizeKpi(kpis.rows, i, filters.plant, filters.from, filters.to));
    const dir = sort.asc ? 1 : -1;
    return r.sort((a, b) => (sort.key === 'label' ? a.item.label.localeCompare(b.item.label) || a.item.code.localeCompare(b.item.code) : (a.change ?? -Infinity) - (b.change ?? -Infinity)) * dir);
  }, [kpis, filters.plant, filters.from, filters.to, sort]);

  const head = (key: SortKey, label: string) => (
    <button type="button" className="inline-flex items-center gap-1 uppercase tracking-wide font-semibold min-h-10 md:min-h-8" onClick={() => setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }))}>
      {label}{sort.key === key && (sort.asc ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />)}
    </button>
  );

  return (
    <div className="card overflow-hidden">
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full min-w-[960px] border-separate border-spacing-0">
          <caption className="sr-only">KPI scorecard</caption>
          <thead>
            <tr>
              <th className="th" scope="col" aria-sort={sort.key === 'label' ? (sort.asc ? 'ascending' : 'descending') : 'none'}>{head('label', 'KPI')}</th>
              <th className="th text-right" scope="col">Latest</th>
              <th className="th" scope="col">Trend</th>
              <th className="th" scope="col" aria-sort={sort.key === 'change' ? (sort.asc ? 'ascending' : 'descending') : 'none'}>{head('change', 'vs prior month')}</th>
              <th className="th" scope="col">vs same month last year</th>
              <th className="th" scope="col">Direction</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.item.code} className="hover:bg-surface-2 transition-colors">
                <td className="td max-w-[22rem]">
                  <p className="font-medium text-ink">{s.item.label}</p>
                  <p className="text-xs text-muted">{s.item.definition}</p>
                  <p className="text-xs text-faint num">Unit {s.item.uom} · {s.scenario ?? '—'}{s.latestMonth ? ` · ${monthLabel(s.latestMonth)}` : ''}</p>
                </td>
                <td className="td text-right num font-semibold text-ink" title={s.latest != null ? formatKpiFull(s.latest, s.item.uom) : undefined}>{s.latest != null ? formatKpi(s.latest, s.item.uom) : '—'}</td>
                <td className="td w-40"><Sparkline points={s.series} label={`${s.item.label} trend`} /></td>
                <td className="td"><ChangeChip change={s.change} tone={s.tone} uom={s.item.uom} suffix="prior month" /></td>
                <td className="td"><ChangeChip change={s.changeYoY} tone={s.toneYoY} uom={s.item.uom} suffix="last year" /></td>
                <td className="td"><Badge tone={s.item.direction === 'neutral' ? 'neutral' : 'info'}>{DIR_LABEL[s.item.direction]}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
