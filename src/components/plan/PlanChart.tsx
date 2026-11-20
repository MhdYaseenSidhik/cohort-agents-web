import { formatInr, formatInrFull, monthLabel } from '../../data/format';
import type { PlanAgg } from '../../data/inventorySelectors';
import { axisStyle, EChart } from '../charts/EChart';

export function PlanChart({ rows }: { rows: PlanAgg[] }) {
  return (
    <EChart
      label="Plan, PO and GR value by month"
      height={320}
      build={(c) => ({
        tooltip: { trigger: 'axis', backgroundColor: c.surface, borderColor: c.border, textStyle: { color: c.text, fontSize: 12 }, valueFormatter: (v: unknown) => formatInrFull(Number(v)) },
        xAxis: { type: 'category', data: rows.map((r) => monthLabel(r.key)), ...axisStyle(c) },
        yAxis: { type: 'value', ...axisStyle(c), axisLabel: { color: c.muted, formatter: (v: number) => formatInr(v) } },
        series: [
          { name: 'Plan', type: 'bar', data: rows.map((r) => r.plan), itemStyle: { color: c.series[0] } },
          { name: 'PO value', type: 'bar', data: rows.map((r) => r.po), itemStyle: { color: c.series[1] } },
          { name: 'GR value', type: 'bar', data: rows.map((r) => r.gr), itemStyle: { color: c.series[2] } },
        ],
      })}
    />
  );
}
