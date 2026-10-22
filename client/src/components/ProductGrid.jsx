import ProductCard from './ProductCard.jsx';
import { EmptyState } from './states.jsx';
import { SearchX } from 'lucide-react';

export default function ProductGrid({ products, onOpen, columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', emptyTitle = 'Nothing here yet', emptyBody }) {
  if (!products.length) {
    return (
      <EmptyState
        icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
        title={emptyTitle}
        description={emptyBody}
      />
    );
  }

  return (
    <div className={`grid gap-4 ${columns}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onOpen={onOpen} />
      ))}
    </div>
  );
}
