import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';

export function Skeleton({ className = '', height = 'h-24' }: { className?: string; height?: string }) {
  return <div className={`skeleton ${height} ${className}`} aria-hidden="true" />;
}

export function LoadingBlock({ label = 'Loading data' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-4">
      <span className="sr-only">{label}…</span>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} height="h-28" />)}
      </div>
      <Skeleton height="h-72" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card p-6 flex gap-4 items-start border-l-4 border-danger">
      <AlertTriangle className="text-danger shrink-0" size={20} aria-hidden="true" />
      <div className="grid gap-2">
        <p className="font-semibold text-ink">Something went wrong</p>
        <p className="text-muted">{message}</p>
        {onRetry && (
          <button type="button" className="btn w-fit" onClick={onRetry}>
            <RotateCw size={16} aria-hidden="true" /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card p-8 grid place-items-center text-center gap-2">
      <Inbox className="text-faint" size={28} aria-hidden="true" />
      <p className="font-semibold text-ink">{title}</p>
      {children && <p className="text-muted max-w-prose">{children}</p>}
      {action}
    </div>
  );
}
