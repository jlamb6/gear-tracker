const mongoose = require('mongoose');

const UserGearSchema = new mongoose.Schema({
    base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gear"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    dateOfPurchase: Date,
    dateOfManufacturing: Date,
    condition: String,
    days: Number,
    falls: [{
        size: Number,
        date: Date,
        factor: String
    }],
    marker: String,
    images: [String],
    racks: [String],
    notes: String
});

UserGear = mongoose.model('UserGear', UserGearSchema);

module.exports = UserGear;