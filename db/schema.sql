-- BrewCrate schema

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer',
  bio           TEXT DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  origin      TEXT NOT NULL,
  roast       TEXT NOT NULL,
  category    TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  tasting     TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '/img/placeholder.svg'
);

CREATE TABLE reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  rating     INTEGER NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE orders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  reference    TEXT UNIQUE NOT NULL,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  total_cents  INTEGER NOT NULL,
  ship_name    TEXT NOT NULL,
  ship_address TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'paid',
  invoice_file TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id),
  product_id   INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  unit_cents   INTEGER NOT NULL,
  quantity     INTEGER NOT NULL
);
