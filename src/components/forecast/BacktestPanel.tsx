import { useMemo } from 'react';
import { useCore } from '../../app/CoreData';
import { useFilters } from '../../app/FilterContext';
import { formatNumber, monthLabel } from '../../data/format';
import { backtestByMonth, wape } from '../../data/forecastSelectors';
import type { Holdout } from '../../data/types';
import { axisStyle, EChart } from '../charts/EChart';
import { Badge, Panel } from '../ui/Panel';

/** Always titled and badged as a backtest on held-out months; never called a forecast. */
export function BacktestPanel({ ho }: { ho: Holdout }) {
  const { filters } = useFilters();
  const { manifest } = useCore();
  const pts = useMemo(() => backtestByMonth(ho, filters.plant), [ho, filters.plant]);
  const total = pts.reduce((a, p) => ({ a: a.a + p.actual, p: a.p + p.predicted }), { a: 0, p: 0 });
  const w = wape(pts);
  return (
    <Panel
      title="Backtest: actual vs predicted on held-out months"
      badge={<Badge tone="warn">Backtest, not a forecast</Badge>}
      subtitle={`${ho.note} Months ${pts[0] ? monthLabel(pts[0].month) : '—'} to ${pts.at(-1) ? monthLabel(pts.at(-1)!.month) : '—'}, plant totals (HZL_DEMO_01).`}
    >
      {pts.length === 0 ? <p className="text-muted text-sm">The backtest covers HZL_DEMO_01 only; there is no backtest for {filters.plant}.</p> : (
        <>
          <EChart
            label="Backtest actual versus predicted by month"
            height={280}
            build={(c) => ({
              xAxis: { type: 'category', data: pts.map((p) => monthLabel(p.month)), ...axisStyle(c) },
              yAxis: { type: 'value', name: 'Net consumption (units)', nameTextStyle: { color: c.muted, align: 'left' }, ...axisStyle(c), axisLabel: { color: c.muted, formatter: (v: number) => formatNumber(v) } },
              tooltip: { trigger: 'axis', backgroundColor: c.surface, borderColor: c.border, textStyle: { color: c.text, fontSize: 12 }, valueFormatter: (v: unknown) => formatNumber(Number(v), 1) },
              series: [
                { name: 'Actual', type: 'line', data: pts.map((p) => p.actual), color: c.series[1], symbolSize: 6, lineStyle: { width: 2 } },
                { name: 'Predicted (backtest)', type: 'line', data: pts.map((p) => p.predicted), color: c.series[0], symbolSize: 6, lineStyle: { width: 2, type: 'dashed' } },
              ],
            })}
          />
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><dt className="text-xs text-muted">Backtest WAPE (model, all series)</dt><dd className="font-semibold num text-warning">{ho.error.wape.toFixed(3)}</dd></div>
            <div><dt className="text-xs text-muted">Backtest MAE (model, all series)</dt><dd className="font-semibold num">{formatNumber(ho.error.mae, 3)}</dd></div>
            <div><dt className="text-xs text-muted">Actual total, plant level</dt><dd className="font-semibold num">{formatNumber(total.a)}</dd></div>
            <div><dt className="text-xs text-muted">Predicted total, plant level</dt><dd className="font-semibold num">{formatNumber(total.p)}{total.a ? ` (${((total.p / total.a) * 100).toFixed(0)}% of actual)` : ''}</dd></div>
            {w != null && <div><dt className="text-xs text-muted">Plant-level WAPE (computed here)</dt><dd className="font-semibold num">{w.toFixed(3)}</dd></div>}
          </dl>
          <div>
            <h3 className="text-sm font-semibold text-ink mb-2">Leaderboard (validation {ho.metric.name})</h3>
            <ol className="grid gap-1 text-sm">
              {ho.leaderboard.map((m, i) => <li key={m.model} className="flex justify-between gap-3 border-b border-line py-1"><span>{i + 1}. {m.model}{m.model === manifest.forecast?.bestModel ? ' (best)' : ''}</span><span className="num">{formatNumber(m.metric, 3)}</span></li>)}
            </ol>
          </div>
        </>
      )}
    </Panel>
  );
}
