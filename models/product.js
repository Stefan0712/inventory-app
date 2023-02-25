const mongoose = require('mongoose')
const Schema = mongoose.Schema;



const ProductSchema = new Schema({
    name: String,
    description: String,
    category: String,
    price: Number,
    qty: Number,
    
})

module.exports = mongoose.model("Product", ProductSchema)