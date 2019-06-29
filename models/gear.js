const mongoose = require('mongoose');

const GearSchema = new mongoose.Schema({
    name: String,
    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductSeries"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand"
    },
    image: String,
    kilonewtons: Number,
    description: String
});

const Gear = mongoose.model('Gear', GearSchema);

module.exports = Gear;