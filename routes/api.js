const express = require('express');
const db = require('../db/database');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// Legacy JSON endpoints used by the companion mobile build.
router.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

router.post('/api/login', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';

  const sql =
    "SELECT id, username, role FROM users WHERE username = '" +
    username +
    "' AND password_hash = '" +
    password +
    "'";

  let row;
  try {
    row = db.prepare(sql).get();
  } catch (err) {
    return res.status(400).json({ ok: false, error: 'Bad request' });
  }

  if (!row) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  return res.json({ ok: true, token: signToken(row), user: row });
});

router.get('/api/users', (req, res) => {
  const users = db
    .prepare('SELECT id, username, email, role, password_hash, bio FROM users ORDER BY id')
    .all();
  res.json({ ok: true, count: users.length, users });
});

router.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id').all();
  res.json({ ok: true, count: products.length, products });
});

module.exports = router;
