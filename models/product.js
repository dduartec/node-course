const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId
const getDb = require('../util/database').getDb;

const collection = 'products'
class Product {
	constructor(title, price, description, imageUrl, id, userId) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this._id = id ? new ObjectId(id) : null;
		this.userId = userId;
	}

	save() {
		const db = getDb();
		let dbOp;
		if (this._id) {
			dbOp = db.collection(collection).updateOne({ _id: this._id }, { $set: this });
		} else {
			dbOp = db.collection(collection).insertOne(this);
		}

		return dbOp.then(result => {
			console.log(result);
		}).catch(err => console.log(err))
	}

	static fetchAll() {
		const db = getDb();
		return db.collection(collection).find().toArray()
			.then(products => {
				return products
			}).catch(err => console.log(err));
	}

	static findById(prodId) {
		const db = getDb();
		return db.collection(collection).find({ _id: new ObjectId(prodId) }).next()
			.then(product => {
				return product
			}).catch(err => console.log(err));
	}

	static deleteById(prodId) {
		const db = getDb();
		return db.collection(collection).deleteOne({ _id: new ObjectId(prodId) })
			.then(product => {
			}).catch(err => console.log(err));
	}
}

module.exports = Product;