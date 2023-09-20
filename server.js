const express = require('express');
const app = express();
const ejs = require('ejs')
const ejsMate = require('ejs-mate')
const populate = require('./populateDb')
const bodyParser = require('body-parser')
const db = require('./database')
const methodOverride = require('method-override')


//set engine to ejs
app.set('view engine', 'ejs')
app.engine('ejs',ejsMate)
//serves static files
app.use(express.static(__dirname + '/public'));
//enables the body-parser package
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
//middleware used for enabling "PUT" method
app.use(methodOverride('_method'));



//dashboard route that is also the default route
app.get('/',(req,res)=>{
    let sql = 'SELECT * FROM products'
    db.all(sql,(err,rows)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: "Could not get dashboard items"})
            const errorMessage = "Couldn't get dashboard items /";
            return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
        }

        res.render("dashboard.ejs", {products: rows})
    })
})
//route for the Browse page
app.get('/all-products',(req, res)=>{
   
    let sql = 'SELECT * FROM products';
    db.all(sql,(err, rows)=>{
        if(err){
            console.error(err.message)
            res.status(500).json({error: 'Internal server error'})
            return;
        }
        let products = rows;
        const catSql = 'SELECT DISTINCT category FROM products';
        db.all(catSql, (err, rows)=>{
            if(err){
                console.error(err)
                req.response(500).json({error: "Could not find categories"})
                const errorMessage = "Couldn't get all products /all-products";
                return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
            }
            let categories = rows;
            res.render('browse.ejs', {products, categories})
        })
    })
})
//route that handles filtering the items from the /all-products route (Browse items)
app.get("/filtered-items", (req, res) => {
    //set default values for filters
    let column = 'name';
    let order = 'asc';
    let category = '';
    //if the order is specified when a request is made to thsi route, it will update both the column
    //and the order, since it's either both or none inputed 
    if (req.query.order === 'asc' || req.query.order === 'desc') {
        column = req.query.column;
        order = req.query.order;
    }
    //checks if there is a category
    if (req.query.category) {
        category = req.query.category;
    }

    let sql = 'SELECT * FROM products';
    //if there is a category specified, it adds this sql part to the final sql query
    if (category) {
        sql += ` WHERE category = '${category}'`;
    }

    sql += ` ORDER BY ${column} ${order}`;

    db.all(sql, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
            const errorMessage = "Couldn't filter the items /filtered-items";
            return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
        }
        res.send({ products: rows });
    });
});
//route for browsing the categories from the nav bar
app.get('/browse-category/:category',(req,res)=>{
    let {category} = req.params;
    //finds all the products with the requested category
    sql = `SELECT * FROM products WHERE category = '${category}'`;
    db.all(sql, (err,rows)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: 'Could not get items'})
            const errorMessage = ' Could not get browse by category items'
            return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
            
        }
        let products = rows;
        //then it gets all the categories that exist in the database, to update the filters with a list of them
        const catSql = 'SELECT DISTINCT category FROM products';
        db.all(catSql, (err, rows)=>{
            if(err){
                console.error(err)
                req.response(500).json({error: "Could not find categories"})
                const errorMessage = ' Could not get browse by category categories'
                return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
            }
            let categories = rows;
            res.render('browse.ejs', {products, categories})
        })
        
    })
})
//route for displaying different messages, like errors or confirmations
app.get('/message',(req,res)=>{
    let message = req.query.message;
    res.render('error.ejs',{message})
})
//deletes everything and repopulate it with a test set of items
app.get('/reset-database',(req, res)=>{
    db.run('DELETE FROM products',(err)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: 'Could not delete the database in the reset process'})
            return;
        }
            //access a function from populateDb.js file
            populate();
            res.redirect('/message?message=Database reset successfully')
        
    })
})
//empties the database. This option is available also separate from the reset
//in case you want to only have your added items
app.get('/delete',(req, res)=>{
    const sql = 'DELETE FROM products'
    db.run(sql,(err)=>{
        if(err){

            console.error(err.message)
            res.status(500).json({error: 'The deletion was unsuccessfull'})
            const errorMessage = "Couldn't delete the items from the database /delete";
            return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
        }
        res.redirect('/')
    });
})



//render the form for a new item
app.get('/new',(req, res)=>{
    res.render('newItem.ejs')
})

//handles the adding of a new item to the database
app.post('/new',(req,res)=>{
    //only name, category, description, price and quantity are required, so the item might only contain these
    //the quick add from the dashboard only has these fields
    const {name, category, description, price, quantity, minStock, maxStock, expirationDate, unit, purchasePrice} = req.body;
    const sql = 'INSERT INTO products (name, category, description, price, quantity, minStock, maxStock, expirationDate, unit, purchasePrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    db.run(sql, [name, category, description, price, quantity, maxStock, minStock, expirationDate, unit, purchasePrice], (err)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: 'Internal server error'})
            const errorMessage = "Couldn't add a new item /new";
            return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
        }
    })
    res.redirect('/all-products');
})

//route to show an items
app.get('/view-item/:id',(req,res)=>{
    const {id} = req.params;
    const sql = 'SELECT * FROM products WHERE id = ?';

    db.get(sql, [id], (err, rows)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: "Counldn't find the item"})
            const errorMessage = "Couldn't find the item for /view-item/:id";
            return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
        };
        let color = 'blue';
        let barWidth = (rows.quantity / rows.maxStock) * 100;
        let minStockColor = 'black';
        let maxStockColor = 'black';
        let currentStockColor = 'black';
        if(rows.quantity>=rows.maxStock){
            barWidth = 100;
            maxStockColor = "red"
            color= 'yellow';
        }else if(rows.quantity<=rows.minStock){
            color= "red";
            minStockColor = 'red'
        }else if(rows.quantity <= 0){
            barWidth = 0;
            currentStockColor = 'red';
        }
        res.send({product: rows, barWidth, color, minStockColor, maxStockColor, currentStockColor})
    })
})
//route for showing the form to edit an item, while also filling the inputs with already existing data, if there is any
app.get('/edit-item/:id',(req,res)=>{
    const {id} = req.params;
    const sql = 'SELECT * FROM products WHERE id = ?';
    
    db.get(sql, [id], (err, rows)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: "Counldn't find the item"})
            const errorMessage = "Couldn't find the item for /edit-item/:id";
            return res.redirect(`/message?message=${encodeURIComponent(errorMessage)}`);
        };
        
        res.render('editForm.ejs',{product: rows})
    })
})
//handle the updating of the item in the database
app.put('/edit-item/:id',(req, res)=>{
    const {id} = req.params;
    const {name, category, description, price, quantity, minStock, maxStock, expirationDate, unit, purchasePrice} = req.body;

    // SQL query to update the item based on its ID
    const sql = 'UPDATE products SET name = ?, category = ?, description = ?, price = ?, quantity = ?, minStock = ?, maxStock = ?, expirationDate = ?, unit = ?, purchasePrice = ? WHERE id = ?';

    // Execute the SQL query with the provided parameters
    db.run(sql, [name, category, description, price, quantity, minStock, maxStock, expirationDate, unit, purchasePrice, id], (err) => {
        if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
        }
        res.redirect(`/view-item/${id}`);
  });
})

//deletes an item from the database based on the ID
app.get('/delete-item/:id', (req, res) => {
    const { id } = req.params;
  
    // SQL query to delete the item based on its ID
    const sql = 'DELETE FROM products WHERE id = ?';
  
    // Execute the SQL query with the provided ID as a parameter
    db.run(sql, [id], (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      res.redirect('/all-products'); // Redirect to a page after successful deletion
    });
  });
  //route for the search bar (nav bar). It searches every item name that contains the term from the search input
app.get('/search',(req,res)=>{
    const searchTerm = req.query.searchInput;
    let sql = 'SELECT * FROM products WHERE name LIKE ?';
    let name = '%'+searchTerm+'%'
    db.all(sql, [name], (err,rows)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: 'Failed to find the searched item'})
            return;
        }
        res.render('searchResults.ejs', {results: rows, searchedName: searchTerm})
    })
  })
//handle the quick update of quantify from the dashboard
app.post('/update-quantity/:id',(req,res)=>{
    const {id} = req.params;
    const {quantity} = req.body;
    sql = 'UPDATE products SET quantity = ? WHERE id = ?'
    db.run(sql,[quantity, id],(err)=>{
        if(err){
            console.error(err)
            res.status(500).json({error: "Couldn't update quantity from dashboard"})
            return;
        }
        res.redirect('/')
    })
  })
//the route used to generate a table with the entire database
app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
      if (err) {
        throw err;
      }
      res.render('table.ejs', { products: rows });
    });
  });
//displays the message page with a message if the user tries to access a non-existent route
app.get('*',(req,res)=>{
    res.render('error.ejs',{message: 'Could not find that page!'})
})








app.listen(5000,()=>{
    console.log('The server is running on port 5000!')
})