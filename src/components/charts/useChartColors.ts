import { useEffect, useState } from 'react';

export interface ChartColors {
  text: string; muted: string; border: string; surface: string; accent: string; band: string;
  success: string; warning: string; danger: string; series: string[];
}

function read(): ChartColors {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return {
    text: v('--color-text'), muted: v('--color-text-muted'), border: v('--color-border'), surface: v('--color-surface'),
    accent: v('--color-accent'), band: v('--band'), success: v('--color-success'), warning: v('--color-warning'), danger: v('--color-danger'),
    series: [1, 2, 3, 4, 5, 6].map((i) => v(`--series-${i}`)),
  };
}

/** Resolved token colours for ECharts; re-read when the theme attribute or system scheme changes. */
export function useChartColors(): ChartColors {
  const [c, setC] = useState<ChartColors>(read);
  useEffect(() => {
    const update = () => setC(read());
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', update);
    return () => {
      mo.disconnect();
      mq.removeEventListener?.('change', update);
    };
  }, []);
  return c;
}
