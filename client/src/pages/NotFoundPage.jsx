import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-lg space-y-4 p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line bg-elevate text-brand">
          <UtensilsCrossed className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold">This page went cold</h1>
        <p className="text-sm text-ink-muted">
          We could not find that page. It may have been moved, or the link is out of date.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">Back home</Link>
          <Link to="/menu" className="btn-ghost">See the menu</Link>
        </div>
      </div>
    </div>
  );
}
