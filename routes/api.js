const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/all-products',(req, res)=>{
    db.all('SELECT * FROM products', (err, rows)=>{
        if(err){
            console.error(err.message)
            res.status(500).json({error: 'Internal server error'})
            return;
        }
        res.render('browse.ejs', {products: rows})
    })
})

module.exports = router;