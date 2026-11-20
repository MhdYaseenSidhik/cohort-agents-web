import { Info } from 'lucide-react';
import { useCore } from '../../app/CoreData';

/** The source disclaimer and as-of date appear on every screen. */
export function DisclaimerBar() {
  const { manifest } = useCore();
  return (
    <div role="note" className="flex gap-3 items-start rounded-md bg-info-soft text-info px-4 py-3 text-sm">
      <Info size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p><strong className="font-semibold">Simulated POC data · as of {manifest.asOf}.</strong> {manifest.disclaimer}</p>
    </div>
  );
}

export function Footer() {
  const { manifest } = useCore();
  return (
    <footer className="border-t border-line mt-8 py-6 text-xs text-muted">
      <div className="max-w-page mx-auto px-4 md:px-8 grid gap-1">
        <p>{manifest.disclaimer}</p>
        <p className="num">Data as of {manifest.asOf} · schemaVersion {manifest.schemaVersion} · generated {manifest.generatedAt}</p>
      </div>
    </footer>
  );
}
