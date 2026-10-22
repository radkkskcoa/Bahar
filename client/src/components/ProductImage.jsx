import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

/** Food photo with a loading shimmer and a graceful fallback if the asset fails. */
export default function ProductImage({ src, alt, className = '', sizes, eager = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-elevate ${className}`}>
      {!loaded && !failed ? <span className="skeleton absolute inset-0" aria-hidden="true" /> : null}
      {failed ? (
        <span className="absolute inset-0 grid place-items-center text-ink-muted" aria-hidden="true">
          <UtensilsCrossed className="h-7 w-7" />
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
