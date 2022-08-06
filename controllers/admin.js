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
  req.user.createProduct({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user.id
  }).then(result => {
    console.log("created");
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });
};

// exports.getEditProduct = (req, res, next) => {
//   const editMode = req.query.edit;
//   if (!editMode) {
//     return res.redirect('/');
//   }
//   const prodId = req.params.productId;
//   req.user.getProducts({ where: { id: prodId } }).then(products => {
//     const product = products[0]
//     if (!product) {
//       return res.redirect('/');
//     }
//     res.render('admin/edit-product', {
//       pageTitle: 'Edit Product',
//       path: '/admin/edit-product',
//       editing: editMode,
//       product: product
//     });
//   }).catch(err => console.log(err));
// };

// exports.postEditProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   req.user.getProducts({ where: { id: prodId } }).then(products => {
//     const product = products[0]
//     product.id = req.body.productId;
//     product.title = req.body.title;
//     product.price = req.body.price;
//     product.imageUrl = req.body.imageUrl;
//     product.description = req.body.description;
//     return product.save();
//   }).then(result => {
//     console.log("updated")
//     res.redirect('/admin/products');
//   }).catch(err => console.log(err));

// };

// exports.getProducts = (req, res, next) => {
//   req.user.getProducts().then(products => {
//     res.render('admin/products', {
//       prods: products,
//       pageTitle: 'Admin Products',
//       path: '/admin/products'
//     });
//   }).catch(err => console.log(err));

// };

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findByPk(prodId).then(product => {
//     return product.destroy();
//   }).then(result => {
//     console.log("deleted")
//     res.redirect('/admin/products');
//   }).catch(err => console.log(err));
// };
