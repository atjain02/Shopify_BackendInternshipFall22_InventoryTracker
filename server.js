const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/item.js');
const Warehouse = require('./models/warehouse.js');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

const db = 'mongodb+srv://app:DXW50qcaRDL7A40f@shopifyinventorytracker.ykevh.mongodb.net/InventoryTracker?retryWrites=true&w=majority';
mongoose.connect(db)
    .then((result) => app.listen(PORT))
    .catch((err) => console.log(err));

app.set('view engine', 'ejs');

//middleware
app.use(morgan('dev'));
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
        .then(result => {
            return Warehouse.findOneAndUpdate({ name: req.body.warehouse }, {"$push": { "items": result.id }});
        })
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err)); //don't just console.log the errors -> do something
});

app.delete('/items/:id', (req, res) => {
    Item.findByIdAndDelete(req.params.id)
        .then(result => {
            return Warehouse.findOneAndUpdate({ name: result.warehouse }, {"$pull": { "items": req.params.id }});
        })
        .then(result => res.end())
        .catch(err => console.log(err));
});

app.get('/create', (req, res) => {
    Warehouse.find()
             .then(warehouses => {
                res.render('create', { title : "Create Item", warehouses });
             })
             .catch(err => console.log(err));
});

app.get('/edit/:id', (req, res) => {
    let item;
    Item.findById(req.params.id)
        .then(result => {
            item = result;
            return Warehouse.find();
        })
        .then((warehouses) => res.render('edit', { title : `Edit ${item.name}`, item, warehouses }))
        .catch(err => console.log(err));
});

app.post('/edit/:id', (req, res) => {
    Item.findByIdAndUpdate(req.params.id, req.body)
        .then(result => {
            if (!(req.body.warehouse === result.warehouse)) {
                if (result.warehouse === "N/A") {
                    return true;
                }
                return Warehouse.findOneAndUpdate({ name: result.warehouse }, {"$pull": { "items": req.params.id }});
            }
            return false;
        })
        .then(result => {
            if (result) {
                return Warehouse.findOneAndUpdate({ name: req.body.warehouse }, {"$push": { "items": req.params.id }});
            }
        })
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err)); //don't just console.log the errors -> do something
});

app.get('/warehouses', (req, res) => {
    Warehouse.find()
        .then(result => {
            res.render('warehouses', { title : "Warehouses", warehouses: result });
        })
        .catch(err => console.log(err));
});

app.get('/createWarehouse', (req, res) => {
    res.render('createWarehouse', { title : "Create Warehouse" });
});

app.post('/warehouses', (req, res, next) => {
    const warehouse = new Warehouse(req.body);
    warehouse.save()
        .then(result => res.redirect('/warehouses'))
        .catch(err => {
            if(err.name === 'MongoServerError' && err.code === 11000) {
                console.log("unique warehouse name error");
                res.render('error', {title : 'Duplicate Warehouse', error : `Warehouse with the name, ${req.body.name}, already exists!`});
            } else {
                console.log(err.name)
                next(err);
            }
        }); //don't just console.log the errors -> do something
});

app.get('/warehouses/:id', (req, res) => {
    let warehouse;
    Warehouse.findById(req.params.id)
        .then(result => {
            warehouse = result;
            return Item.find({ '_id': { $in: warehouse.items } })
        })
        .then(items => res.render('warehouse', { title : warehouse.name, warehouse, items }))
        .catch(err => {
            console.log(err);
            res.status(404).end();
        });
});

app.delete('/warehouses/:id', (req, res) => {
    Warehouse.findByIdAndDelete(req.params.id)
        .then(result => res.end())
        .catch(err => console.log(err));
});

app.get('/editWarehouse/:id', (req, res) => {
    Warehouse.findById(req.params.id)
        .then((warehouse) => res.render('editWarehouse', { title : `Edit ${warehouse.name}`, warehouse }))
        .catch(err => console.log(err));
});

app.post('/editWarehouse/:id', (req, res) => {
    Warehouse.findByIdAndUpdate(req.params.id, req.body)
        .then(result => res.redirect('/warehouses'))
        .catch(err => console.log(err)); //don't just console.log the errors -> do something
});

app.use((req, res) => {
    res.status(404).render('error', { title : '404', error : '404, page not found!' });
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).render('error', { title : '500', error :  '500, internal server error!'});
})