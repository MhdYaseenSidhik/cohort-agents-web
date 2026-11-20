interface Opt<T extends string | number> { value: T; label: string }

export function Segmented<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: Opt<T>[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-sm border border-line-strong bg-surface-2 p-1 gap-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`h-10 md:h-8 px-3 rounded-sm text-sm font-medium transition-colors ${on ? 'bg-accent text-on-accent' : 'text-muted hover:bg-surface-3 hover:text-ink'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
