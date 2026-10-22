import express from 'express';
import { q, withTransaction } from '../db.js';
import { attachUser, requireAuth } from '../lib/auth.js';
import { getSettings, httpError } from '../lib/pricing.js';

const router = express.Router();
router.use(attachUser);

async function ensureAccount(userId) {
  await q(`INSERT INTO loyalty_account (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [userId]);
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    await ensureAccount(req.user.id);
    const settings = await getSettings();
    const [{ rows: account }, { rows: transactions }, { rows: rewards }] = await Promise.all([
      q(`SELECT * FROM loyalty_account WHERE user_id = $1`, [req.user.id]),
      q(`SELECT * FROM loyalty_transaction WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user.id]),
      q(`SELECT * FROM reward WHERE active = true ORDER BY points_cost, sort`),
    ]);
    const points = account[0]?.points ?? 0;
    const nextReward = rewards.find((r) => r.points_cost > points) ?? null;
    res.json({
      points,
      lifetime_points: account[0]?.lifetime_points ?? 0,
      transactions,
      rewards,
      next_reward: nextReward,
      rules: settings.loyalty ?? {},
    });
  } catch (err) {
    next(err);
  }
});

router.post('/redeem', requireAuth, async (req, res, next) => {
  try {
    const rewardId = Number(req.body?.reward_id);
    const { rows: rewards } = await q(`SELECT * FROM reward WHERE id = $1 AND active = true`, [rewardId]);
    const reward = rewards[0];
    if (!reward) throw httpError(404, 'That reward is not available');

    const result = await withTransaction(async (client) => {
      const { rows } = await client.query(`SELECT points FROM loyalty_account WHERE user_id = $1 FOR UPDATE`, [
        req.user.id,
      ]);
      const balance = rows[0]?.points ?? 0;
      if (balance < reward.points_cost) {
        throw httpError(400, `You need ${reward.points_cost - balance} more points for ${reward.name}`);
      }
      await client.query(
        `UPDATE loyalty_account SET points = points - $2 WHERE user_id = $1`,
        [req.user.id, reward.points_cost],
      );
      await client.query(
        `INSERT INTO loyalty_transaction (user_id, points, reason, detail) VALUES ($1,$2,'redeemed',$3)`,
        [req.user.id, -reward.points_cost, `Redeemed ${reward.name}`],
      );
      return balance - reward.points_cost;
    });

    res.json({ points: result, reward: reward.name });
  } catch (err) {
    next(err);
  }
});

export default router;
