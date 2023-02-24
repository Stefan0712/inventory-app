const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ProductSchema = require('./product')

const CategorySchema = new Schema({
    name: String,
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
})

module.exports = mongoose.model('Category', CategorySchema)