const express = require("express"),
      router = express.Router(),
      User = require("../../models/users"),
      UserGear = require("../../models/user-gear");

router.get("/", (req, res) => {
    User.find({}, (err, allUsers) => {
        if (err) {
            console.log(err);
            res.json({error: err});
        }
        else {
            res.json({users: allUsers});
        }
    });
});

router.post("/", (req, res) => {
    //FIXME: secure route
    let data = req.body;
    let user = {
        fullName: data.name,
        email: data.email,
        uid: data.uid
    };
    User.create(user, (err, newUser) => {
        if (err) {
            console.log(err);
            res.json({error: err});
        }
        else {
            console.log(newUser);
            res.json({user: newUser});
        }
    });
});

router.delete("/:id/gear/:gearId", (req, res) => {
    //FIXME: secure route
    res.send('Got a DELETE request at /user');
});

router.post("/:id/gear/:gearid/rack", (req, res) => {
    //FIXME: secure route
    let data = req.body;
    UserGear.findByIdAndUpdate(req.params.gearId, {$push: {racks: data.rack}}, (err, foundGear) => {
        if (err) {
            console.log(err);
            res.json({error: err});
        }
        else {
            res.json({gear: foundGear});
        }
    });
});

module.exports = router;