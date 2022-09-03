const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findOne().then(user => {
        if (!user) {
            user = new User({
                name: 'Diego',
                email: 'test@mail.com',
                cart: {
                    items: []
                }
            });
            user.save()
        }
        req.user = user;
        next();
    }).catch(err => console.log(err));
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://diego:UK7oeDfyKm3Z0TYJ@cluster0.ynbmj2w.mongodb.net/?retryWrites=true&w=majority')
    .then(result => {

        app.listen(3000);
    }).catch(err => console.log(err))



