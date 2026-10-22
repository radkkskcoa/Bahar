import { Link } from 'react-router-dom';
import { Gift, Sparkles, Trophy } from 'lucide-react';
import { percent } from '../lib/format.js';
import { formatNumber } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

/** Crunch Rewards summary card — lime accents on a dark premium surface. */
export default function LoyaltyCard({ points = 0, nextReward, rewards = [], signedIn, onRedeem, redeeming = false }) {
  const { t, locale } = useI18n();
  const target = nextReward?.points_cost ?? rewards[rewards.length - 1]?.points_cost ?? 2000;
  const progress = percent(points, target);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card via-soft to-base p-6 shadow-card">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/10 blur-2xl" aria-hidden="true" />

      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Trophy className="h-4 w-4 text-lime" aria-hidden="true" />
            {t('home.rewards')}
          </h2>
          <p className="mt-1 text-xs text-ink-muted">{t('home.rewardsSub')}</p>
        </div>
        <Sparkles className="h-5 w-5 text-lime" aria-hidden="true" />
      </header>

      {signedIn ? (
        <>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-extrabold text-lime">{formatNumber(points, locale)}</p>
              <p className="text-xs uppercase tracking-wide text-ink-muted">Points balance</p>
            </div>
            {nextReward ? (
              <div className="text-end">
                <p className="text-sm font-semibold text-ink-soft">{nextReward.name}</p>
                <p className="text-xs text-ink-muted">
                  Next reward {formatNumber(nextReward.points_cost, locale)} pts
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-4 space-y-2">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-elevate"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress to next reward"
            >
              <div className="h-full rounded-full bg-lime transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-ink-muted">
              {progress}% to your next reward
              {nextReward ? ` · ${formatNumber(Math.max(target - points, 0), locale)} pts to go` : ''}
            </p>
          </div>

          {rewards.length ? (
            <ul className="mt-5 space-y-2">
              {rewards.slice(0, 3).map((reward) => {
                const affordable = points >= reward.points_cost;
                return (
                  <li key={reward.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-elevate/70 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{reward.name}</p>
                      <p className="text-[11px] text-ink-muted">{reward.description}</p>
                    </div>
                    <button
                      type="button"
                      className={`btn-sm shrink-0 ${affordable ? 'btn-lime' : 'btn-ghost'}`}
                      onClick={() => onRedeem?.(reward)}
                      disabled={!affordable || redeeming}
                      aria-label={`Redeem ${reward.name} for ${reward.points_cost} points`}
                    >
                      <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatNumber(reward.points_cost, locale)} pts
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <Link to="/rewards" className="link-more mt-4 inline-block">View rewards →</Link>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            Earn points on every order and unlock free sides, discounts and a free bucket.
          </p>
          <Link to="/account?mode=signin" className="btn-lime">Sign in to start earning</Link>
        </div>
      )}
    </section>
  );
}
