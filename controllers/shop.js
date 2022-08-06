const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err => { console.log(err) });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId).then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err => { console.log(err) });
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then(cart => {
    return cart.getProducts()
  }).then(products => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  }).catch(err => console.log(err))
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart().then(cart => {
    fetchedCart = cart;
    return cart.getProducts({ where: { id: prodId } })
  }).then(products => {
    let product;
    if (products.length > 0) {
      product = products[0];
    }
    if (product) {
      newQuantity = product.cart_item.quantity + 1;
      return product
    }
    return Product.findByPk(prodId)
  }).then(product => {
    return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
  }).then(product => {
    res.redirect('/cart');
  }).catch(err => console.log(err))

};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity;
  req.user.getCart().then(cart => {
    fetchedCart = cart;
    return cart.getProducts({ where: { id: prodId } })
  }).then(products => {
    let product;
    if (products.length > 0) {
      product = products[0];
    }
    newQuantity = product.cart_item.quantity - 1;
    return product

  }).then(product => {
    if (newQuantity <= 0) {
      fetchedCart.removeProduct(product);
    }
    return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
  }).then(product => {
    res.redirect('/cart');
  }).catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {

  req.user.getOrders({ include: ['products'] }).then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  }).catch(err => console.log(err));


};

exports.postOrder = (req, res, next) => {
  let fetchedProducts;
  let fetchedCart;
  req.user.getCart().then(cart => {
    fetchedCart = cart;
    return cart.getProducts()
  }).then(products => {
    fetchedProducts = products;
    return req.user.createOrder();
  }).then(order => {
    return order.addProducts(fetchedProducts.map(product => {
      product.order_item = { quantity: product.cart_item.quantity };
      return product;
    }));
  }).then(result => {
    return fetchedCart.setProducts(null);
  }).then(result => {
    res.redirect('/order');
  }).catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
