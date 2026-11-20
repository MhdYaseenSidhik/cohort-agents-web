import { ChevronRight } from 'lucide-react';
import { formatInr, formatInrFull, formatNumber } from '../../data/format';
import type { Slice } from '../../data/inventorySelectors';
import { EmptyState } from '../ui/States';

/** Drill level: plants, or material groups within a plant. */
export function GroupTable({ title, slices, onPick }: { title: string; slices: Slice[]; onPick: (key: string) => void }) {
  if (slices.length === 0) return <EmptyState title="Nothing matches these filters">Reset the filters to see the full inventory.</EmptyState>;
  return (
    <div className="card overflow-hidden">
      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full border-separate border-spacing-0">
          <caption className="sr-only">{title}</caption>
          <thead><tr><th className="th" scope="col">{title}</th><th className="th text-right" scope="col">Value</th><th className="th text-right" scope="col">Materials</th><th className="th" scope="col"><span className="sr-only">Open</span></th></tr></thead>
          <tbody>
            {slices.map((s) => (
              <tr key={s.key} className="hover:bg-surface-2 transition-colors">
                <td className="td font-medium text-ink">{s.key.replace(/_/g, ' ')}</td>
                <td className="td text-right num" title={formatInrFull(s.value)}>{formatInr(s.value)}</td>
                <td className="td text-right num">{formatNumber(s.materials)}</td>
                <td className="td w-24 text-right"><button type="button" className="btn" onClick={() => onPick(s.key)} aria-label={`Open ${s.key}`}>Open <ChevronRight size={16} aria-hidden="true" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
