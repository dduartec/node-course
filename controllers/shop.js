const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
	Product.fetchAll().then(products => {
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products'
		});
	}).catch(err => { console.log(err) });
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId).then(product => {
		res.render('shop/product-detail', {
			product: product,
			pageTitle: product.title,
			path: '/products'
		});
	});
};

exports.getIndex = (req, res, next) => {
	Product.fetchAll().then(products => {
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/'
		});
	}).catch(err => { console.log(err) });
};

exports.getCart = (req, res, next) => {
	req.user.getCart().then(products => {
		res.render('shop/cart', {
			path: '/cart',
			pageTitle: 'Your Cart',
			products: products
		});
	}).catch(err => console.log(err));

};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId).then(product => {
		return req.user.addToCart(product)
	}).then(result => res.redirect('/cart'))
		.catch(err => console.log(err))
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	return req.user.deleteCartItem(prodId)
		.then(result => res.redirect('/cart'))
		.catch(err => console.log(err))
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
