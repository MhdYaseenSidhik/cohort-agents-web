import { SCHEMA_VERSION, type DatasetMap, type DatasetName } from './types';

const cache = new Map<string, Promise<unknown>>();

export function dataUrl(name: DatasetName): string {
  return `${import.meta.env.BASE_URL}data/${name}.json`;
}

/** The single place that knows where data lives. Move to Cloud Storage here. */
export function loadDataset<N extends DatasetName>(name: N): Promise<DatasetMap[N]> {
  const hit = cache.get(name);
  if (hit) return hit as Promise<DatasetMap[N]>;
  const p = fetch(dataUrl(name)).then(async (res) => {
    if (!res.ok) throw new Error(`Could not load ${name}.json (HTTP ${res.status})`);
    return (await res.json()) as DatasetMap[N];
  });
  p.catch(() => cache.delete(name));
  cache.set(name, p);
  return p;
}

export function clearDatasetCache(): void {
  cache.clear();
}

export function checkSchemaVersion(found: number, expected: number = SCHEMA_VERSION): string | null {
  return found === expected
    ? null
    : `Data schemaVersion mismatch: manifest.json says ${found} but this dashboard reads schemaVersion ${expected} (SCHEMA.md). The data was not loaded.`;
}
