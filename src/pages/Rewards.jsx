import { loyaltyData } from '../data/menu'
import { Award } from '../components/Icons'
import { useToast as useToastCtx } from '../context/ToastContext'

export default function Rewards() {
  const { showToast } = useToastCtx()
  const { points, nextRewardPoints, rewards } = loyaltyData
  const pct = Math.min(100, (points / nextRewardPoints) * 100)

  const redeem = (reward) => {
    if (points >= reward.points) {
      showToast(`Redeemed: ${reward.name}! 🎉`)
    } else {
      showToast(`Not enough points. You need ${reward.points - points} more.`, 'error')
    }
  }

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: 800 }}>
      <h1 className="section-title" style={{ marginBottom: '20px' }}>Crunch Rewards</h1>

      <div className="loyalty-card">
        <div className="loyalty-header">
          <span className="loyalty-title"><Award size={22} style={{ color: 'var(--lime)' }} /> Your Rewards Balance</span>
        </div>
        <div className="loyalty-points">{points.toLocaleString()}</div>
        <div className="loyalty-points-label">Available Points</div>
        <div className="loyalty-progress" style={{ marginTop: 16 }}>
          <div className="loyalty-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="loyalty-next">{nextRewardPoints - points} points to next reward</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Earn 1 point for every $1 spent. Points are awarded after order completion.
        </p>
      </div>

      <h2 style={{ fontWeight: 800, margin: '28px 0 16px', fontSize: '1.3rem' }}>Available Rewards</h2>
      <div className="rewards-grid">
        {rewards.map((reward) => {
          const canRedeem = points >= reward.points
          return (
            <div key={reward.id} className={`reward-card ${!canRedeem ? 'locked' : ''}`}>
              <div className="reward-icon">{reward.icon}</div>
              <div className="reward-name">{reward.name}</div>
              <div className="reward-points">{reward.points.toLocaleString()} pts</div>
              <button className="reward-btn" disabled={!canRedeem} onClick={() => redeem(reward)}>
                {canRedeem ? 'Redeem' : 'Locked'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="spacer-h" />
      <h2 style={{ fontWeight: 800, margin: '0 0 16px', fontSize: '1.3rem' }}>Loyalty Transaction History</h2>
      <div className="card" style={{ padding: 20 }}>
        <div className="checkout-summary-item"><span>Order #CH-20261024-001</span><span style={{ color: 'var(--success)' }}>+34 pts</span></div>
        <div className="checkout-summary-item"><span>Order #CH-20261023-005</span><span style={{ color: 'var(--success)' }}>+28 pts</span></div>
        <div className="checkout-summary-item"><span>Redeemed: Free Side</span><span style={{ color: 'var(--error)' }}>−800 pts</span></div>
        <div className="checkout-summary-item"><span>Order #CH-20261022-012</span><span style={{ color: 'var(--success)' }}>+42 pts</span></div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 16 }}>
        * Demonstration data. Points are associated with your authenticated account and calculated server-side in production.
      </p>
    </div>
  )
}
