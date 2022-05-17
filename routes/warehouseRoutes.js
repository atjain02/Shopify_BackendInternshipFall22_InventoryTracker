const express = require('express');
const Item = require('../models/item.js');
const Warehouse = require('../models/warehouse.js');

const router = express.Router();

//view all warehouses
router.get('/warehouses', (req, res) => {
    Warehouse.find()
        .then(result => {
            res.render('warehouses', { title : "Warehouses", warehouses: result });
        })
        .catch(err => console.log(err));
});

//view one warehouse
router.get('/createWarehouse', (req, res) => {
    res.render('createWarehouse', { title : "Create Warehouse" });
});

//create new warehouse
router.post('/warehouses', (req, res, next) => {
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

//render create warehouse page
router.get('/warehouses/:id', (req, res) => {
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

//delete warehouse
router.delete('/warehouses/:id', (req, res) => {
    Warehouse.findByIdAndDelete(req.params.id)
        .then(result => res.end())
        .catch(err => console.log(err));
});

//render edit warehouse page
router.get('/editWarehouse/:id', (req, res) => {
    Warehouse.findById(req.params.id)
        .then((warehouse) => res.render('editWarehouse', { title : `Edit ${warehouse.name}`, warehouse }))
        .catch(err => console.log(err));
});

//edit warehouse
router.post('/editWarehouse/:id', (req, res) => {
    Warehouse.findByIdAndUpdate(req.params.id, req.body)
        .then(result => res.redirect('/warehouses'))
        .catch(err => console.log(err)); //don't just console.log the errors -> do something
});

module.exports = router;