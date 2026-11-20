import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { formatInr, formatInrFull, formatNumber } from '../../data/format';
import type { MaterialRow } from '../../data/types';
import { Badge } from '../ui/Panel';
import { EmptyState } from '../ui/States';

type Key = 'materialId' | 'description' | 'inventoryStatus' | 'criticality' | 'availableQty' | 'valueInr' | 'daysOnHand';
const COLS: { key: Key; label: string; num?: boolean; w: string }[] = [
  { key: 'materialId', label: 'Material', w: '9rem' },
  { key: 'description', label: 'Description', w: '1fr' },
  { key: 'inventoryStatus', label: 'Status', w: '10rem' },
  { key: 'criticality', label: 'Criticality', w: '7rem' },
  { key: 'availableQty', label: 'Available', num: true, w: '6rem' },
  { key: 'valueInr', label: 'Value', num: true, w: '7rem' },
  { key: 'daysOnHand', label: 'Days on hand', num: true, w: '7rem' },
];
const GRID = COLS.map((c) => c.w.includes('fr') ? 'minmax(12rem,1fr)' : c.w).join(' ');
const STATUS_TONE: Record<string, 'bad' | 'warn' | 'neutral' | 'good'> = { STOCKOUT: 'bad', CRITICAL_SHORTAGE: 'bad', UNDERSTOCK: 'warn', EXCESS: 'warn', NON_MOVING: 'neutral', OBSOLETE: 'neutral', SLOW_MOVING: 'neutral', NORMAL: 'good' };

/** Virtualised material table: only visible rows are in the DOM. */
export function MaterialList({ rows, onOpen }: { rows: MaterialRow[]; onOpen: (m: MaterialRow) => void }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: Key; asc: boolean }>({ key: 'valueInr', asc: false });
  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = s ? rows.filter((r) => r.materialId.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)) : rows;
    const dir = sort.asc ? 1 : -1;
    return [...f].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
    });
  }, [rows, q, sort]);
  const ref = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({ count: data.length, getScrollElement: () => ref.current, estimateSize: () => 44, overscan: 12 });

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative block w-full sm:w-80">
          <span className="sr-only">Search materials</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search material id or description" className="field w-full pl-9" />
        </label>
        <p className="text-sm text-muted num" aria-live="polite">{formatNumber(data.length)} of {formatNumber(rows.length)} materials</p>
      </div>
      {data.length === 0 ? <EmptyState title="No materials match">Clear the search or reset the filters.</EmptyState> : (
        <div className="card overflow-hidden">
          <div ref={ref} className="overflow-auto max-h-[60vh]" tabIndex={0} aria-label="Material list, scrollable">
            <div className="min-w-[56rem]" role="table" aria-rowcount={data.length}>
              <div role="row" className="grid sticky top-0 z-10 bg-surface-2 border-b border-line" style={{ gridTemplateColumns: GRID }}>
                {COLS.map((c) => (
                  <div role="columnheader" key={c.key} aria-sort={sort.key === c.key ? (sort.asc ? 'ascending' : 'descending') : 'none'} className={`px-3 py-2 ${c.num ? 'text-right' : ''}`}>
                    <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-muted uppercase tracking-wide min-h-8" onClick={() => setSort((s) => ({ key: c.key, asc: s.key === c.key ? !s.asc : true }))}>
                      {c.label}{sort.key === c.key && (sort.asc ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />)}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ height: v.getTotalSize(), position: 'relative' }}>
                {v.getVirtualItems().map((vi) => {
                  const m = data[vi.index];
                  return (
                    <div key={`${m.materialId}|${m.plantId}`} role="row" aria-rowindex={vi.index + 2} className="grid items-center absolute left-0 w-full border-b border-line hover:bg-surface-2 transition-colors cursor-pointer" style={{ gridTemplateColumns: GRID, height: vi.size, transform: `translateY(${vi.start}px)` }} onClick={() => onOpen(m)}>
                      <div role="cell" className="px-3 text-sm num"><button type="button" className="text-accent hover:underline min-h-8" onClick={(e) => { e.stopPropagation(); onOpen(m); }}>{m.materialId}</button></div>
                      <div role="cell" className="px-3 text-sm truncate" title={m.description}>{m.description}</div>
                      <div role="cell" className="px-3"><Badge tone={STATUS_TONE[m.inventoryStatus] ?? 'neutral'}>{m.inventoryStatus.replace('_', ' ')}</Badge></div>
                      <div role="cell" className="px-3 text-sm">{m.criticality}</div>
                      <div role="cell" className="px-3 text-sm text-right num">{formatNumber(m.availableQty, 1)}</div>
                      <div role="cell" className="px-3 text-sm text-right num" title={formatInrFull(m.valueInr)}>{formatInr(m.valueInr)}</div>
                      <div role="cell" className="px-3 text-sm text-right num">{formatNumber(m.daysOnHand, 0)}</div>
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
