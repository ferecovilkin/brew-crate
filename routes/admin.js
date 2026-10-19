const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const db = require('../db/database');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { parseProductFeed } = require('../lib/xmlimport');

const router = express.Router();
const IMG_DIR = path.join(__dirname, '..', 'public', 'img');

const EXT_BY_TYPE = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg'
};

router.get('/admin', requireAdmin, (req, res) => {
  const stats = {
    products: db.prepare('SELECT COUNT(*) AS c FROM products').get().c,
    orders: db.prepare('SELECT COUNT(*) AS c FROM orders').get().c,
    users: db.prepare('SELECT COUNT(*) AS c FROM users').get().c,
    revenue: db.prepare("SELECT COALESCE(SUM(total_cents),0) AS c FROM orders WHERE status='paid'").get().c
  };
  res.render('admin/dashboard', { title: 'Admin', stats });
});

router.get('/admin/products', requireAdmin, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
  res.render('admin/products', { title: 'Manage products', products, notice: null });
});

router.post('/admin/products/image', requireAdmin, async (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const imageUrl = (req.body.imageUrl || '').trim();
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);

  const products = () => db.prepare('SELECT * FROM products ORDER BY id ASC').all();

  if (!product || !imageUrl) {
    return res.status(400).render('admin/products', {
      title: 'Manage products',
      products: products(),
      notice: { kind: 'error', text: 'Pick a product and provide an image URL.' }
    });
  }

  try {
    const response = await fetch(imageUrl);
    const contentType = (response.headers.get('content-type') || '').split(';')[0];
    const ext = EXT_BY_TYPE[contentType] || '.img';
    const buffer = Buffer.from(await response.arrayBuffer());
    const fileName = `product-${productId}${ext}`;
    fs.writeFileSync(path.join(IMG_DIR, fileName), buffer);
    db.prepare('UPDATE products SET image_url = ? WHERE id = ?').run('/img/' + fileName, productId);
    return res.render('admin/products', {
      title: 'Manage products',
      products: products(),
      notice: { kind: 'ok', text: `Fetched ${buffer.length} bytes from ${imageUrl}.` }
    });
  } catch (err) {
    return res.status(502).render('admin/products', {
      title: 'Manage products',
      products: products(),
      notice: { kind: 'error', text: 'Could not fetch that URL: ' + err.message }
    });
  }
});

router.get('/admin/import', requireAdmin, (req, res) => {
  res.render('admin/import', { title: 'Import catalog', result: null, error: null });
});

router.post('/admin/import', requireAdmin, async (req, res) => {
  const xml = req.body.feed || '';
  try {
    const parsed = await parseProductFeed(xml);
    res.render('admin/import', { title: 'Import catalog', result: parsed, error: null });
  } catch (err) {
    res.render('admin/import', { title: 'Import catalog', result: null, error: err.message });
  }
});

router.get('/admin/templates', requireAdmin, (req, res) => {
  res.render('admin/templates', { title: 'Packing slips', rendered: null, template: '', error: null });
});

router.post('/admin/templates/preview', requireAdmin, (req, res) => {
  const template = req.body.template || '';
  const sample = {
    shop: 'BrewCrate',
    order: { reference: 'BC-SAMPLE1', total: '$42.00' },
    customer: 'Nora Albright'
  };
  let rendered = null;
  let error = null;
  try {
    rendered = ejs.render(template, sample);
  } catch (err) {
    error = err.message;
  }
  res.render('admin/templates', { title: 'Packing slips', rendered, template, error });
});

router.get('/admin/orders', requireAdmin, (req, res) => {
  const orders = db
    .prepare(
      `SELECT o.id, o.reference, o.total_cents, o.status, o.ship_name, o.ship_address,
              o.created_at, u.username
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    )
    .all();
  res.render('admin/orders', { title: 'Order report', orders });
});

// Team directory for the operations dashboard.
router.get('/admin/users', requireLogin, (req, res) => {
  const users = db
    .prepare('SELECT id, username, email, role, created_at FROM users ORDER BY id')
    .all();
  res.render('admin/users', { title: 'Members', users });
});

module.exports = router;
