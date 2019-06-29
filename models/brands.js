const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: String,
    description: String,
    countryOfOrigin: String,
    headquarters: [String],
    logo: String
});

const Brand = mongoose.model('Brand', BrandSchema);

module.exports = Brand;