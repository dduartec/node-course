const mongodb = require('mongodb')
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, price, description, imageUrl, null, req.user._id);
  product.save().then(result => {
    console.log("created");
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  //req.user.getProducts({ where: { id: prodId } }).then(products => {
  Product.findById(prodId).then(product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  }).catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  updatedTitle = req.body.title;
  updatedPrice = req.body.price;
  updatedImageUrl = req.body.imageUrl;
  updatedDescription = req.body.description;
  //req.user.getProducts({ where: { id: prodId } }).then(products => {
  Product.findById(prodId).then(productData => {
    const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, prodId)
    return product.save();
  }).then(result => {
    console.log("updated")
    res.redirect('/admin/products');
  }).catch(err => console.log(err));

};

exports.getProducts = (req, res, next) => {
  //req.user.getProducts().then(products => {
  Product.fetchAll().then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  }).catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId).then(result => {
    console.log("deleted")
    res.redirect('/admin/products');
  }).catch(err => console.log(err));
};
