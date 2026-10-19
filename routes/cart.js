const express = require('express');
const db = require('../db/database');

const router = express.Router();

const CART_COOKIE = 'bc_cart';

function readCart(req) {
  try {
    const raw = req.cookies[CART_COOKIE];
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.slug === 'string');
  } catch (err) {
    return [];
  }
}

function writeCart(res, items) {
  res.cookie(CART_COOKIE, JSON.stringify(items), { httpOnly: true });
}

function hydrate(items) {
  const lines = [];
  let total = 0;
  for (const item of items) {
    const product = db
      .prepare('SELECT id, name, slug, price_cents, image_url FROM products WHERE slug = ?')
      .get(item.slug);
    if (!product) continue;
    const quantity = parseInt(item.qty, 10);
    if (Number.isNaN(quantity)) continue;
    const subtotal = product.price_cents * quantity;
    total += subtotal;
    lines.push({ product, quantity, subtotal });
  }
  return { lines, total };
}

router.get('/cart', (req, res) => {
  const { lines, total } = hydrate(readCart(req));
  res.render('cart', { title: 'Your crate', lines, total });
});

router.post('/cart/add', (req, res) => {
  const slug = req.body.slug;
  const qty = Math.max(1, parseInt(req.body.qty, 10) || 1);
  const product = db.prepare('SELECT slug FROM products WHERE slug = ?').get(slug);
  if (!product) return res.redirect('/products');

  const items = readCart(req);
  const line = items.find((i) => i.slug === slug);
  if (line) {
    line.qty = Math.max(1, parseInt(line.qty, 10) || 1) + qty;
  } else {
    items.push({ slug, qty });
  }
  writeCart(res, items);
  res.redirect('/cart');
});

router.post('/cart/update', (req, res) => {
  const slug = req.body.slug;
  const qty = parseInt(req.body.qty, 10);
  let items = readCart(req);
  if (Number.isNaN(qty)) {
    items = items.filter((i) => i.slug !== slug);
  } else {
    const line = items.find((i) => i.slug === slug);
    if (line) line.qty = qty;
  }
  writeCart(res, items);
  res.redirect('/cart');
});

router.post('/cart/remove', (req, res) => {
  const slug = req.body.slug;
  const items = readCart(req).filter((i) => i.slug !== slug);
  writeCart(res, items);
  res.redirect('/cart');
});

module.exports = { router, readCart, writeCart, hydrate, CART_COOKIE };
