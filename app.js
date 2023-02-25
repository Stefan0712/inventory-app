const express = require('express')
const app = express()
const ejsMate = require('ejs-mate')
const path = require('path')
const dotenv = require('dotenv').config()
const cookieParser = require('cookie-parser')
const prompt = require('prompt-sync')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ProductSchema = require('./models/product')
const CategorySchema = require('./models/category')
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
app.use(cookieParser())
const checkPassword = (req, res, next)=>{
    const isLoggedIn = req.cookies.isLoggedIn;
    
    if(isLoggedIn){
        next()
    }else{
        res.redirect('/error/notLoggedIn')
    }
}


app.set('views', path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

//homepage
app.get('/',(req,res)=>{
    res.redirect('/products')
})

//products
//index
app.get('/products', async (req, res)=>{
    const products = await ProductSchema.find({})
    
    res.render('products/index', {products})
})
//new product form
app.get('/products/new',checkPassword , async (req, res)=>{
    const categories = await CategorySchema.find({})
    res.render('products/new', {categories})
})
//route for creating the product
app.post('/products',async (req, res)=>{
    const {name,description,price,qty,category} = req.body;
    const product = await new ProductSchema({name,description,price,qty,category})
    product.save();
    const cat = await CategorySchema.findOne({name:category})
    cat.products.push(product._id)
    cat.save()
    res.redirect('/')
})
//showing one product
app.get('/products/:id',async (req,res)=>{
    const product = await ProductSchema.findById(req.params.id)
    res.render('products/show',{product})
})
//showing edit form
app.get('/products/:id/edit',checkPassword , async (req, res)=>{
    const product = await ProductSchema.findById(req.params.id)
    const categories = await CategorySchema.find({})
    res.render('products/edit',{product, categories})
})
//edit route for products
app.post('/products/:id/edit', async (req, res)=>{
    const {id} = req.params;
    await ProductSchema.findByIdAndUpdate(id, req.body)
    res.redirect(`/products/${id}`)
})
//deleting a product
app.delete('/products/:id',checkPassword,async (req,res)=>{
    await ProductSchema.findByIdAndRemove(req.params.id)
    res.redirect('/')
})
//index for categories
app.get('/categories', async (req, res)=>{
    const categories = await CategorySchema.find({})
    res.render('categories/index',{categories})
})
//showing new category form
app.get('/categories/new',checkPassword , (req, res)=>{
    
    res.render('categories/new')
})
//creating the new category
app.post( '/categories', async (req, res)=>{
    const category = new CategorySchema({name: req.body.name})
    category.save()
    res.redirect('/categories')
})
//showing one category
app.get('/categories/:id',async (req, res)=>{
    const category = await CategorySchema.findById(req.params.id).populate('products')
    res.render('categories/show',{category})
})

app.get('/login',(req, res)=>{
    res.render("login")
})
app.post('/login',(req, res)=>{
    const pass = req.body.password;
    if(pass===process.env.ADMIN_PASSWORD){
       res.cookie('isLoggedIn',true)
       res.redirect('/')
    }else {
       return res.redirect('/error/loginErr')
    }
})

app.get('/logout',(req,res)=>{
    res.clearCookie('isLoggedIn')
    res.redirect('/')
})


app.get('/error/:type',(req, res)=>{
    let msg;
    if(req.params.type==='loginErr'){
        msg = "Password is incorrect. Try again!"
    }else if(req.params.type==='notLoggedIn'){
        msg = "You are not logged in! Log in first!"
    }else if(req.params.type==='notFound'){
        msg = 'Sorry. The page you were looking for was not found!'
    }
    res.render('error', {msg})
})
app.get('*',(req, res)=>{
    res.redirect('/error/notFound')
})

app.listen(3000,()=>{
    console.log('The app is running on port 3000!')
})