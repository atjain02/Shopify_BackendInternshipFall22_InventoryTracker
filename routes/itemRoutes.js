const express = require('express');
const Item = require('../models/item.js');
const Warehouse = require('../models/warehouse.js');

const router = express.Router();

//view all items
router.get('/items', (req, res) => {
    Item.find()
        .then(result => {
            res.render('index', { title : "Inventory", items: result });
        })
        .catch(err => console.log(err));
});

//view one item
router.get('/items/:id', (req, res) => {
    Item.findById(req.params.id)
        .then(item => res.render('item', { title : item.name, item }))
        .catch(err => {
            console.log(err);
            res.status(404).end();
        });
});

//create item
router.post('/items', (req, res) => {
    const item = new Item(req.body);
    item.save()
        .then(result => {
            return Warehouse.findOneAndUpdate({ name: req.body.warehouse }, {"$push": { "items": result.id }});
        })
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err)); //don't just console.log the errors -> do something
});

//delete item
router.delete('/items/:id', (req, res) => {
    Item.findByIdAndDelete(req.params.id)
        .then(result => {
            return Warehouse.findOneAndUpdate({ name: result.warehouse }, {"$pull": { "items": req.params.id }});
        })
        .then(result => res.end())
        .catch(err => console.log(err));
});

//render create item page
router.get('/create', (req, res) => {
    Warehouse.find()
             .then(warehouses => {
                res.render('create', { title : "Create Item", warehouses });
             })
             .catch(err => console.log(err));
});

//render edit item page
router.get('/edit/:id', (req, res) => {
    let item;
    Item.findById(req.params.id)
        .then(result => {
            item = result;
            return Warehouse.find();
        })
        .then((warehouses) => res.render('edit', { title : `Edit ${item.name}`, item, warehouses }))
        .catch(err => console.log(err));
});

//edit item
router.post('/edit/:id', (req, res) => {
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

module.exports = router;