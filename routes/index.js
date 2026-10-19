const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const featured = db
    .prepare(
      `SELECT id, name, slug, origin, roast, category, price_cents, tasting, image_url
       FROM products
       WHERE category IN ('Single Origin', 'Blends')
       ORDER BY id ASC
       LIMIT 6`
    )
    .all();
  const categories = db
    .prepare('SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY category')
    .all();
  res.render('index', { title: 'Fresh-roasted coffee, shipped in crates', featured, categories });
});

module.exports = router;
