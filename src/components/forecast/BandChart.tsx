import { formatNumber, monthLabel } from '../../data/format';
import type { ForecastRow } from '../../data/types';
import { axisStyle, EChart } from '../charts/EChart';

/** Forecast for one series: solid mean with its lower-upper (0.1-0.9) band. */
export function BandChart({ rows, label, height = 260 }: { rows: ForecastRow[]; label: string; height?: number }) {
  const lower = rows.map((r) => r.lower);
  const widths = rows.map((r) => (r.lower != null && r.upper != null ? r.upper - r.lower : null));
  return (
    <EChart
      label={label}
      height={height}
      build={(c) => ({
        legend: { top: 0, textStyle: { color: c.muted }, data: ['Forecast (mean)', 'Band 0.1–0.9'] },
        tooltip: {
          trigger: 'axis', backgroundColor: c.surface, borderColor: c.border, textStyle: { color: c.text, fontSize: 12 },
          formatter: (p: unknown) => {
            const i = (p as { dataIndex: number }[])[0].dataIndex;
            const r = rows[i];
            return `<b>${monthLabel(r.month)}</b> · horizon ${r.horizon}<br/>Forecast ${formatNumber(r.predicted, 1)}<br/>Band ${formatNumber(r.lower, 1)} to ${formatNumber(r.upper, 1)}`;
          },
        },
        xAxis: { type: 'category', data: rows.map((r) => monthLabel(r.month)), boundaryGap: false, ...axisStyle(c) },
        yAxis: { type: 'value', ...axisStyle(c), axisLabel: { color: c.muted, formatter: (v: number) => formatNumber(v, 1) } },
        series: [
          { name: 'Band lower', type: 'line', data: lower, stack: 'band', symbol: 'none', lineStyle: { opacity: 0 }, tooltip: { show: false }, silent: true },
          { name: 'Band 0.1–0.9', type: 'line', data: widths, stack: 'band', symbol: 'none', lineStyle: { opacity: 0 }, areaStyle: { color: c.band }, silent: true },
          { name: 'Forecast (mean)', type: 'line', data: rows.map((r) => r.predicted), color: c.series[0], symbolSize: 6, lineStyle: { width: 2 } },
        ],
      })}
    />
  );
}
