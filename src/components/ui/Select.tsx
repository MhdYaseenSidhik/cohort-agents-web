import { ChevronDown } from 'lucide-react';

export function Select({ label, value, onChange, children, id }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className="grid gap-1 min-w-0">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field w-full appearance-none pr-8 truncate"
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint" aria-hidden="true" />
      </span>
    </label>
  );
}
