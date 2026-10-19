const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const TOKEN_SECRET = 'brew';
const TOKEN_COOKIE = 'bc_session';
const TOKEN_TTL = '7d';

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 32).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, derived] = stored.split(':');
  const check = crypto.scryptSync(plain, salt, 32).toString('hex');
  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(check, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signToken(user) {
  return jwt.sign(
    { uid: user.id, username: user.username, role: user.role },
    TOKEN_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

// Populates req.user from the session cookie when a valid token is present.
function loadUser(req, res, next) {
  const token = req.cookies && req.cookies[TOKEN_COOKIE];
  req.user = null;
  if (token) {
    try {
      const payload = jwt.verify(token, TOKEN_SECRET);
      const row = db
        .prepare('SELECT id, username, email, role, bio FROM users WHERE id = ?')
        .get(payload.uid);
      if (row) req.user = row;
    } catch (err) {
      // token invalid or expired -> treated as anonymous
    }
  }
  res.locals.currentUser = req.user;
  next();
}

function requireLogin(req, res, next) {
  if (!req.user) {
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Forbidden',
      message: 'You do not have access to this area.'
    });
  }
  next();
}

module.exports = {
  TOKEN_SECRET,
  TOKEN_COOKIE,
  hashPassword,
  verifyPassword,
  signToken,
  loadUser,
  requireLogin,
  requireAdmin
};
