import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock } from './Icons'
import { businessSettings, faqs } from '../data/menu'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [openFaq, setOpenFaq] = useState(null)

  const cols = [
    {
      title: 'Menu', links: [
        { label: 'Fried Chicken', to: '/menu' },
        { label: 'Burgers', to: '/menu' },
        { label: 'Wraps', to: '/menu' },
        { label: 'Sides', to: '/menu' },
        { label: 'Drinks', to: '/menu' },
        { label: 'Desserts', to: '/menu' },
      ]
    },
    {
      title: 'Company', links: [
        { label: 'About Us', to: '/about' },
        { label: 'Deals & Offers', to: '/deals' },
        { label: 'Crunch Rewards', to: '/rewards' },
        { label: 'Track Order', to: '/track' },
      ]
    },
    {
      title: 'Support', links: [
        { label: 'FAQ', to: '/about' },
        { label: 'Terms & Conditions', to: '/about' },
        { label: 'Privacy Policy', to: '/about' },
        { label: 'Refund Policy', to: '/about' },
      ]
    },
  ]

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ cursor: 'default' }}>
              <div className="brand-mark">CH</div>
              <span className="brand-text">{businessSettings.name}</span>
            </div>
            <p className="footer-brand-desc">{businessSettings.tagline}. Premium fried chicken and fast food delivered to your door. Hot, crunchy & made fresh for you.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.label} to={l.to}>{l.label}</Link>
              ))}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '32px', display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }} className="reveal">
          {faqs.slice(0, 4).map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span style={{ color: openFaq === i ? 'var(--orange)' : 'var(--text-muted)', fontSize: '1.2rem' }}>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={16} /> {businessSettings.address}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={16} /> {businessSettings.phone}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} /> {businessSettings.email}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} /> {businessSettings.hours}</span>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 {businessSettings.name}. All rights reserved. Made with ❤️ and extra crunch.
      </div>
    </footer>
  )
}
