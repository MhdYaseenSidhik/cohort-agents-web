import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { checkSchemaVersion, loadDataset } from '../data/loader';
import type { Dims, Kpis, Manifest } from '../data/types';
import { ErrorState, LoadingBlock } from '../components/ui/States';

export interface Core { manifest: Manifest; dims: Dims; kpis: Kpis }
const CoreCtx = createContext<Core | null>(null);

/** Loads manifest, dims and kpis at start. A schemaVersion mismatch is an error state, never a guess. */
export function CoreProvider({ children }: { children: ReactNode }) {
  const [core, setCore] = useState<Core | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setError(null);
    (async () => {
      try {
        const manifest = await loadDataset('manifest');
        const mismatch = checkSchemaVersion(manifest.schemaVersion);
        if (mismatch) throw new Error(mismatch);
        const [dims, kpis] = await Promise.all([loadDataset('dims'), loadDataset('kpis')]);
        if (live) setCore({ manifest, dims, kpis });
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      live = false;
    };
  }, [tick]);

  if (error) return <div className="max-w-page mx-auto p-4 md:p-8"><ErrorState message={error} onRetry={() => setTick((t) => t + 1)} /></div>;
  if (!core) return <div className="max-w-page mx-auto p-4 md:p-8"><LoadingBlock label="Loading manifest, dimensions and KPIs" /></div>;
  return <CoreCtx.Provider value={core}>{children}</CoreCtx.Provider>;
}

export function useCore(): Core {
  const c = useContext(CoreCtx);
  if (!c) throw new Error('useCore outside CoreProvider');
  return c;
}
