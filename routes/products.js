const express = require('express');
const db = require('../db/database');

const router = express.Router();

const PRODUCT_COLUMNS =
  'id, name, slug, origin, roast, category, price_cents, tasting, image_url';

const SORT_COLUMNS = {
  featured: 'id ASC',
  priceasc: 'price_cents ASC',
  pricedesc: 'price_cents DESC',
  name: 'name ASC'
};

router.get('/products', (req, res) => {
  const products = db
    .prepare(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY id ASC`)
    .all();
  const categories = db
    .prepare('SELECT DISTINCT category FROM products ORDER BY category')
    .all()
    .map((r) => r.category);
  res.render('products', {
    title: 'All coffee & gear',
    products,
    categories,
    query: '',
    activeCategory: ''
  });
});

router.get('/search', (req, res) => {
  const query = (req.query.q || '').trim();
  const filterBy = req.query.category || '';
  const sort = req.query.sort || 'featured';

  let sql = `SELECT ${PRODUCT_COLUMNS} FROM products WHERE 1 = 1`;
  const params = [];

  if (query) {
    sql += ' AND (name LIKE ? OR tasting LIKE ? OR origin LIKE ? OR description LIKE ?)';
    const like = `%${query}%`;
    params.push(like, like, like, like);
  }

  if (filterBy) {
    sql += ` AND category = '${filterBy}'`;
  }

  sql += ' ORDER BY ' + (SORT_COLUMNS[sort] || SORT_COLUMNS.featured);

  let products = [];
  let failed = false;
  try {
    products = db.prepare(sql).all(...params);
  } catch (err) {
    failed = true;
  }

  const categories = db
    .prepare('SELECT DISTINCT category FROM products ORDER BY category')
    .all()
    .map((r) => r.category);

  res.render('search', {
    title: query ? `Search: ${query}` : 'Search',
    products,
    categories,
    query,
    activeCategory: filterBy,
    sort,
    failed
  });
});

router.get('/product/:slug', (req, res) => {
  const product = db
    .prepare('SELECT * FROM products WHERE slug = ?')
    .get(req.params.slug);

  if (!product) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'That product is no longer on the shelf.'
    });
  }

  const reviews = db
    .prepare(
      `SELECT r.rating, r.body, r.created_at, u.username
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`
    )
    .all(product.id);

  res.render('product', { title: product.name, product, reviews });
});

router.post('/product/:slug/review', (req, res) => {
  if (!req.user) {
    return res.redirect('/login?next=' + encodeURIComponent('/product/' + req.params.slug));
  }
  const product = db
    .prepare('SELECT id, slug FROM products WHERE slug = ?')
    .get(req.params.slug);
  if (!product) {
    return res.status(404).render('error', {
      title: 'Not found',
      message: 'That product is no longer on the shelf.'
    });
  }
  const rating = Math.max(1, Math.min(5, parseInt(req.body.rating, 10) || 5));
  const body = req.body.body || '';
  db.prepare(
    'INSERT INTO reviews (product_id, user_id, rating, body) VALUES (?, ?, ?, ?)'
  ).run(product.id, req.user.id, rating, body);
  res.redirect('/product/' + product.slug);
});

module.exports = router;
