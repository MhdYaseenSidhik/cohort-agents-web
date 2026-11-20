import { formatInr, formatInrFull, formatNumber } from '../../data/format';
import type { Slice } from '../../data/inventorySelectors';
import { axisStyle, EChart } from '../charts/EChart';
import { Panel } from '../ui/Panel';

export function BreakdownChart({ title, slices, metric, onPick }: { title: string; slices: Slice[]; metric: 'value' | 'materials'; onPick?: (key: string) => void }) {
  const labels = slices.map((s) => s.key.replace(/_/g, ' '));
  const isValue = metric === 'value';
  return (
    <Panel title={title} subtitle={isValue ? 'Inventory value (INR)' : 'Material count'}>
      <EChart
        label={`${title} bar chart`}
        height={Math.max(180, slices.length * 34 + 40)}
        build={(c) => ({
          grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
          legend: { show: false },
          tooltip: {
            trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: c.surface, borderColor: c.border, textStyle: { color: c.text, fontSize: 12 },
            formatter: (p: unknown) => {
              const i = (p as { dataIndex: number }[])[0].dataIndex;
              const s = slices[i];
              return `<b>${labels[i]}</b><br/>${isValue ? formatInrFull(s.value) : formatNumber(s.materials)} · ${formatNumber(s.materials)} materials`;
            },
          },
          xAxis: { type: 'value', ...axisStyle(c), axisLabel: { color: c.muted, formatter: (v: number) => (isValue ? formatInr(v) : formatNumber(v)) } },
          yAxis: { type: 'category', inverse: true, data: labels, ...axisStyle(c), splitLine: { show: false } },
          series: [{
            type: 'bar', barMaxWidth: 18, itemStyle: { color: c.series[0], borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: 'right', color: c.muted, formatter: (p: { dataIndex: number }) => (isValue ? formatInr(slices[p.dataIndex].value) : formatNumber(slices[p.dataIndex].materials)) },
            data: slices.map((s) => (isValue ? s.value : s.materials)),
          }],
        })}
      />
      {onPick && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Drill into ${title}`}>
          {slices.slice(0, 6).map((s) => (
            <button key={s.key} type="button" className="btn" onClick={() => onPick(s.key)}>{s.key.replace(/_/g, ' ')}</button>
          ))}
        </div>
      )}
    </Panel>
  );
}
