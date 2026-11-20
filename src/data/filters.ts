import { ALL_PLANTS } from './types';

export interface Filters {
  plant: string; // ALL_PLANTS or a plantId
  type: string; // '' = all material types
  group: string;
  crit: string;
  from: string; // YYYY-MM or ''
  to: string;
}

export const DEFAULT_FILTERS: Filters = { plant: ALL_PLANTS, type: '', group: '', crit: '', from: '', to: '' };

export function parseFilters(search: string): Filters {
  const q = new URLSearchParams(search);
  return {
    plant: q.get('plant') || ALL_PLANTS,
    type: q.get('type') || '',
    group: q.get('group') || '',
    crit: q.get('crit') || '',
    from: q.get('from') || '',
    to: q.get('to') || '',
  };
}

export function serializeFilters(f: Filters): string {
  const q = new URLSearchParams();
  if (f.plant !== ALL_PLANTS) q.set('plant', f.plant);
  if (f.type) q.set('type', f.type);
  if (f.group) q.set('group', f.group);
  if (f.crit) q.set('crit', f.crit);
  if (f.from) q.set('from', f.from);
  if (f.to) q.set('to', f.to);
  return q.toString();
}

export const isAllPlants = (f: Filters) => f.plant === ALL_PLANTS;
export const hasDimFilter = (f: Filters) => Boolean(f.type || f.group || f.crit);

interface Dimmed { plantId: string; materialType?: string; materialGroup?: string; criticality?: string }

/** Generic dimension filter. All plants = every real plant (no plant restriction). */
export function matchDims(r: Dimmed, f: Filters, opts: { crit?: boolean } = { crit: true }): boolean {
  if (f.plant !== ALL_PLANTS && r.plantId !== f.plant) return false;
  if (f.type && r.materialType !== f.type) return false;
  if (f.group && r.materialGroup !== f.group) return false;
  if (opts.crit !== false && f.crit && r.criticality !== f.crit) return false;
  return true;
}

export function inMonthRange(month: string, f: Filters): boolean {
  if (f.from && month < f.from) return false;
  if (f.to && month > f.to) return false;
  return true;
}
