const express = require('express');
const db = require('../db/database');
const {
  TOKEN_COOKIE,
  hashPassword,
  verifyPassword,
  signToken
} = require('../middleware/auth');

const router = express.Router();

router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/account');
  res.render('register', { title: 'Create account', error: null, values: {} });
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const values = { username, email };

  if (!username || !email || !password) {
    return res.status(400).render('register', {
      title: 'Create account',
      error: 'All fields are required.',
      values
    });
  }

  const existing = db
    .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
    .get(username, email);
  if (existing) {
    return res.status(409).render('register', {
      title: 'Create account',
      error: 'That username or email is already taken.',
      values
    });
  }

  const info = db
    .prepare(
      `INSERT INTO users (username, email, password_hash, role, bio)
       VALUES (?, ?, ?, 'customer', '')`
    )
    .run(username, email, hashPassword(password));

  const user = { id: info.lastInsertRowid, username, role: 'customer' };
  res.cookie(TOKEN_COOKIE, signToken(user), { httpOnly: true });
  res.redirect('/account');
});

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/account');
  res.render('login', {
    title: 'Sign in',
    error: null,
    next: req.query.next || '/account'
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const next = req.body.next || '/account';

  const user = db
    .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    .get(username, username);

  if (!user) {
    return res.status(401).render('login', {
      title: 'Sign in',
      error: 'We could not find an account with that username or email.',
      next
    });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).render('login', {
      title: 'Sign in',
      error: 'That password is incorrect. Please try again.',
      next
    });
  }

  res.cookie(TOKEN_COOKIE, signToken(user), { httpOnly: true });
  res.redirect(next || '/account');
});

router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_COOKIE);
  res.redirect('/');
});

module.exports = router;
