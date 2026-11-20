import { ChevronRight } from 'lucide-react';

export interface Crumb { label: string; onClick?: () => void }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Drill-down path">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {last || !c.onClick ? (
                <span aria-current={last ? 'page' : undefined} className="font-semibold text-ink px-1">{c.label}</span>
              ) : (
                <button type="button" onClick={c.onClick} className="min-h-10 md:min-h-8 px-2 rounded-sm text-accent hover:bg-accent-soft transition-colors">{c.label}</button>
              )}
              {!last && <ChevronRight size={14} className="text-faint" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
