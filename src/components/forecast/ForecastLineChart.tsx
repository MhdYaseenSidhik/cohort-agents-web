import { formatNumber, monthLabel } from '../../data/format';
import type { MonthPoint } from '../../data/forecastSelectors';
import { axisStyle, EChart } from '../charts/EChart';

/** Forecast by month. series = one line per name. byPlantMonth has no band, so none is drawn here. */
export function ForecastLineChart({ series, label }: { series: { name: string; points: MonthPoint[] }[]; label: string }) {
  const months = [...new Set(series.flatMap((s) => s.points.map((p) => p.month)))].sort();
  return (
    <EChart
      label={label}
      height={280}
      build={(c) => ({
        xAxis: { type: 'category', data: months.map(monthLabel), boundaryGap: false, ...axisStyle(c) },
        yAxis: { type: 'value', name: 'Net consumption (units)', nameTextStyle: { color: c.muted, align: 'left' }, ...axisStyle(c), axisLabel: { color: c.muted, formatter: (v: number) => formatNumber(v) } },
        tooltip: { trigger: 'axis', backgroundColor: c.surface, borderColor: c.border, textStyle: { color: c.text, fontSize: 12 }, valueFormatter: (v: unknown) => formatNumber(Number(v), 1) },
        series: series.map((s, i) => ({
          name: s.name, type: 'line', symbolSize: 6, color: c.series[i % c.series.length], lineStyle: { width: 2 },
          data: months.map((m) => s.points.find((p) => p.month === m)?.predicted ?? null),
        })),
      })}
    />
  );
}
