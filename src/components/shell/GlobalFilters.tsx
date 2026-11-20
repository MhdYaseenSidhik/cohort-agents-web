import { RotateCcw } from 'lucide-react';
import { useCore } from '../../app/CoreData';
import { useFilters } from '../../app/FilterContext';
import { ALL_PLANTS } from '../../data/types';
import { Select } from '../ui/Select';

export function GlobalFilters() {
  const { dims, kpis } = useCore();
  const { filters, setFilters, reset } = useFilters();
  const months = [...new Set(kpis.rows.map((r) => r.month))].sort();
  const dirty = filters.plant !== ALL_PLANTS || filters.type || filters.group || filters.crit || filters.from || filters.to;
  return (
    <form aria-label="Global filters" className="card p-3 md:p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 items-end" onSubmit={(e) => e.preventDefault()}>
      <Select id="f-plant" label="Plant" value={filters.plant} onChange={(v) => setFilters({ plant: v })}>
        <option value={ALL_PLANTS}>All plants</option>
        {dims.plants.map((p) => <option key={p.plantId} value={p.plantId}>{p.plantId}</option>)}
      </Select>
      <Select id="f-type" label="Material type" value={filters.type} onChange={(v) => setFilters({ type: v })}>
        <option value="">All types</option>
        {dims.materialTypes.map((t) => <option key={t.code} value={t.code}>{t.code}</option>)}
      </Select>
      <Select id="f-group" label="Material group" value={filters.group} onChange={(v) => setFilters({ group: v })}>
        <option value="">All groups</option>
        {dims.materialGroups.map((g) => <option key={g.code} value={g.code}>{g.name || g.code}</option>)}
      </Select>
      <Select id="f-crit" label="Criticality" value={filters.crit} onChange={(v) => setFilters({ crit: v })}>
        <option value="">All criticality</option>
        {dims.criticality.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
      </Select>
      <Select id="f-from" label="From month" value={filters.from} onChange={(v) => setFilters({ from: v })}>
        <option value="">Earliest</option>
        {months.map((m) => <option key={m} value={m}>{m}</option>)}
      </Select>
      <Select id="f-to" label="To month" value={filters.to} onChange={(v) => setFilters({ to: v })}>
        <option value="">Latest</option>
        {months.map((m) => <option key={m} value={m}>{m}</option>)}
      </Select>
      <button type="button" className="btn col-span-2 md:col-span-1" onClick={reset} disabled={!dirty}>
        <RotateCcw size={16} aria-hidden="true" /> Reset filters
      </button>
    </form>
  );
}
