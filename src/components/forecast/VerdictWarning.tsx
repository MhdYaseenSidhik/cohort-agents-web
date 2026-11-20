import { TriangleAlert } from 'lucide-react';
import { useCore } from '../../app/CoreData';

/** The backtest verdict warning is always visible on the forecast screen. */
export function VerdictWarning() {
  const { manifest } = useCore();
  const f = manifest.forecast;
  if (!f) return null;
  return (
    <div role="alert" className="rounded-md bg-warning-soft text-warning p-4 grid gap-2 border border-warning/30">
      <p className="font-semibold flex items-center gap-2"><TriangleAlert size={18} aria-hidden="true" /> Model verdict: {f.verdict}. Backtest WAPE {f.backtestError.wape.toFixed(3)}, treat forecasts as indicative.</p>
      <ul className="list-disc pl-6 text-sm grid gap-1">
        {f.verdictReasons.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}
