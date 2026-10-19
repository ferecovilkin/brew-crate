const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { loadUser } = require('./middleware/auth');

const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const { router: cartRoutes } = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const adminRoutes = require('./routes/admin');
const assistantRoutes = require('./routes/assistant');
const apiRoutes = require('./routes/api');
const graphqlRoutes = require('./routes/graphql');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(loadUser);

app.use(indexRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(authRoutes);
app.use(accountRoutes);
app.use(adminRoutes);
app.use(assistantRoutes);
app.use(apiRoutes);
app.use(graphqlRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page not found',
    message: 'We looked everywhere and could not find that page.'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Something went wrong',
    message: 'An unexpected error occurred while brewing your request.'
  });
});

app.listen(PORT, HOST, () => {
  console.log(`BrewCrate is running at http://${HOST}:${PORT}`);
});
