import { useState } from 'react'
import { businessSettings, faqs } from '../data/menu'
import { Phone, Mail, MapPin, Clock, Users, Award, Heart, Check } from '../components/Icons'

export default function About() {
  const [openFaq, setOpenFaq] = useState(null)

  const values = [
    { icon: Heart, title: 'Quality First', desc: 'We never compromise on ingredients. Every meal is made with premium, fresh produce.' },
    { icon: Check, title: 'Freshly Prepared', desc: 'Everything is cooked to order. No pre-made, no reheated — just fresh and crunchy.' },
    { icon: Award, title: 'Crunch Rewards', desc: 'Earn points on every order and redeem them for free food and exclusive discounts.' },
    { icon: Users, title: 'Community', desc: 'Proudly serving our local community with the best fried chicken in town.' },
  ]

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: 800 }}>
      <h1 className="section-title" style={{ marginBottom: '12px' }}>About CRUNCH HOUSE</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: 1.7 }}>
        {businessSettings.name} was born from a simple idea: that fried chicken should be crispy, fresh, and delivered fast.
        We take pride in every piece — golden, crunchy, and made with love. From our signature buckets to our chef specials,
        every meal is crafted to give you the ultimate crunch experience.
      </p>

      <div className="product-grid" style={{ marginBottom: '40px' }}>
        {values.map((v) => {
          const Icon = v.icon
          return (
            <div key={v.title} className="card" style={{ padding: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)', marginBottom: 12 }}>
                <Icon size={24} />
              </div>
              <h3 style={{ fontWeight: 800, marginBottom: 6 }}>{v.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{v.desc}</p>
            </div>
          )
        })}
      </div>

      <h2 className="section-title" style={{ marginBottom: '16px' }}>Contact Us</h2>
      <div className="card" style={{ padding: 24, marginBottom: '40px' }}>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--orange)' }}><Phone size={20} /></span> {businessSettings.phone}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--orange)' }}><Mail size={20} /></span> {businessSettings.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--orange)' }}><MapPin size={20} /></span> {businessSettings.address}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--orange)' }}><Clock size={20} /></span> {businessSettings.hours}
          </div>
        </div>
      </div>

      <h2 className="section-title" style={{ marginBottom: '16px' }}>Frequently Asked Questions</h2>
      <div className="card" style={{ padding: '0 20px', marginBottom: '40px' }}>
        {faqs.map((faq, i) => (
          <div key={i} className="faq-item">
            <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {faq.q}
              <span style={{ color: openFaq === i ? 'var(--orange)' : 'var(--text-muted)', fontSize: '1.2rem' }}>{openFaq === i ? '−' : '+'}</span>
            </div>
            {openFaq === i && <div className="faq-a">{faq.a}</div>}
          </div>
        ))}
      </div>

      <h2 className="section-title" style={{ marginBottom: '16px' }}>Policies</h2>
      <div className="card" style={{ padding: 24, marginBottom: '40px' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Terms & Conditions</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          By using {businessSettings.name}, you agree to our terms of service. All prices are in {businessSettings.currency} and subject to applicable taxes.
        </p>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          We respect your privacy. Your personal information is used only to process orders and improve your experience. We never sell your data.
        </p>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Refund & Cancellation</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Orders can be cancelled before preparation begins. Refunds are processed within 3–5 business days for eligible cancellations.
        </p>
      </div>
    </div>
  )
}
