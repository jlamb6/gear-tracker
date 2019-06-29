const express = require("express"),
      router = express.Router(),
      middleware = require("../../middleware/sign-up"),
      UserGear = require("../../models/user-gear");

router.put("/:id", async (req, res) => {
    //FIXME: secure route
    let data = req.body;
    let fallInfo = fall(data);
    let fallSaved = await addFall(req.params.id, fallInfo);
    if (fallSaved) {
        console.log("fall saved");
        //res.json({msg: "fall saved"});
    }
    else {
        console.log("failed to save fall");
        //res.json({msg: "failed to save fall"});
    }
    let updateQuery = {
        dateOfPurchase: data.dateOfPurchase,
        dateOfManufacturing: data.dateOfManufacturing,
        condition: data.condition,
        marker: data.marker
    };
    UserGear.findByIdAndUpdate(req.params.id, updateQuery, (err, foundGear) => {
        if (err) {
            console.log(err);
            //res.redirect("back", {err: "Error saving changes."});
            res.json({error: err});
        }
        else {
            //res.redirect("back", {success: "Successfully saved changes."});
            res.json({gear: foundGear});
        }
    });
});

router.post("/:id/rack", (req, res) => {
    //FIXME: secure route
    let data = req.body;
    if (data.task === "add") {
        UserGear.findByIdAndUpdate(req.params.id, {$push: {racks: data.rack}}, (err, foundGear) => {
            if (err) {
                console.log(err);
                res.json({error: err});
            }
            else {
                res.json({gear: foundGear});
            }
        });
    }
    else if (data.task === "remove") {
        UserGear.findByIdAndUpdate(req.params.id, {$pull: {racks: data.rack}}, (err, foundGear) => {
            if (err) {
                console.log(err);
                res.json({error: err});
            }
            else {
                res.json({gear: foundGear});
            }
        });
    }
});

router.post("/:id/falls", (req, res) => {
    //FIXME: secure route
    let data = req.body;
    let fall = data.fall;
    UserGear.findByIdAndUpdate(req.params.id, {$push: {falls: fall}}, (err, foundGear) => {
        if (err) {
            console.log(err);
            res.json({error: err});
        }
        else {
            res.json({gear: foundGear});
        }
    });
});

const fall = (info) => {
    if (info.date === '' || info.size === '' || info.factor === '') {
        return false;
    }
    else {
        let data = {
            date: info.date,
            size: info.size,
            factor: info.factor
        };
        return data;
    }
}

const fallFields = ['factor', 'size', 'date'];

const queryParams = (info) => {
    let keys = Object.keys(info);
    let data = {};
    keys.forEach(key => {
        if (info[key] !== '' && !fallFields.includes(key)) {
            data[key] = info[key];
        }
    });
    return data;
}

const addFall = (id, fall) => {
    if (!fall) {
        console.log("addFall: fall set to false");
        return false;
    }
    else {
        UserGear.findByIdAndUpdate(id, {$push: {falls: fall}}, (err, foundGear) => {
            if (err) {
                console.log(err);
                return false;
            }
            else {
                return true;
            }
        });
    }
}

module.exports = router;