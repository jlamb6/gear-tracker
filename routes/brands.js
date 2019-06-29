const express = require('express'),
      router = express.Router(),
      Brand = require('../models/brands');

router.get('/brands', (req, res) => {
    Brand.find({}, (err, allBrands) => {
        if (err) {
            res.send('error');
            console.log(err);
        }
        else {
            res.render("all-brands", {brands: allBrands});
        }
    });
});

router.get('/brands/add', (req, res) => {
    res.render('add-brand');
});

router.post('/brands/add', (req, res) => {
    let data = req.body;
    let brand = {
        name: data.name,
        description: data.desc,
        countryOfOrigin: data.origin,
        headquarters: [data.hq],
        logo: data.logo
    };
    Brand.create(brand, (err, newBrand) => {
        if (err) {
            res.send('error creating brand');
            console.log(err);
        }
        else {
            res.send('brand added!');
            console.log(newBrand);
        }
    });
});

module.exports = router;