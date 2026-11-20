import { formatNumber } from '../../data/format';
import { axisStyle, EChart } from '../charts/EChart';

export function GroupBars({ rows }: { rows: { key: string; predicted: number }[] }) {
  return (
    <EChart
      label="Forecast by material group"
      height={Math.max(200, rows.length * 32 + 40)}
      build={(c) => ({
        grid: { left: 8, right: 64, top: 8, bottom: 8, containLabel: true },
        legend: { show: false },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: c.surface, borderColor: c.border, textStyle: { color: c.text, fontSize: 12 }, valueFormatter: (v: unknown) => `${formatNumber(Number(v), 1)} units` },
        xAxis: { type: 'value', ...axisStyle(c), axisLabel: { color: c.muted, formatter: (v: number) => formatNumber(v) } },
        yAxis: { type: 'category', inverse: true, data: rows.map((r) => r.key.replace(/_/g, ' ')), ...axisStyle(c), splitLine: { show: false } },
        series: [{ type: 'bar', barMaxWidth: 16, itemStyle: { color: c.series[0], borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: c.muted, formatter: (p: { dataIndex: number }) => formatNumber(rows[p.dataIndex].predicted) }, data: rows.map((r) => r.predicted) }],
      })}
    />
  );
}
