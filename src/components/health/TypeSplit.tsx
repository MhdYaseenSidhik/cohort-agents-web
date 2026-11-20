import { formatInr, formatInrFull, formatNumber } from '../../data/format';
import type { Slice } from '../../data/inventorySelectors';
import { Panel } from '../ui/Panel';

const COLORS = ['bg-[var(--series-1)]', 'bg-[var(--series-2)]'];

/** Material type split (ZSPR vs ZSPN) as two proportional bars with value and count. */
export function TypeSplit({ slices, onPick, active }: { slices: Slice[]; onPick: (k: string) => void; active: string }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <Panel title="By material type" subtitle="ZSPR (repairable spares) and ZSPN (non-repairable spares) share of inventory value. Select one to filter every screen.">
      <div className="flex h-3 rounded-sm overflow-hidden bg-surface-3" role="img" aria-label="Value share by material type">
        {slices.map((s, i) => <span key={s.key} className={COLORS[i % 2]} style={{ width: `${(s.value / total) * 100}%` }} />)}
      </div>
      <ul className="grid sm:grid-cols-2 gap-3">
        {slices.map((s, i) => {
          const on = active === s.key;
          return (
            <li key={s.key}>
              <button type="button" aria-pressed={on} onClick={() => onPick(on ? '' : s.key)} className={`w-full text-left rounded-md p-4 border transition-colors min-h-10 ${on ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2'}`}>
                <span className="flex items-center gap-2 text-sm font-semibold text-ink"><span className={`size-3 rounded-sm ${COLORS[i % 2]}`} aria-hidden="true" />{s.key}</span>
                <span className="block text-2xl font-semibold text-ink num mt-1" title={formatInrFull(s.value)}>{formatInr(s.value)}</span>
                <span className="block text-xs text-muted num">{formatNumber(s.materials)} materials · {((s.value / total) * 100).toFixed(1)}% of value</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
