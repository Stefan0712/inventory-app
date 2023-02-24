const express = require('express')
const app = express()
const ejsMate = require('ejs-mate')
const path = require('path')
const mongoose = require('mongoose')
const ProductSchema = require('./models/product')
mongoose.connect('mongodb://127.0.0.1:27017/inventory-app',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});    
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () =>{
    console.log("Database connected")
})

app.engine('ejs', ejsMate)
app.set('views','views')
app.set('view engine','ejs')


app.set('views', path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.urlencoded({extended: true}))



app.get('/', async (req, res)=>{
    const products = await ProductSchema.find({})
    
    res.render('index', {products})
})
app.get('/products/:id',async (req,res)=>{
    const product = await ProductSchema.findById(req.params.id)
    res.render('show',{product})
})


app.listen(3000,()=>{
    console.log('The app is running on port 3000!')
})