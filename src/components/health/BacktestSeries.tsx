import { formatNumber, monthLabel } from '../../data/format';
import type { HoldoutRow } from '../../data/types';
import { axisStyle, EChart } from '../charts/EChart';

/** Actual vs predicted on held-out months. Dashed prediction, titled as a backtest by the caller. */
export function BacktestSeries({ rows, label }: { rows: HoldoutRow[]; label: string }) {
  return (
    <EChart
      label={label}
      height={220}
      build={(c) => ({
        xAxis: { type: 'category', data: rows.map((r) => monthLabel(r.month)), ...axisStyle(c) },
        yAxis: { type: 'value', ...axisStyle(c), axisLabel: { color: c.muted, formatter: (v: number) => formatNumber(v, 1) } },
        series: [
          { name: 'Actual (backtest)', type: 'line', data: rows.map((r) => r.actual), color: c.series[1], symbolSize: 5 },
          { name: 'Predicted (backtest)', type: 'line', data: rows.map((r) => r.predicted), color: c.series[0], lineStyle: { type: 'dashed' }, symbolSize: 5 },
        ],
      })}
    />
  );
}
