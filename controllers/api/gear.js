const express = require('express'),
      router = express.Router(),
      cloudinary = require('cloudinary'),
      multipart = require("connect-multiparty"),
      MultiPartMiddlware = multipart(),
      Image = require('../../models/images'),
      Gear = require('../../models/gear');

cloudinary.config({ 
    cloud_name: 'geartracker', 
    api_key: '966551439368337', 
    api_secret: 'QJZN7moOAjAF7isdjczxmc_S4lg' 
});
        
router.get('/add', (req, res) => {
    res.send('add gear here');
});

router.post('/add', (req, res) => {
    let data = req.body;
    let newGear = {
        name: data.name,
        series: data.series,
        brand: data.brand,
        kilonewtons: data.kn,
        description: data.desc
    };
    Gear.create(newGear, (err, gear) => {
        if (err) {
            res.send('error');
            console.log(err);
        }
        else {
            res.send('gear added!');
            console.log(gear);
        }
    });
});

router.get('/:id', (req, res) => {
    Gear.findById(req.params.id).populate("brand").populate("series").exec(function(err, foundGear) {
        if (err) {
            console.log(err);
            res.json({error: {
                err: err,
                message: 'error finding gear'
            }});
        }
        else {
            res.json({gear: foundGear});
        }
    });
});

router.post('/:id', MultiPartMiddlware, async (req, res) => {
    // this route will only update the image as of right now
    let data = req.body;
    let imgUrl = await saveImage(data.file, req.params.id);
    if (imgUrl === -1) {
        console.log("error saving image");
        res.json({err: "error saving message"});
    }
    else {
        console.log(`image url equals ${imgUrl}`);
        Gear.findOneAndUpdate({_id: req.params.id}, {$push: {images: imgUrl}}, (err, foundGear) => {
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

function saveImage(file, user) {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(file.image.path, function(err, result) {
            if (err) {
                console.log(err);
                return reject(-1);
            }
            else {
                let image = {
                    title: result.original_filename,
                    owner: user,
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