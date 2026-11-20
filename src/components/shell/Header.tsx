import { Boxes, Moon, Sun } from 'lucide-react';
import { useCore } from '../../app/CoreData';
import { ROUTES, useFilters } from '../../app/FilterContext';
import { useTheme } from '../../app/theme';
import { monthLabel } from '../../data/format';

export function Header() {
  const { manifest } = useCore();
  const { route, go } = useFilters();
  const { theme, toggle } = useTheme();
  return (
    <header className="bg-surface border-b border-line sticky top-0 z-20">
      <div className="max-w-page mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-3 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center size-8 rounded-sm bg-accent text-on-accent shrink-0"><Boxes size={18} aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="font-semibold text-ink leading-tight truncate">Inventory Control</p>
              <p className="text-xs text-muted leading-tight truncate">Stores &amp; spares · ZSPR / ZSPN · POC</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted num">As of {monthLabel(manifest.asOf.slice(0, 7))} · {manifest.asOf}</span>
            <button type="button" className="btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
        <nav aria-label="Screens" className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-2">
          {ROUTES.map((r) => {
            const on = r.id === route;
            return (
              <button
                key={r.id}
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => go(r.id)}
                className={`h-10 md:h-9 px-3 rounded-sm text-sm font-medium whitespace-nowrap transition-colors ${on ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
              >
                {r.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
