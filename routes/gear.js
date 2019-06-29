const express = require('express'),
      router = express.Router(),
      cloudinary = require('cloudinary'),
      multipart = require("connect-multiparty"),
      MultiPartMiddlware = multipart(),
      Image = require('../models/images'),
      Brand = require('../models/brands'),
      Gear = require('../models/gear');

cloudinary.config({ 
    cloud_name: 'geartracker', 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
});
        
router.get('/gear', (req, res) => {
    Gear.find({}, (err, allGear) => {
        if (err) {
            res.send('an error occured');
            console.log(err);
        }
        else {
            res.render('all-gear', {gear: allGear});
        }
    });
});

router.get('/gear/add', (req, res) => {
    Brand.find({}, (err, allBrands) => {
        if (err) {
            res.send('error gathering brands');
            console.log(err);
        }
        else {
            res.render('add-products.ejs', {brands: allBrands});
        }
    });
});

router.post('/gear/add', MultiPartMiddlware, async (req, res) => {
    let imgUrl = await saveImage(req.files);
    if (imgUrl === -1) {
        console.log("error saving image");
        res.send("error saving message");
    }
    let data = req.body;
    let newGear = {
        name: data.name,
        series: data.series,
        brand: data.brand,
        kilonewtons: data.kn,
        description: data.desc,
        image: imgUrl,
        category: data.cat
    };
    Gear.create(newGear, (err, gear) => {
        if (err) {
            res.send('error');
            console.log(err);
        }
        else {
            res.send('gear added!');
            //console.log(gear);
        }
    });
});

router.get("/gear/:id/edit", (req, res) => {
    Gear.findById(req.params.id, (err, foundGear) => {
        if (err) {
            console.log(err);
            res.send("error finding gear");
        }
        else {
            res.render("edit-gear", {gear: foundGear});
        }
    });
});

router.post('/gear/:id/edit', MultiPartMiddlware, async (req, res) => {
    // this route will only update the image as of right now
    let data = req.body;
    let imgUrl = await saveImage(req.files, req.params.id);
    if (imgUrl === -1) {
        console.log("error saving image");
        res.json({err: "error saving message"});
    }
    else {
        console.log(`image url equals ${imgUrl}`);
        Gear.findOneAndUpdate({_id: req.params.id}, {image: imgUrl}, (err, foundGear) => {
            if (err) {
                console.log(err);
                res.json({error: {
                    err: err,
                    message: 'error finding gear'
                }});
            }
            else {
                console.log(foundGear);
                res.json({gear: foundGear});
            }
        });
    }
});

function saveImage(file) {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(file.image.path, function(err, result) {
            if (err) {
                console.log(err);
                return reject(-1);
            }
            else {
                let image = {
                    title: result.original_filename,
                    createdAt: new Date(),
                    imageURL: result.url,
                    imageId: result.public_id
                };
                Image.create(image, (err, newImage) => {
                    if (err) {
                        console.log(err);
                        return reject(-1);
                    }
                    else {
                        console.log("image saved");
                        resolve(newImage.imageURL);
                    }
                });
            }
        });
    });
}

module.exports = router;