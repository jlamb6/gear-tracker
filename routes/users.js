const express = require('express'),
      router = express.Router(),
      _ = require('lodash'),
      cloudinary = require('cloudinary'),
      multipart = require("connect-multiparty"),
      middleware = require("../middleware/sign-up"),
      MultiPartMiddlware = multipart(),
      Image = require('../models/images'),
      User = require('../models/users'),
      UserGear = require('../models/user-gear'),
      Brand = require('../models/brands');

cloudinary.config({ 
    cloud_name: 'geartracker', 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
});
    
router.get('/users', (req, res) => {
    User.find({}, (err, allUsers) => {
        if (err) {
            res.send('an error occured');
            console.log(err);
        }
        else {
            res.render('users', {users: allUsers});
        }
    })
});

router.get('/users/:id', middleware.sessionChecker, (req, res) => {
    let userId = req.params.id;
    //console.log("in user profile route");
    User.findById(userId, (err, foundUser) => {
        if (err) {
            req.flash("error", "Sorry! We couldn't find that user.");
            res.redirect('/sign-in');
            console.log(err);
        }
        else {
            UserGear.find({owner: userId})
                .populate({
                    path: "base",
                    populate: [{ 
                                    path: "brand",
                                    model: "Brand"
                                },
                                {
                                    path: 'series',
                                    model: "ProductSeries"
                                }
                        ]
            })
            .exec(function (err, allGear) {
                if (err) {
                    req.flash("error", "Oops! Looks like we couldn't find your gear!");
                    res.send('error gathering gear');
                    console.log(err);
                }
                else {
                    res.render('user-profile', {user: foundUser, gear: _.orderBy(allGear, ['base.series.name', 'name'], ['asc', 'asc'])});
                }
            });
        }
    });
});

router.get('/users/:id/edit', middleware.isUser, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            console.log(err);
            res.json({err: err});
        }
        else {
            res.render("edit-profile", {user: foundUser});
        }
    });
});

router.post('/users/:id/edit', middleware.isUser, MultiPartMiddlware, async (req, res) => {
    let data = req.body;
    let imgUrl;
    if (Object.entries(req.files).length/* === 0 && req.files.constructor === Object*/) {
        try {
            imgUrl = await saveImage(req.files, req.params.id);
        }
        catch (err) {
            console.log(err);
            imgUrl = data.curImage;
        }
    }
    else {
        imgUrl = data.curImage;
    }
    //save image into cloudinary and then save as an image in mongodb
    if (imgUrl === -1) {
        console.log("error saving image");
        res.send("error saving message");
    }
    else {
        console.log(`image url equals ${imgUrl}`);
        //then add the image url to the usergear
        let update = {
            fname: data.fname,
            lname: data.lname,
            fullName: data.fname +  " " + data.lname,
            location: data.location,
            profileImg: imgUrl,
            climbingAreas: data.climbingAreas.split("||"),
            climbingStyles: {
                sport: {
                    checked: (data.sport === "sport") ? true: false,
                    lead: data.sportLead,
                    follow: data.sportFollow
                },
                trad: {
                    checked: (data.trad === "trad") ? true: false,
                    lead: data.tradLead,
                    follow: data.tradFollow
                },
                boulder: {
                    checked: (data.boulder === "boulder") ? true: false,
                    grade: data.boulderGrade
                },
                aid: {
                    checked: (data.aid === "aid") ? true: false,
                    lead: data.aidLead,
                    follow: data.aidFollow
                },
                ice: {
                    checked: (data.ice === "ice") ? true: false,
                    lead: data.iceLead,
                    follow: data.iceFollow
                }
            }
        };
        User.findOneAndUpdate({_id: req.params.id}, update, (err, user) => {
            if (err) {
                console.log(err);
                req.flash("error", "Couldn't update user profile.");
                res.redirect("back");
            }
            else {
                req.flash("success", "Your profile has been updated.");
                res.redirect(`/users/${user._id}`);
            }
        });
    }
});

router.get('/users/:id/gear', (req, res) => { //change this to 'users/:id/gear/add'
    Brand.find({}, (err, allBrands) => {
        if (err) {
            res.send('error gathering brands');
            console.log(err);
        }
        else {
            res.render('add-user-gear', {brands: _.orderBy(allBrands, 'name', 'asc'), user: req.params.id});
        }
    });
});

router.post('/users/:id/gear', /*MultiPartMiddlware, async*/ (req, res) => {
    let data = req.body;
    let newGear = {
        base: data.id,
        owner: req.params.id,
        dateOfPurchase: data.dop,
        dateOfManufacturing: data.dom,
        condition: data.condition,
        marker: data.marker,
        image: data.img,
        notes: data.notes
    };
    UserGear.create(newGear, (err, newGear) => {
        if (err) {
            res.send('error saving gear');
        }
        else {
            console.log(newGear);
            res.redirect('/users/' + req.params.id);
        }
    });
});

router.get('/users/:id/gear/:gearId', middleware.checkGearOwnership, (req, res) => {
    UserGear.findById(req.params.gearId).populate({
        path: 'base',
        populate: [{
            path: 'brand',
            model: 'Brand'
        }, {
            path: 'series',
            model: 'ProductSeries'
        }]
    }).exec(function(err, foundGear) {
        if (err) {
            res.send('error loading gear');
            console.log(err);
        }
        else {
            //console.log(foundGear);
            res.render("user-gear", {gear: foundGear, user: req.params.id});
        }
    });
});

router.delete("/users/:id/gear/:gearId", middleware.checkGearOwnership, (req, res) => {
    //res.send('Got a DELETE request at /user');
    UserGear.findByIdAndRemove(req.params.gearId, (err, gear) => {
        if (err) {
            console.log(err);
            req.flash("error", "There was a problem deleting your gear.");
            res.redirect("back");
        }
        else {
            req.flash("success", `Gear has been deleted.`);
            res.redirect("/users/" + req.params.id);
        }
    });
});

router.post("/users/:id/gear/:gearId/add-image", MultiPartMiddlware, async (req, res) => {
    let data = req.body;
    console.log(req.files);
    let imgUrl = await saveImage(req.files, req.params.id);
    //save image into cloudinary and then save as an image in mongodb
    if (imgUrl === -1) {
        console.log("error saving image");
        res.send("error saving message");
    }
    else {
        console.log(`image url equals ${imgUrl}`);
        //then add the image url to the usergear
        UserGear.findOneAndUpdate({_id: req.params.gearId}, {$push: {images: imgUrl}}, (err, foundGear) => {
            if (err) {
                console.log(err);
                res.send({error: "error saving images to gear"});
            }
            else {
                console.log(foundGear);
                res.send({success: "successfully saved image to gear"});
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