const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    title: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: Date,
    imageURL: String,
    imageId: String
});

const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;