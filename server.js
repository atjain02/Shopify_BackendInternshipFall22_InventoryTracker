const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Item = require('./models/item.js');
const PORT = process.env.PORT || 3000;

const db = 'mongodb+srv://app:DXW50qcaRDL7A40f@shopifyinventorytracker.ykevh.mongodb.net/InventoryTracker?retryWrites=true&w=majority';
mongoose.connect(db)
    .then((result) => app.listen(PORT))
    .catch((err) => console.log(err));

app.set('view engine', 'ejs');

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/items');
});

app.get('/items', (req, res) => {
    Item.find()
        .then(result => {
            res.render('index', { title : "Inventory", items: result });
        })
        .catch(err => console.log(err));
});

app.get('/items/:id', (req, res) => {
    Item.findById(req.params.id)
        .then(item => res.render('item', { title : item.name, item }))
        .catch(err => {
            console.log(err);
            res.status(404).end();
        });
});

app.post('/items', (req, res) => {
    const item = new Item(req.body);
    item.save()
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err)); //don't just console.log the errors -> do something
});

app.delete('/items/:id', (req, res) => {
    Item.findByIdAndDelete(req.params.id)
        .then(result => res.end())
        .catch(err => console.log(err));
});

app.get('/create', (req, res) => {
    res.render('create', { title : "Create Item" });
});

app.get('/edit/:id', (req, res) => {
    Item.findById(req.params.id)
        .then((item) => res.render('edit', { title : `Edit ${item.name}`, item }))
        .catch(err => console.log(err));
});

app.post('/edit/:id', (req, res) => {
    Item.findByIdAndUpdate(req.params.id, req.body)
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err)); //don't just console.log the errors -> do something
});

app.use((req, res) => {
    res.status(404).end();
})