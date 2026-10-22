const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(payload?.error || `Request failed (${res.status})`, res.status, payload);
  }
  return payload;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export const catalog = {
  load: () => api.get('/catalog'),
  price: (payload) => api.post('/cart/price', payload),
};

export const auth = {
  me: () => api.get('/auth/me'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (payload) => api.post('/auth/signup', payload),
  logout: () => api.post('/auth/logout'),
  updateProfile: (payload) => api.patch('/auth/profile', payload),
  addresses: () => api.get('/auth/addresses'),
  addAddress: (payload) => api.post('/auth/addresses', payload),
  removeAddress: (id) => api.del(`/auth/addresses/${id}`),
  toggleFavorite: (productId) => api.post(`/auth/favorites/${productId}`),
  notifications: () => api.get('/auth/notifications'),
  markNotificationsRead: () => api.post('/auth/notifications/read'),
};

export const orders = {
  create: (payload) => api.post('/orders', payload),
  mine: () => api.get('/orders/mine'),
  lookup: (orderNumber, proof = {}) => {
    const params = new URLSearchParams();
    if (proof.phone) params.set('phone', proof.phone);
    if (proof.email) params.set('email', proof.email);
    const qs = params.toString();
    return api.get(`/orders/${encodeURIComponent(orderNumber)}${qs ? `?${qs}` : ''}`);
  },
  setStatus: (id, status, note) => api.patch(`/orders/${id}/status`, { status, note }),
};

export const loyalty = {
  summary: () => api.get('/loyalty'),
  redeem: (rewardId) => api.post('/loyalty/redeem', { reward_id: rewardId }),
};

export const admin = {
  stats: () => api.get('/admin/stats'),
  orders: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
  },
  updateOrder: (id, payload) => api.patch(`/admin/orders/${id}`, payload),
  deleteOrder: (id) => api.del(`/admin/orders/${id}`),
  categories: () => api.get('/admin/categories'),
  createProduct: (payload) => api.post('/admin/products', payload),
  updateProduct: (id, payload) => api.patch(`/admin/products/${id}`, payload),
  deleteProduct: (id) => api.del(`/admin/products/${id}`),
  promotions: () => api.get('/admin/promotions'),
  createPromotion: (payload) => api.post('/admin/promotions', payload),
  updatePromotion: (id, payload) => api.patch(`/admin/promotions/${id}`, payload),
  deletePromotion: (id) => api.del(`/admin/promotions/${id}`),
  coupons: () => api.get('/admin/coupons'),
  createCoupon: (payload) => api.post('/admin/coupons', payload),
  updateCoupon: (id, payload) => api.patch(`/admin/coupons/${id}`, payload),
  deleteCoupon: (id) => api.del(`/admin/coupons/${id}`),
  customers: () => api.get('/admin/customers'),
  settings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.patch('/admin/settings', payload),
};

export const support = {
  send: (payload) => api.post('/support/messages', payload),
};
