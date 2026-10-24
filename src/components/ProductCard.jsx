import { Star, Plus, Heart, Clock } from './Icons'

export default function ProductCard({ product, onAdd, onOpen, isFav, onToggleFav }) {
  const handleAdd = (e) => {
    e.stopPropagation()
    onAdd(product)
  }
  const handleFav = (e) => {
    e.stopPropagation()
    onToggleFav?.(product.id)
  }

  return (
    <article className="product-card" onClick={() => onOpen(product)} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(product)}>
      <div className="product-card-img-wrap">
        <img className="product-card-img" src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className={`product-card-badge ${product.badge === 'BESTSELLER' ? 'badge-bestseller' : 'badge-new'}`}>
            {product.badge}
          </span>
        )}
        <button className={`product-card-fav ${isFav ? 'active' : ''}`} onClick={handleFav} aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
          <Heart size={16} filled={isFav} />
        </button>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        {product.rating && (
          <div className="product-card-rating">
            <Star size={14} style={{ color: 'var(--lime)', fill: 'var(--lime)' }} />
            {product.rating}
            {product.prepTime && <><span style={{ margin: '0 4px' }}>•</span><Clock size={13} /> {product.prepTime}</>}
          </div>
        )}
        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="price">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="original">${product.originalPrice.toFixed(2)}</span>}
          </div>
          <button className="add-btn" onClick={handleAdd} aria-label={`Add ${product.name} to cart`}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </article>
  )
}
