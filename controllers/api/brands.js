const express = require('express'),
      router = express.Router(),
      Brand = require('../../models/brands'),
      Gear = require("../../models/gear"),
      ProductSeries = require("../../models/series");

router.get("/", (req, res) => {
    Brand.find({}, (err, allBrands) => {
        if (err) {
            res.json({message: 'error gathering brands'});
            console.log(err);
        }
        else {
            res.json({brands: allBrands});
        }
    });
});

router.get("/:id", (req, res) => {
    Brand.findById(req.params.id, (err, foundBrand) => {
        if (err) {
            res.json({message: "error finding brand id " + req.params.id});
            console.log(err);
        }
        else {
            res.json({brand: foundBrand});
        }
    });
});

router.get("/:id/series", (req, res) => {
    ProductSeries.find({brand: req.params.id}).populate("brand").exec(function(err, foundSeries) {
        if (err) {
            res.json({message: `error finding series for brand id ${req.params.id}`});
            console.log(err);
        }
        else {
            res.json({series: foundSeries});
        }
    });
});

router.get("/:id/gear", (req, res) => {
    Gear.find({brand: req.params.id}, (err, brandProducts) => {
        if (err) {
            res.json({message: "err finding brand gear"});
            console.log(err);
        }
        else {
            res.json({gear: brandProducts});
        }
    });
});

module.exports = router;