const express = require('express');
const mongoose = require('mongoose');
const itemRoutes = require('./routes/itemRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//mongodb
const db = 'mongodb+srv://app:DXW50qcaRDL7A40f@shopifyinventorytracker.ykevh.mongodb.net/InventoryTracker?retryWrites=true&w=majority';
mongoose.connect(db)
    .then((result) => app.listen(PORT))
    .catch((err) => console.log(err));

//ejs
app.set('view engine', 'ejs');

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//routes
app.get('/', (req, res) => {
    res.redirect('/items');
});

app.use(itemRoutes);
app.use(warehouseRoutes);

//error handling
app.use((req, res) => {
    res.status(404).render('error', { title : '404', error : '404, page not found!' });
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).render('error', { title : '500', error :  '500, internal server error!'});
})