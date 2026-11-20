import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_FILTERS, parseFilters, serializeFilters, type Filters } from '../data/filters';

export type Route = 'overview' | 'scorecard' | 'health' | 'replenishment' | 'forecast' | 'plan';
export const ROUTES: { id: Route; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'scorecard', label: 'KPI scorecard' },
  { id: 'health', label: 'Inventory health' },
  { id: 'replenishment', label: 'Replenishment' },
  { id: 'forecast', label: 'Demand forecast' },
  { id: 'plan', label: 'Plan vs actual' },
];

interface Ctx {
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  reset: () => void;
  route: Route;
  go: (r: Route) => void;
}
const FilterCtx = createContext<Ctx | null>(null);

function readRoute(): Route {
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return (ROUTES.find((r) => r.id === h)?.id ?? 'overview') as Route;
}

/** Filters live in the URL query string (?plant=&type=...), the screen in the hash. */
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setState] = useState<Filters>(() => parseFilters(window.location.search));
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    const onPop = () => setState(parseFilters(window.location.search));
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const write = useCallback((f: Filters) => {
    const qs = serializeFilters(f);
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', url);
  }, []);

  const setFilters = useCallback((patch: Partial<Filters>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      write(next);
      return next;
    });
  }, [write]);

  const reset = useCallback(() => {
    setState(DEFAULT_FILTERS);
    write(DEFAULT_FILTERS);
  }, [write]);

  const go = useCallback((r: Route) => {
    window.location.hash = `/${r}`;
  }, []);

  const value = useMemo(() => ({ filters, setFilters, reset, route, go }), [filters, setFilters, reset, route, go]);
  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export function useFilters(): Ctx {
  const c = useContext(FilterCtx);
  if (!c) throw new Error('useFilters outside FilterProvider');
  return c;
}
