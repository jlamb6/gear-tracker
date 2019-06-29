const express = require('express'),
      router = express.Router(),
      Category = require('../models/categories');

router.get('/categories', (req, res) => {
    res.send('categories page');
});

router.get('/categories/add', (req, res) => {
    res.render('add-category');
});

router.post('/categories/add', (req, res) => {
    let data = req.body;
    let cat = {
        name: data.name,
        description: data.desc
    };
    Category.create(cat, (err, newCat) => {
        if (err) {
            res.send('error creating category');
            console.log(err);
        }
        else {
            res.send('category added!');
            console.log(newCat);
        }
    });
});

module.exports = router;