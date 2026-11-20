import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';
import { formatNumber } from '../../data/format';
import type { MaterialForecast } from '../../data/forecastSelectors';
import { EmptyState } from '../ui/States';

const GRID = '9rem 8.5rem 6rem minmax(10rem,1fr) 9rem';

export function MaterialForecastTable({ rows, horizon, selected, onSelect }: { rows: MaterialForecast[]; horizon: number; selected: string; onSelect: (id: string) => void }) {
  const [q, setQ] = useState('');
  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => r.materialId.toLowerCase().includes(s)) : rows;
  }, [rows, q]);
  const ref = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({ count: data.length, getScrollElement: () => ref.current, estimateSize: () => 44, overscan: 12 });
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search materials</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search material id" className="field w-full pl-9" />
        </label>
        <p className="text-sm text-muted num" aria-live="polite">{formatNumber(data.length)} materials · total over {horizon} months, sorted by predicted</p>
      </div>
      {data.length === 0 ? <EmptyState title="No forecast rows match">Clear the search or change the material type or group.</EmptyState> : (
        <div className="card overflow-hidden">
          <div ref={ref} className="overflow-auto max-h-[50vh]" tabIndex={0} aria-label="Forecast by material, scrollable">
            <div role="table" className="min-w-[40rem]" aria-rowcount={data.length}>
              <div role="row" className="grid sticky top-0 z-10 bg-surface-2 border-b border-line" style={{ gridTemplateColumns: GRID }}>
                {['Material', 'Plant', 'Type', 'Group', `Predicted (${horizon}m)`].map((h, i) => <div key={h} role="columnheader" className={`px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide ${i === 4 ? 'text-right' : ''}`}>{h}</div>)}
              </div>
              <div style={{ height: v.getTotalSize(), position: 'relative' }}>
                {v.getVirtualItems().map((vi) => {
                  const m = data[vi.index];
                  const on = m.materialId === selected;
                  return (
                    <div key={`${m.materialId}|${m.plantId}`} role="row" aria-rowindex={vi.index + 2} aria-selected={on} className={`grid items-center absolute left-0 w-full border-b border-line transition-colors ${on ? 'bg-accent-soft' : 'hover:bg-surface-2'}`} style={{ gridTemplateColumns: GRID, height: vi.size, transform: `translateY(${vi.start}px)` }}>
                      <div role="cell" className="px-3 text-sm num"><button type="button" className="text-accent hover:underline min-h-8" onClick={() => onSelect(m.materialId)} aria-label={`Show band for ${m.materialId}`}>{m.materialId}</button></div>
                      <div role="cell" className="px-3 text-sm num">{m.plantId}</div>
                      <div role="cell" className="px-3 text-sm">{m.materialType}</div>
                      <div role="cell" className="px-3 text-sm truncate">{m.materialGroup.replace(/_/g, ' ')}</div>
                      <div role="cell" className="px-3 text-sm num text-right">{formatNumber(m.predicted, 1)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
