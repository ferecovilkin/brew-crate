const express = require('express');
const db = require('../db/database');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

const PROTECTED_FIELDS = new Set(['id', 'password_hash', 'created_at']);

function userColumns() {
  return db
    .prepare('PRAGMA table_info(users)')
    .all()
    .map((c) => c.name);
}

router.get('/account', requireLogin, (req, res) => {
  const orders = db
    .prepare(
      `SELECT id, reference, total_cents, status, created_at, invoice_file
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.id);
  res.render('account', { title: 'Your account', orders });
});

router.get('/account/profile', requireLogin, (req, res) => {
  const profile = db
    .prepare('SELECT id, username, email, bio FROM users WHERE id = ?')
    .get(req.user.id);
  res.render('profile-edit', { title: 'Edit profile', profile, saved: false });
});

router.post('/account/profile', requireLogin, (req, res) => {
  const columns = userColumns();
  const assignments = [];
  const values = [];

  for (const key of Object.keys(req.body)) {
    if (!columns.includes(key) || PROTECTED_FIELDS.has(key)) continue;
    assignments.push(`${key} = ?`);
    values.push(req.body[key]);
  }

  if (assignments.length) {
    values.push(req.user.id);
    db.prepare(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`).run(...values);
  }

  const profile = db
    .prepare('SELECT id, username, email, bio FROM users WHERE id = ?')
    .get(req.user.id);
  res.render('profile-edit', { title: 'Edit profile', profile, saved: true });
});

router.get('/u/:username', (req, res) => {
  const profile = db
    .prepare('SELECT username, bio, role, created_at FROM users WHERE username = ?')
    .get(req.params.username);
  if (!profile) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'No member with that name.'
    });
  }
  const reviews = db
    .prepare(
      `SELECT r.rating, r.body, p.name AS product_name, p.slug
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       WHERE u.username = ?
       ORDER BY r.created_at DESC`
    )
    .all(req.params.username);
  res.render('public-profile', { title: profile.username, profile, reviews });
});

module.exports = router;
