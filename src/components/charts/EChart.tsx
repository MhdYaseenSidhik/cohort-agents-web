import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, MarkAreaComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { useChartColors } from './useChartColors';

echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, MarkAreaComponent, CanvasRenderer]);

/** Shared ECharts shell. `build` receives the resolved token colours so charts follow the theme. */
export function EChart({ build, height = 288, label }: { build: (c: ReturnType<typeof useChartColors>) => EChartsOption; height?: number; label: string }) {
  const c = useChartColors();
  const base: EChartsOption = {
    textStyle: { color: c.muted, fontFamily: 'inherit', fontSize: 12 },
    color: c.series,
    animationDuration: 180,
    grid: { left: 8, right: 16, top: 32, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis', backgroundColor: c.surface, borderColor: c.border, textStyle: { color: c.text, fontSize: 12 } },
    legend: { top: 0, textStyle: { color: c.muted }, itemWidth: 12, itemHeight: 8 },
  };
  const option = { ...base, ...build(c) };
  return (
    <div role="img" aria-label={label} style={{ height }} className="w-full min-w-0">
      <ReactEChartsCore echarts={echarts} option={option} notMerge style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </div>
  );
}

export const axisStyle = (c: ReturnType<typeof useChartColors>) => ({
  axisLine: { lineStyle: { color: c.border } },
  axisLabel: { color: c.muted },
  splitLine: { lineStyle: { color: c.border, opacity: 0.6 } },
});
