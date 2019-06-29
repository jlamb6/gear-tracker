const express = require('express'),
      router = express.Router(),
      Category = require('../../models/categories');

router.get("/", (req, res) => {
    Category.find({}, (err, allCats) => {
        if (err) {
            res.send('error pulling categories');
            console.log(err);
        }
        else {
            res.json({categories: allCats});
        }
    });
});

module.exports = router;