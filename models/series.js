const mongoose = require('mongoose');

const ProductSeriesSchema = new mongoose.Schema({
    name: String,
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    productionStartDate: Date,
    productionEndDate: Date,
    image: String,
    description: String
});

const ProductSeries = mongoose.model('ProductSeries', ProductSeriesSchema);

module.exports = ProductSeries;