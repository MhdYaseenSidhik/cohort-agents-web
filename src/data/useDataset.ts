import { useCallback, useEffect, useState } from 'react';
import { loadDataset } from './loader';
import type { DatasetMap, DatasetName } from './types';

export interface Loaded<T> { data: T | null; loading: boolean; error: string | null; retry: () => void }

export function useDataset<N extends DatasetName>(name: N): Loaded<DatasetMap[N]> {
  const [state, setState] = useState<{ data: DatasetMap[N] | null; error: string | null }>({ data: null, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState({ data: null, error: null });
    loadDataset(name).then(
      (d) => live && setState({ data: d, error: null }),
      (e: unknown) => live && setState({ data: null, error: e instanceof Error ? e.message : String(e) }),
    );
    return () => {
      live = false;
    };
  }, [name, tick]);
  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { data: state.data, loading: !state.data && !state.error, error: state.error, retry };
}
