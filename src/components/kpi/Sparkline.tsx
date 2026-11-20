import type { KpiSeriesPoint } from '../../data/kpiSelectors';

/** Tiny inline trend. Colours come from currentColor so the tile decides. */
export function Sparkline({ points, label }: { points: KpiSeriesPoint[]; label: string }) {
  if (points.length < 2) return <p className="text-xs text-faint h-8 flex items-center">Single month, no trend</p>;
  const w = 120;
  const h = 32;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${((i / (points.length - 1)) * w).toFixed(1)},${(h - 2 - ((p.value - min) / span) * (h - 4)).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 text-accent" role="img" aria-label={label} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
