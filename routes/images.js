const express = require("express"),
      router = express.Router(),
      cloudinary = require('cloudinary'),
      multipart = require("connect-multiparty"),
      MultiPartMiddlware = multipart(),
      Image = require('../models/images'),
      UserGear = require('../models/user-gear');

cloudinary.config({ 
    cloud_name: 'geartracker', 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
});

router.get("/images/add", (req, res) => {
    res.render("upload-images");
});

router.post("/images/add", MultiPartMiddlware, (req, res) => {
    cloudinary.v2.uploader.upload(req.files.image.path, function(err, result) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            //save the image into the database and add the image url to the usergear document
            let image = {
                title: result.original_filename,
                owner: req.body.user,
                createdAt: new Date(),
                imageURL: result.url,
                imageId: result.public_id
            };
            Image.create(image, (err, newImage) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                else {
                    //save image to the piece of gear
                    res.send("image added");
                }
            });
            //res.send(result);
        }
    });
});

module.exports = router;