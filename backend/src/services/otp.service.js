import NodeCache from 'node-cache';

const ttlSeconds = Number(process.env.OTP_TTL_SECONDS) || 300; // 5 minutes
const cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: 60, deleteOnExpire: true });

function key(email, purpose) {
  return `otp:${purpose}:${email.toLowerCase()}`;
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function setOtp(email, purpose, code) {
  cache.set(key(email, purpose), JSON.stringify({ code, createdAt: Date.now(), attempts: 0 }));
}

export function hasOtp(email, purpose) {
  return cache.has(key(email, purpose));
}

export function verifyAndConsumeOtp(email, purpose, code) {
  const k = key(email, purpose);
  const raw = cache.get(k);
  if (!raw) return { ok: false, reason: 'expired' };
  let payload;
  try { payload = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { payload = raw; }
  const attempts = (payload?.attempts ?? 0) + 1;
  payload.attempts = attempts;
  if (attempts > (Number(process.env.OTP_MAX_ATTEMPTS) || 5)) {
    cache.del(k);
    return { ok: false, reason: 'too_many_attempts' };
  }
  if (String(payload?.code) !== String(code)) {
    cache.set(k, JSON.stringify(payload));
    return { ok: false, reason: 'invalid' };
  }
  cache.del(k);
  return { ok: true };
}
