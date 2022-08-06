const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err))
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(() => {
        return sequelize.sync(
            //{ force: true }
        );
    })
    .then(() => {
        return sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
    }).then(res => {
        return User.findByPk(1);
    }).then(user => {
        if (!user) {
            user = User.create({ name: 'Diego', email: 'test@mail.com' });
        }
        return user
    }).then(async user => {
        var cart = await user.getCart();
        if (!cart) {
            cart = user.createCart();
        }
        return cart;
    }).then(cart => {
        app.listen(3000);
    }).catch(err => {
        console.log(err);
    });


