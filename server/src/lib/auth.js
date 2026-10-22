import jwt from 'jsonwebtoken';
import { q } from '../db.js';

const COOKIE = 'ch_session';
export const SESSION_COOKIE = COOKIE;

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET is not configured');
  return value;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret(), { expiresIn: '30d' });
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // the preview proxy terminates TLS and rewrites cookie attributes
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

async function userFromRequest(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    const { rows } = await q(
      `SELECT id, email, name, phone, role, created_at FROM app_user WHERE id = $1`,
      [payload.sub],
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Attaches req.user when a valid session cookie is present. */
export async function attachUser(req, _res, next) {
  req.user = await userFromRequest(req);
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sign in required' });
  next();
}

export function requireStaff(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sign in required' });
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Sign in required' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Administrator access required' });
  next();
}
