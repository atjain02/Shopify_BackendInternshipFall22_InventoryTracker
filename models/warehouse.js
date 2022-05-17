const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    details: {
        type: String,
    },
    items: {
        type: [mongoose.SchemaTypes.ObjectId],
    },
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
module.exports = Warehouse;
