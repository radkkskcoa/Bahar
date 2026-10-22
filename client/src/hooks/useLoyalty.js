import { useCallback, useEffect, useState } from 'react';
import { loyalty as loyaltyApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/** Loyalty balance, ledger and rewards for the signed-in customer. */
export function useLoyalty() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState({ loading: false, points: 0, transactions: [], rewards: [], nextReward: null, rules: {} });

  const load = useCallback(async () => {
    if (!user) {
      setState({ loading: false, points: 0, transactions: [], rewards: [], nextReward: null, rules: {} });
      return;
    }
    setState((current) => ({ ...current, loading: true }));
    try {
      const data = await loyaltyApi.summary();
      setState({
        loading: false,
        points: data.points,
        transactions: data.transactions,
        rewards: data.rewards,
        nextReward: data.next_reward,
        rules: data.rules,
      });
    } catch (err) {
      setState((current) => ({ ...current, loading: false }));
      toast({ title: 'Could not load your rewards', body: err.message, tone: 'error' });
    }
  }, [user, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const redeem = useCallback(
    async (reward) => {
      try {
        const result = await loyaltyApi.redeem(reward.id);
        toast({ title: `${reward.name} redeemed`, body: `Balance: ${result.points} points`, tone: 'success' });
        await load();
        return true;
      } catch (err) {
        toast({ title: 'Redemption failed', body: err.message, tone: 'error' });
        return false;
      }
    },
    [load, toast],
  );

  return { ...state, reload: load, redeem };
}
