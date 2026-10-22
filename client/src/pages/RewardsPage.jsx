import { Link } from 'react-router-dom';
import { Gift, History, Sparkles, Trophy } from 'lucide-react';
import LoyaltyCard from '../components/LoyaltyCard.jsx';
import { SectionHeader, Badge } from '../components/ui.jsx';
import { LoadingSkeleton } from '../components/states.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoyalty } from '../hooks/useLoyalty.js';
import { formatDate, formatNumber } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

export default function RewardsPage() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const loyalty = useLoyalty();

  if (!user) {
    return (
      <div className="container-page py-10">
        <div className="card mx-auto max-w-lg space-y-4 p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-lime/40 bg-lime/10 text-lime">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-extrabold">{t('rewards.title')}</h1>
          <p className="text-sm text-ink-muted">{t('rewards.signedOutBody')}</p>
          <Link to="/account?mode=signin" className="btn-primary">{t('nav.signIn')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page space-y-8 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t('rewards.title')}</h1>
        <p className="text-sm text-ink-muted">
          {t('rewards.intro', { points: loyalty.rules?.points_per_dollar ?? 10 })}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <LoyaltyCard
          points={loyalty.points}
          nextReward={loyalty.nextReward}
          rewards={loyalty.rewards}
          signedIn
          onRedeem={loyalty.redeem}
        />

        <section className="card p-6">
          <SectionHeader
            icon={<Gift className="h-5 w-5" aria-hidden="true" />}
            title={t('rewards.available')}
            subtitle={t('rewards.availableSub')}
          />
          {loyalty.loading ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-14 w-full" />
              <LoadingSkeleton className="h-14 w-full" />
            </div>
          ) : (
            <ul className="space-y-3">
              {loyalty.rewards.map((reward) => {
                const affordable = loyalty.points >= reward.points_cost;
                return (
                  <li key={reward.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-elevate/60 p-4">
                    <div>
                      <p className="text-sm font-bold">{reward.name}</p>
                      <p className="text-xs text-ink-muted">{reward.description}</p>
                    </div>
                    <div className="text-end">
                      <Badge tone={affordable ? 'lime' : 'muted'}>
                        {t('rewards.pts', { points: formatNumber(reward.points_cost, locale) })}
                      </Badge>
                      <button
                        type="button"
                        className={`btn-sm mt-2 w-full ${affordable ? 'btn-lime' : 'btn-ghost'}`}
                        disabled={!affordable}
                        onClick={() => loyalty.redeem(reward)}
                      >
                        {affordable ? t('rewards.redeem') : t('rewards.keepEarning')}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-6">
        <SectionHeader
          icon={<History className="h-5 w-5" aria-hidden="true" />}
          title={t('rewards.history')}
          subtitle={t('rewards.historySub')}
        />
        {loyalty.transactions.length === 0 ? (
          <p className="text-sm text-ink-muted">
            <Sparkles className="me-1 inline h-4 w-4 text-lime" aria-hidden="true" />
            {t('rewards.noHistory')}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {loyalty.transactions.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold">{entry.detail || entry.reason}</p>
                  <p className="text-xs text-ink-muted">{formatDate(entry.created_at, locale)}</p>
                </div>
                <span className={`text-sm font-bold ${entry.points > 0 ? 'text-lime' : 'text-danger'}`}>
                  {entry.points > 0 ? '+' : ''}{formatNumber(entry.points, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
