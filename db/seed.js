const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');
const { hashPassword } = require('../middleware/auth');

function makeReference() {
  return 'BC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const insertUser = db.prepare(
  `INSERT INTO users (username, email, password_hash, role, bio)
   VALUES (@username, @email, @password_hash, @role, @bio)`
);

const users = [
  {
    username: 'roastmaster',
    email: 'admin@brewcrate.test',
    password: 'DarkRoast2026!',
    role: 'admin',
    bio: 'Head roaster. Running the shop since the first batch.'
  },
  {
    username: 'nora',
    email: 'nora@example.test',
    password: 'frenchpress',
    role: 'customer',
    bio: 'Pour-over every morning, no exceptions.'
  },
  {
    username: 'dmitri',
    email: 'dmitri@example.test',
    password: 'espresso123',
    role: 'customer',
    bio: 'Chasing the perfect espresso shot.'
  },
  {
    username: 'lena',
    email: 'lena@example.test',
    password: 'coldbrewfan',
    role: 'customer',
    bio: 'Cold brew all year round.'
  }
];

const userIds = {};
for (const u of users) {
  const info = insertUser.run({
    username: u.username,
    email: u.email,
    password_hash: hashPassword(u.password),
    role: u.role,
    bio: u.bio
  });
  userIds[u.username] = info.lastInsertRowid;
}

const insertProduct = db.prepare(
  `INSERT INTO products (name, slug, origin, roast, category, price_cents, stock, tasting, description, image_url)
   VALUES (@name, @slug, @origin, @roast, @category, @price_cents, @stock, @tasting, @description, @image_url)`
);

const products = [
  {
    name: 'Highland Dawn',
    slug: 'highland-dawn',
    origin: 'Ethiopia, Yirgacheffe',
    roast: 'Light',
    category: 'Single Origin',
    price_cents: 1850,
    stock: 42,
    tasting: 'Jasmine, bergamot, stone fruit',
    description: 'A delicate washed Yirgacheffe with a floral lift and a clean, tea-like body.'
  },
  {
    name: 'Copper Canyon',
    slug: 'copper-canyon',
    origin: 'Guatemala, Huehuetenango',
    roast: 'Medium',
    category: 'Single Origin',
    price_cents: 1700,
    stock: 55,
    tasting: 'Milk chocolate, red apple, caramel',
    description: 'Balanced and sweet with a syrupy body. A reliable everyday cup.'
  },
  {
    name: 'Midnight Harbor',
    slug: 'midnight-harbor',
    origin: 'Sumatra, Gayo',
    roast: 'Dark',
    category: 'Single Origin',
    price_cents: 1650,
    stock: 38,
    tasting: 'Cedar, dark cocoa, molasses',
    description: 'Full-bodied and earthy with a low, rumbling finish. Great for French press.'
  },
  {
    name: 'Rally Blend',
    slug: 'rally-blend',
    origin: 'Blend (Brazil, Colombia)',
    roast: 'Medium',
    category: 'Blends',
    price_cents: 1500,
    stock: 120,
    tasting: 'Toasted almond, brown sugar, cocoa',
    description: 'Our house espresso blend. Thick crema and a forgiving sweetness.'
  },
  {
    name: 'Ember Row',
    slug: 'ember-row',
    origin: 'Blend (Ethiopia, Sumatra)',
    roast: 'Medium-Dark',
    category: 'Blends',
    price_cents: 1550,
    stock: 90,
    tasting: 'Dark berry, baking spice, cacao',
    description: 'A bold yet layered blend that holds up well to milk.'
  },
  {
    name: 'Glacier Decaf',
    slug: 'glacier-decaf',
    origin: 'Colombia, Huila',
    roast: 'Medium',
    category: 'Decaf',
    price_cents: 1600,
    stock: 47,
    tasting: 'Nougat, orange, honey',
    description: 'Sugar-cane process decaf that tastes like the real thing.'
  },
  {
    name: 'Sunset Cascara',
    slug: 'sunset-cascara',
    origin: 'Bolivia, Caranavi',
    roast: 'Light',
    category: 'Single Origin',
    price_cents: 1950,
    stock: 21,
    tasting: 'Cherry, hibiscus, cane sugar',
    description: 'A rare natural-process lot bursting with ripe red fruit.'
  },
  {
    name: 'Iron Kettle',
    slug: 'iron-kettle',
    origin: 'India, Monsoon Malabar',
    roast: 'Dark',
    category: 'Single Origin',
    price_cents: 1450,
    stock: 64,
    tasting: 'Pipe tobacco, walnut, pepper',
    description: 'Low-acid and heavy-bodied with a savory edge.'
  },
  {
    name: 'Pennon Gooseneck Kettle',
    slug: 'pennon-gooseneck-kettle',
    origin: 'Brewing Gear',
    roast: 'N/A',
    category: 'Equipment',
    price_cents: 6900,
    stock: 30,
    tasting: 'Precise pour control',
    description: 'A 0.9L stovetop gooseneck kettle with a thermometer in the lid.'
  },
  {
    name: 'Terrace Hand Grinder',
    slug: 'terrace-hand-grinder',
    origin: 'Brewing Gear',
    roast: 'N/A',
    category: 'Equipment',
    price_cents: 8500,
    stock: 18,
    tasting: 'Conical steel burrs',
    description: 'A portable hand grinder with 36 click-adjustable grind settings.'
  },
  {
    name: 'Daybreak Pour-Over Dripper',
    slug: 'daybreak-pour-over-dripper',
    origin: 'Brewing Gear',
    roast: 'N/A',
    category: 'Equipment',
    price_cents: 2400,
    stock: 72,
    tasting: 'Ceramic, single-cup',
    description: 'A classic ceramic cone dripper that fits most mugs and carafes.'
  },
  {
    name: 'Crate Sampler Box',
    slug: 'crate-sampler-box',
    origin: 'Blend (Assorted)',
    roast: 'Assorted',
    category: 'Gifts',
    price_cents: 4200,
    stock: 25,
    tasting: 'Four 100g bags, roaster’s choice',
    description: 'A rotating four-bag sampler — a great way to taste the current lineup.'
  },
  {
    name: 'Harvest Festival Roast',
    slug: 'harvest-festival-roast',
    origin: 'Kenya, Nyeri',
    roast: 'Medium-Light',
    category: 'Single Origin',
    price_cents: 2050,
    stock: 15,
    tasting: 'Blackcurrant, tomato, grapefruit',
    description: 'A juicy AA lot with a bright, structured acidity.'
  },
  {
    name: 'Workshop Mug 12oz',
    slug: 'workshop-mug-12oz',
    origin: 'Merch',
    roast: 'N/A',
    category: 'Gifts',
    price_cents: 1400,
    stock: 110,
    tasting: 'Stoneware, matte glaze',
    description: 'A chunky stoneware mug stamped with the BrewCrate mark.'
  }
];

for (const p of products) {
  insertProduct.run({ image_url: '/img/placeholder.svg', ...p });
}

// A couple of seeded reviews so product pages are not empty.
const insertReview = db.prepare(
  `INSERT INTO reviews (product_id, user_id, rating, body) VALUES (?, ?, ?, ?)`
);
insertReview.run(1, userIds.nora, 5, 'The floral aroma fills the whole kitchen. Stunning.');
insertReview.run(2, userIds.dmitri, 4, 'Super dependable. My default bag now.');
insertReview.run(4, userIds.dmitri, 5, 'Pulls a gorgeous shot every time.');
insertReview.run(3, userIds.lena, 4, 'Makes a killer overnight cold brew.');

// Seed an order per customer so order history (and invoices) exist out of the box.
const insertOrder = db.prepare(
  `INSERT INTO orders (reference, user_id, total_cents, ship_name, ship_address, status, invoice_file)
   VALUES (@reference, @user_id, @total_cents, @ship_name, @ship_address, @status, @invoice_file)`
);
const insertItem = db.prepare(
  `INSERT INTO order_items (order_id, product_id, product_name, unit_cents, quantity)
   VALUES (?, ?, ?, ?, ?)`
);

function seedOrder(username, items, ship) {
  let total = 0;
  for (const it of items) total += it.unit_cents * it.quantity;
  const invoiceName = `invoice-${username}-${Date.now()}.txt`;
  const info = insertOrder.run({
    reference: makeReference(),
    user_id: userIds[username],
    total_cents: total,
    ship_name: ship.name,
    ship_address: ship.address,
    status: 'paid',
    invoice_file: invoiceName
  });
  const orderId = info.lastInsertRowid;
  for (const it of items) {
    insertItem.run(orderId, it.product_id, it.product_name, it.unit_cents, it.quantity);
  }
  writeInvoice(invoiceName, orderId, username, items, total, ship);
  return orderId;
}

function writeInvoice(fileName, orderId, username, items, total, ship) {
  const invoicesDir = path.join(__dirname, '..', 'invoices');
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
  const lines = [];
  lines.push('BrewCrate - Receipt');
  lines.push('===================');
  lines.push(`Order #${orderId}`);
  lines.push(`Customer: ${username}`);
  lines.push(`Ship to: ${ship.name}, ${ship.address}`);
  lines.push('');
  for (const it of items) {
    lines.push(`${it.quantity} x ${it.product_name}  @ $${(it.unit_cents / 100).toFixed(2)}`);
  }
  lines.push('');
  lines.push(`TOTAL: $${(total / 100).toFixed(2)}`);
  fs.writeFileSync(path.join(invoicesDir, fileName), lines.join('\n'), 'utf8');
}

seedOrder(
  'nora',
  [
    { product_id: 1, product_name: 'Highland Dawn', unit_cents: 1850, quantity: 2 },
    { product_id: 11, product_name: 'Daybreak Pour-Over Dripper', unit_cents: 2400, quantity: 1 }
  ],
  { name: 'Nora Albright', address: '14 Willow Lane, Portland' }
);

seedOrder(
  'dmitri',
  [{ product_id: 4, product_name: 'Rally Blend', unit_cents: 1500, quantity: 3 }],
  { name: 'Dmitri Vasko', address: '908 Market St, Seattle' }
);

seedOrder(
  'lena',
  [{ product_id: 3, product_name: 'Midnight Harbor', unit_cents: 1650, quantity: 2 }],
  { name: 'Lena Cho', address: '22 Birch Court, Austin' }
);

console.log('Seeded BrewCrate database at', db.DB_PATH);
console.log('Users:', Object.keys(userIds).join(', '));
