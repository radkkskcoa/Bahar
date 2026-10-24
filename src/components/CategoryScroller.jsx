import { categories } from '../data/menu'

export default function CategoryScroller({ selected, onSelect }) {
  return (
    <div className="cat-scroll no-scrollbar" role="tablist" aria-label="Food categories">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`cat-tile ${selected === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
          role="tab"
          aria-selected={selected === cat.id}
        >
          <span className="cat-icon">{cat.icon}</span>
          <span className="cat-label">{cat.name}</span>
        </button>
      ))}
    </div>
  )
}
