const mongoose = require('mongoose')
const Order = require('./order')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true
            },
        }],
    }
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({ productId: product._id, quantity: 1 })
    }

    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.removeFromCart = function (productId) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === productId.toString();
    });

    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex < 0) {
        return;
    }
    let newQuantity = this.cart.items[cartProductIndex].quantity - 1;

    if (newQuantity <= 0) {
        updatedCartItems.splice(cartProductIndex, 1);
    } else {
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }

    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.getCart = function () {
    let products = []
    return this.populate('cart.items.productId')
        .then(user => {
            products = user.cart.items.map(i => {
                return { ...i.productId._doc, 'quantity': i.quantity }
            })
            return products
        }).catch(err => console.log(err));
}

userSchema.methods.addOrder = function () {

    return this.getCart().then(products => {
        const { cart, ...user } = this._doc
        const order = new Order({
            items: products,
            user: user
        });
        return order.save().then(result => {
            this.cart.items = [];
            return this.save()
        }).catch(err => console.log(err))
    }).catch(err => console.log(err));
}
module.exports = mongoose.model('User', userSchema);

// const ObjectId = mongodb.ObjectId
// const getDb = require('../util/database').getDb;

// const collection = 'users'
// class User {

//     constructor(username, email, id, cart) {
//         this.name = username;
//         this.email = email;
//         this.cart = !cart || cart === undefined ? { items: [] } : cart;
//         this._id = id ? new ObjectId(id) : null;
//     }

//     save() {
//         const db = getDb();
//         let dbOp;
//         if (this._id) {
//             dbOp = db.collection(collection).updateOne({ _id: this._id }, { $set: this });
//         } else {
//             dbOp = db.collection(collection).insertOne(this);
//         }

//         return dbOp.then(result => {
//             console.log(result);
//         }).catch(err => console.log(err))
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items]

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ productId: product._id, quantity: 1 })
//         }

//         const updatedCart = { items: updatedCartItems }
//         const db = getDb();
//         return db.collection(collection).updateOne(
//             { _id: this._id },
//             { $set: { cart: updatedCart } }
//         )
//     }

//     getCart() {
//         const db = getDb();
//         let cartItems;
//         return db.collection('products').find({ _id: { $in: this.cart.items.map(i => i.productId) } }).toArray()
//             .then(products => {
//                 return products.map(p => {
//                     return {
//                         ...p, quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     };
//                 });
//             }).then(products => {
//                 // update cart with existing products on db (remove deleted products that are still on the cart)
//                 cartItems = products;
//                 const updatedCart = {
//                     items: products.map(i => {
//                         return {
//                             productId: i._id,
//                             quantity: i.quantity
//                         };
//                     })
//                 };
//                 return db.collection(collection).updateOne(
//                     { _id: this._id },
//                     { $set: { cart: updatedCart } }
//                 );
//             }).then(result => {
//                 return cartItems;
//             }).catch(err => console.log(err));
//     }

//     deleteCartItem(productId) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === productId.toString();
//         });

//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex < 0) {
//             return;
//         }
//         let newQuantity = this.cart.items[cartProductIndex].quantity - 1;

//         if (newQuantity <= 0) {
//             updatedCartItems.splice(cartProductIndex, 1);
//         } else {
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }

//         const updatedCart = { items: updatedCartItems }
//         const db = getDb();
//         return db.collection(collection).updateOne(
//             { _id: this._id },
//             { $set: { cart: updatedCart } }
//         )
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.name,
//                     email: this.email,
//                 }
//             };
//             return db.collection('orders').insertOne(order);
//         }).then(result => {
//             this.cart = { items: [] };
//             return db.collection(collection).updateOne(
//                 { _id: this._id },
//                 { $set: { cart: { items: [] } } }
//             )
//         }).catch(err => console.log(err));

//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({ 'user._id': this._id }).toArray()
//             .then(orders => {
//                 return orders;
//             }).catch(err => console.log(err));
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection(collection).find().toArray()
//             .then(users => {
//                 return users
//             }).catch(err => console.log(err));
//     }

//     static findById(id) {
//         const db = getDb();
//         return db.collection(collection).find({ _id: new ObjectId(id) }).next()
//             .then(user => {
//                 return user
//             }).catch(err => console.log(err));
//     }

//     static deleteById(id) {
//         const db = getDb();
//         return db.collection(collection).deleteOne({ _id: new ObjectId(id) })
//             .then(user => {
//             }).catch(err => console.log(err));
//     }
// }

// module.exports = User;