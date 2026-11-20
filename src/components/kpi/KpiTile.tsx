import { useCore } from '../../app/CoreData';
import { formatKpi, formatKpiFull, monthLabel } from '../../data/format';
import type { KpiSummary } from '../../data/kpiSelectors';
import { ChangeChip } from './ChangeChip';
import { Sparkline } from './Sparkline';

export function KpiTile({ s }: { s: KpiSummary }) {
  const { manifest } = useCore();
  const { item } = s;
  return (
    <article className="card p-4 grid gap-3 min-w-0" aria-label={item.label}>
      <header className="grid gap-1">
        <h3 className="text-sm font-medium text-muted" title={item.definition}>{item.label}</h3>
        <p className="text-2xl font-semibold text-ink num truncate" title={s.latest != null ? formatKpiFull(s.latest, item.uom) : undefined}>
          {s.latest != null ? formatKpi(s.latest, item.uom) : '—'}
        </p>
      </header>
      <Sparkline points={s.series} label={`${item.label} trend`} />
      <ChangeChip change={s.change} tone={s.tone} uom={item.uom} suffix="vs prior month" />
      <p className="text-xs text-faint leading-snug">{item.definition}</p>
      <p className="text-xs text-faint num">Unit {item.uom} · {s.latestMonth ? monthLabel(s.latestMonth) : 'no data'} · as of {manifest.asOf}</p>
    </article>
  );
}
