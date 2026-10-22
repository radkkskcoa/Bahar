import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { pool } from './db.js';
import { attachUser } from './lib/auth.js';
import catalogRoutes from './routes/catalog.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import loyaltyRoutes from './routes/loyalty.js';
import adminRoutes from './routes/admin.js';
import supportRoutes from './routes/support.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

// The storefront normally calls the API through the Vite dev proxy (same origin),
// so CORS only matters for direct API access from the public preview host.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use(attachUser);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'up' });
  } catch (err) {
    res.status(503).json({ ok: false, database: 'down', error: err.message });
  }
});

app.use('/api', catalogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
app.use((err, _req, res, _next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error('[api]', err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on our side' : err.message });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[api] Crunch House API listening on http://0.0.0.0:${port}`);
});
