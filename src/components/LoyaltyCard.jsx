import { Award, ArrowRight } from './Icons'
import { loyaltyData } from '../data/menu'
import { useNavigate } from 'react-router-dom'

export default function LoyaltyCard() {
  const navigate = useNavigate()
  const { points, nextRewardPoints } = loyaltyData
  const pct = Math.min(100, (points / nextRewardPoints) * 100)

  return (
    <section className="container reveal">
      <div className="loyalty-card">
        <div className="loyalty-header">
          <span className="loyalty-title">
            <Award size={20} style={{ color: 'var(--lime)' }} />
            Crunch Rewards
          </span>
          <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => navigate('/rewards')}>
            View Rewards
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <div className="loyalty-points">{points.toLocaleString()}</div>
            <div className="loyalty-points-label">Your Points</div>
          </div>
        </div>
        <div className="loyalty-progress">
          <div className="loyalty-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="loyalty-next">Next Reward: {nextRewardPoints.toLocaleString()} pts</div>
      </div>
    </section>
  )
}
