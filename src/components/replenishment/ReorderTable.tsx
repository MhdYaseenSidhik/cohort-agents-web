import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { formatInr, formatInrFull, formatNumber } from '../../data/format';
import type { ReorderRow } from '../../data/types';
import { Badge } from '../ui/Panel';

const GRID = '6.5rem 8.5rem 8rem 6.5rem 7rem 7rem minmax(18rem,1fr) 8rem';
const TONE: Record<string, 'bad' | 'warn' | 'neutral'> = { HIGH: 'bad', MEDIUM: 'warn', LOW: 'neutral' };

export function ReorderTable({ rows }: { rows: ReorderRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({ count: rows.length, getScrollElement: () => ref.current, estimateSize: () => 56, overscan: 10 });
  const heads = ['Priority', 'Material', 'Plant', 'PR date', 'Qty', 'Value', 'Reason', 'Shutdown'];
  return (
    <div className="card overflow-hidden">
      <div ref={ref} className="overflow-auto max-h-[65vh]" tabIndex={0} aria-label="Reorder recommendations, scrollable">
        <div role="table" className="min-w-[64rem]" aria-rowcount={rows.length}>
          <div role="row" className="grid sticky top-0 z-10 bg-surface-2 border-b border-line" style={{ gridTemplateColumns: GRID }}>
            {heads.map((h, i) => <div key={h} role="columnheader" className={`px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wide ${i === 4 || i === 5 ? 'text-right' : ''}`}>{h}</div>)}
          </div>
          <div style={{ height: v.getTotalSize(), position: 'relative' }}>
            {v.getVirtualItems().map((vi) => {
              const r = rows[vi.index];
              return (
                <div key={r.recommendationId} role="row" aria-rowindex={vi.index + 2} className="grid items-center absolute left-0 w-full border-b border-line hover:bg-surface-2 transition-colors" style={{ gridTemplateColumns: GRID, height: vi.size, transform: `translateY(${vi.start}px)` }}>
                  <div role="cell" className="px-3"><Badge tone={TONE[r.priority] ?? 'neutral'}>{r.priority}</Badge></div>
                  <div role="cell" className="px-3 text-sm num">{r.materialId}</div>
                  <div role="cell" className="px-3 text-sm num">{r.plantId}</div>
                  <div role="cell" className="px-3 text-sm num">{r.recommendedPrDate}</div>
                  <div role="cell" className="px-3 text-sm num text-right">{formatNumber(r.recommendedQty, 1)}</div>
                  <div role="cell" className="px-3 text-sm num text-right" title={formatInrFull(r.estimatedValueInr)}>{formatInr(r.estimatedValueInr)}</div>
                  <div role="cell" className="px-3 text-xs text-muted line-clamp-2" title={r.reason}>{r.reason}</div>
                  <div role="cell" className="px-3">{r.shutdownId ? <Badge tone="info">{r.shutdownId}</Badge> : <span className="text-faint text-sm">—</span>}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
