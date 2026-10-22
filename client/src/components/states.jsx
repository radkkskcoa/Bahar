import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react';

export function LoadingSkeleton({ className = 'h-32 w-full' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SectionSkeleton({ cards = 4 }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="w-56 shrink-0 space-y-3">
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card space-y-3 overflow-hidden p-0">
          <LoadingSkeleton className="h-40 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-3 w-1/2" />
            <LoadingSkeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-elevate text-brand">
        {icon ?? <SearchX className="h-6 w-6" aria-hidden="true" />}
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      {description ? <p className="max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center" role="alert">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-md text-sm text-ink-muted">{message}</p>
      {onRetry ? (
        <button type="button" className="btn-ghost" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
