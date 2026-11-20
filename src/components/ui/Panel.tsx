import type { ReactNode } from 'react';

export function Panel({ title, subtitle, actions, children, badge }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode; badge?: ReactNode }) {
  return (
    <section className="card p-4 md:p-6 grid gap-4 min-w-0" aria-label={title}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1 min-w-0">
          <h2 className="text-base font-semibold text-ink flex flex-wrap items-center gap-2">{title}{badge}</h2>
          {subtitle && <p className="text-muted text-sm max-w-prose">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="text-muted max-w-prose">{description}</p>
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'info' | 'accent'; children: ReactNode }) {
  const cls = {
    neutral: 'bg-surface-3 text-muted',
    good: 'bg-success-soft text-success',
    bad: 'bg-danger-soft text-danger',
    warn: 'bg-warning-soft text-warning',
    info: 'bg-info-soft text-info',
    accent: 'bg-accent-soft text-accent',
  }[tone];
  return <span className={`chip ${cls}`}>{children}</span>;
}
