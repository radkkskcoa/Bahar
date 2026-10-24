import { Plus, ChefHat, Clock } from './Icons'
import { chefSpecials } from '../data/menu'

export default function ChefSpecials({ onAdd, onOpen }) {
  return (
    <section className="container reveal">
      <div className="section-header">
        <div className="section-header-left">
          <span className="section-header-icon"><ChefHat size={22} /></span>
          <div>
            <h2 className="section-title">Chef Specials</h2>
            <p className="section-header-sub">Made with ❤️ by our chefs</p>
          </div>
        </div>
      </div>
      <div className="chef-grid">
        {chefSpecials.map((item) => (
          <div key={item.id} className="chef-card" onClick={() => onOpen(item)} role="button" tabIndex={0}>
            <div className="chef-card-img">
              <img src={item.image} alt={item.name} loading="lazy" />
              {item.limitedTime && <span className="badge badge-new chef-limited-badge">Limited Time</span>}
            </div>
            <div className="chef-card-body">
              <div>
                <span className="chef-card-badge"><ChefHat size={14} /> {item.badge}</span>
                <h3 className="chef-card-name">{item.name}</h3>
                <p className="chef-card-desc">{item.description}</p>
              </div>
              <div className="chef-card-footer">
                <span className="chef-card-price">${item.price.toFixed(2)}</span>
                <button className="add-btn" onClick={(e) => { e.stopPropagation(); onAdd(item) }} aria-label={`Add ${item.name}`}>
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
