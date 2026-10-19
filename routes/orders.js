const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../db/database');
const { requireLogin } = require('../middleware/auth');
const { readCart, hydrate, CART_COOKIE } = require('./cart');

const router = express.Router();
const INVOICES_DIR = path.join(__dirname, '..', 'invoices');

function buildReference() {
  return 'BC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function renderInvoice(fileName, order, items) {
  const lines = [];
  lines.push('BrewCrate - Receipt');
  lines.push('===================');
  lines.push(`Order ${order.reference}`);
  lines.push(`Ship to: ${order.ship_name}, ${order.ship_address}`);
  lines.push('');
  for (const it of items) {
    lines.push(`${it.quantity} x ${it.product_name}  @ $${(it.unit_cents / 100).toFixed(2)}`);
  }
  lines.push('');
  lines.push(`TOTAL: $${(order.total_cents / 100).toFixed(2)}`);
  if (!fs.existsSync(INVOICES_DIR)) fs.mkdirSync(INVOICES_DIR, { recursive: true });
  fs.writeFileSync(path.join(INVOICES_DIR, fileName), lines.join('\n'), 'utf8');
}

router.get('/checkout', requireLogin, (req, res) => {
  const { lines, total } = hydrate(readCart(req));
  if (!lines.length) return res.redirect('/cart');
  res.render('checkout', { title: 'Checkout', lines, total, error: null });
});

router.post('/checkout', requireLogin, (req, res) => {
  const { lines } = hydrate(readCart(req));
  if (!lines.length) return res.redirect('/cart');

  const shipName = (req.body.ship_name || '').trim();
  const shipAddress = (req.body.ship_address || '').trim();
  if (!shipName || !shipAddress) {
    return res.status(400).render('checkout', {
      title: 'Checkout',
      lines,
      total: lines.reduce((s, l) => s + l.subtotal, 0),
      error: 'Please provide a shipping name and address.'
    });
  }

  const priced = lines.map((l) => {
    const submitted = req.body['unit_' + l.product.slug];
    const unit = submitted !== undefined ? parseInt(submitted, 10) : l.product.price_cents;
    return {
      product_id: l.product.id,
      product_name: l.product.name,
      unit_cents: Number.isNaN(unit) ? l.product.price_cents : unit,
      quantity: l.quantity
    };
  });
  const total = priced.reduce((sum, it) => sum + it.unit_cents * it.quantity, 0);

  const reference = buildReference();
  const invoiceFile = `${reference}.txt`;

  const createOrder = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO orders (reference, user_id, total_cents, ship_name, ship_address, status, invoice_file)
         VALUES (?, ?, ?, ?, ?, 'paid', ?)`
      )
      .run(reference, req.user.id, total, shipName, shipAddress, invoiceFile);
    const orderId = info.lastInsertRowid;
    const itemStmt = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_cents, quantity)
       VALUES (?, ?, ?, ?, ?)`
    );
    for (const it of priced) {
      itemStmt.run(orderId, it.product_id, it.product_name, it.unit_cents, it.quantity);
    }
    return orderId;
  });

  const orderId = createOrder();
  renderInvoice(invoiceFile, { reference, ship_name: shipName, ship_address: shipAddress, total_cents: total }, priced);

  res.clearCookie(CART_COOKIE);
  res.redirect('/orders/' + orderId);
});

router.get('/orders/invoice', requireLogin, (req, res) => {
  const file = req.query.file;
  if (!file) {
    return res.status(400).render('error', {
      title: 'Missing file',
      message: 'No invoice was requested.'
    });
  }
  const target = path.join(INVOICES_DIR, file);
  fs.readFile(target, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).render('error', {
        title: 'Not found',
        message: 'That receipt could not be located.'
      });
    }
    res.type('text/plain').send(data);
  });
});

router.get('/orders/:id', requireLogin, (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(req.params.id);

  if (!order) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'We could not find an order with that reference.'
    });
  }

  const items = db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .all(order.id);

  res.render('order', { title: 'Order ' + order.reference, order, items });
});

module.exports = router;
