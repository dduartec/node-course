const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    items: [{
        type: {},
        ref: 'Product',
        required: true
    }],
    user: {
        type: {},
        ref: 'User',
        required: true
    }

});

module.exports = mongoose.model('Order', orderSchema);