import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatDelta } from '../../data/format';
import type { Tone } from '../../data/kpiSelectors';

const TONE: Record<Tone, string> = { good: 'text-success bg-success-soft', bad: 'text-danger bg-danger-soft', neutral: 'text-muted bg-surface-3' };

export function ChangeChip({ change, tone, uom, suffix }: { change: number | null; tone: Tone; uom: string; suffix: string }) {
  if (change == null) return <span className="chip bg-surface-3 text-faint">No {suffix.replace(/^vs /, '')}</span>;
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  const word = tone === 'good' ? 'improved' : tone === 'bad' ? 'worsened' : 'changed';
  return (
    <span className={`chip num ${TONE[tone]}`} title={`${word} ${suffix}`}>
      <Icon size={14} aria-hidden="true" />
      {formatDelta(change, uom)} <span className="font-normal opacity-80">{suffix}</span>
      <span className="sr-only"> ({word})</span>
    </span>
  );
}
