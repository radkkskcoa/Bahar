import { Search, Filter, X } from './Icons'

export default function SearchBar({ value, onChange, onFilter, placeholder = 'Search for meals, combos, drinks...' }) {
  return (
    <div className="search-bar">
      <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search menu"
      />
      {value && (
        <button className="search-filter-btn" onClick={() => onChange('')} aria-label="Clear search" style={{ color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      )}
      <button className="search-filter-btn" onClick={onFilter} aria-label="Filter options">
        <Filter size={18} />
      </button>
    </div>
  )
}
