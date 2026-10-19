const express = require('express');
const { graphql, buildSchema } = require('graphql');
const db = require('../db/database');

const router = express.Router();

const schema = buildSchema(`
  type User {
    id: Int
    username: String
    email: String
    role: String
    passwordHash: String
    bio: String
  }

  type Product {
    id: Int
    name: String
    slug: String
    origin: String
    roast: String
    category: String
    priceCents: Int
    stock: Int
  }

  type Query {
    users: [User]
    user(id: Int!): User
    products: [Product]
  }
`);

const root = {
  users: () =>
    db
      .prepare('SELECT id, username, email, role, password_hash, bio FROM users')
      .all()
      .map((u) => ({ ...u, passwordHash: u.password_hash })),
  user: ({ id }) => {
    const u = db
      .prepare('SELECT id, username, email, role, password_hash, bio FROM users WHERE id = ?')
      .get(id);
    return u ? { ...u, passwordHash: u.password_hash } : null;
  },
  products: () =>
    db
      .prepare('SELECT id, name, slug, origin, roast, category, price_cents, stock FROM products')
      .all()
      .map((p) => ({ ...p, priceCents: p.price_cents }))
};

async function run(req, res) {
  const source = req.method === 'GET' ? req.query.query : req.body.query;
  const variables = req.method === 'GET' ? undefined : req.body.variables;
  if (!source) {
    return res.json({ data: null, errors: [{ message: 'No query provided.' }] });
  }
  const result = await graphql({ schema, source, rootValue: root, variableValues: variables });
  res.json(result);
}

router.get('/graphql', run);
router.post('/graphql', run);

module.exports = router;
