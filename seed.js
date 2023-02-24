const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/inventory-app',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});    
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () =>{
    console.log("Database connected")
})

const products = [
    {
        name: 'Desk',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a6',
        price: 100,
        qty: 40
    },
    {
        name: 'Chair',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a6',
        price: 30,
        qty: 60
    },
    {
        name: 'Shelf',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a6',
        price: 20,
        qty: 100
    },
    {
        name: 'Printing paper',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a4',
        price: 5,
        qty: 136
    },
    {
        name: 'Pens',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a4',
        price: 1,
        qty: 463
    },
    {
        name: 'Printer Ink',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a4',
        price: 15,
        qty: 72
    },
    {
        name: 'Desk cleaner',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a5',
        price: 5,
        qty: 30
    },
    {
        name: 'Cleaning towel',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        category: '63f7c91d46fb18ccf5a2f4a5',
        price: 6,
        qty: 24
    }
]
