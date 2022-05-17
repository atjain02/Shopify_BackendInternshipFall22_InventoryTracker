const express = require('express');
const Item = require('../models/item.js');
const Warehouse = require('../models/warehouse.js');

const router = express.Router();

//view all warehouses
router.get('/warehouses', (req, res, next) => {
    Warehouse.find()
        .then(result => {
            res.render('warehouses', { title : "Warehouses", warehouses: result });
        })
        .catch(err => next(err));
});

//render create warehouse page
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
                res.render('error', {title : 'Duplicate Warehouse', error : `Warehouse with the name, ${req.body.name}, already exists!`});
            } else {
                next(err);
            }
        });
});

//view one warehouse
router.get('/warehouses/:id', (req, res) => {
    let warehouse;
    Warehouse.findById(req.params.id)
        .then(result => {
            warehouse = result;
            return Item.find({ '_id': { $in: warehouse.items } });
        })
        .then(items => res.render('warehouse', { title : warehouse.name, warehouse, items }))
        .catch(err => {
            res.status(404).render('error', { title : '404', error : '404, page not found!' });
        });
});

//delete warehouse
router.delete('/warehouses/:id', (req, res, next) => {
    Warehouse.findByIdAndDelete(req.params.id)
        .then(result => {
            return Item.updateMany({ '_id': { $in: result.items } }, { 'warehouse': 'N/A' });
        })
        .then(result => res.end())
        .catch(err => next(err));
});

//render edit warehouse page
router.get('/editWarehouse/:id', (req, res, next) => {
    Warehouse.findById(req.params.id)
        .then((warehouse) => res.render('editWarehouse', { title : `Edit ${warehouse.name}`, warehouse }))
        .catch(err => next(err));
});

//edit warehouse
router.post('/editWarehouse/:id', (req, res, next) => {
    Warehouse.findByIdAndUpdate(req.params.id, req.body)
        .then(result => res.redirect('/warehouses'))
        .catch(err => next(err));
});

module.exports = router;