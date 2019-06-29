const express = require('express'),
      router = express.Router(),
      Gear = require('../../models/gear'),
      ProductSeries = require('../../models/series');

router.get("/", (req, res) => {
    ProductSeries.find({}, (err, allSeries) => {
        if (err) {
            res.json({message: err});
        }
        else {
            res.json({series: allSeries});
        }
    });
});

router.get("/:id", (req, res) => {
    ProductSeries.find({brand: req.params.id}, (err, brandSeries) => {
        if (err) {
            res.json({message: 'error gathering brand series'});
            console.log(err);
        }
        else {
            //  console.log(brandSeries);
            res.json({series: brandSeries});
        }
    });
});

router.get("/:id/gear", (req, res) => {
    Gear.find({series: req.params.id}).populate("brand").exec(function(err, seriesGear) {
        if (err) {
            res.json({message: err});
            console.log(err);
        }
        else {
            res.json({gear: seriesGear});
            //console.log(seriesGear);
        }
    });
});

module.exports = router;