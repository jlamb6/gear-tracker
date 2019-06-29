const express = require('express'),
      router = express.Router(),
      ProductSeries = require("../models/series");

router.get("/series", (req, res) => {
    res.send("series page");
});

router.get("/series/add", (req, res) => {
    res.render("add-series");
});

router.post("/series/add", (req, res) => {
    let data = req.body;
    let newSeries = {
        name: data.name,
        brand: data.brand,
        productionStartDate: data.sdate,
        productionEndtDate: data.edate,
        description: data.desc
    };
    ProductSeries.create(newSeries, (err, series) => {
        if (err) {
            res.send('error creating new series');
            console.log(err);
        }
        else {
            res.send('new series added!');
            console.log(series);
        }
    });
});

module.exports = router;