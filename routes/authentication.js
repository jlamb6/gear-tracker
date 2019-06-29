const express = require('express'),
      router = express.Router(),
      bcrypt = require("bcryptjs"),
      passport = require("passport"),
      User = require('../models/users');

router.get("/", (req, res) => {
    res.render("landing.ejs");
});
    
router.get('/sign-up', (req, res) => {
    res.render("sign-up");
});

router.post('/sign-up', async (req, res) => {
    let data = req.body;
    let placeholderImage = "https://res.cloudinary.com/geartracker/image/upload/v1560721773/user-placeholder_wude9u.jpg";
    let user = {
        email: data.username,
        profileImg: placeholderImage
    };
    let exists = await User.findOne({email: user.email}).select("email").lean();
    if (!exists) {
        bcrypt.genSalt(12, function(err, salt) {
            if (err) return next(err);
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                if (err) return next(err);
                user.password = hash;
                User.create(user, (err, user) => {
                    if (err) {
                        res.send("an error occured");
                        console.log(err);
                    }
                    else {
                        let sess = req.session;
                        sess.user = user;
                        sess.user.password = "blahhhhh, no password here!";
                        req.flash('success', 'Welcome to Gear Tracker! Tell us about yourself.');
                        res.redirect(`users/${user._id}/edit`);
                    }
                });
            });
        });
    }
    else {
        // user already exists
        req.flash("error", "The password and/or username is incorrect.");
        res.redirect("back");
    }
});

router.get("/sign-in", (req, res) => {
    res.render("sign-in");
});

router.post("/sign-in", (req, res) => {
    User.findOne({email: req.body.username}, (err, foundUser) => {
        foundUser.comparePassword(req.body.password, function(err, isMatch) {
            try {
                if (err) throw err;
                sess = req.session;
                sess.user = foundUser;
                sess.user.password = "blahhhhh, no password here!";
                console.log(sess);
                req.flash("success", `Welcome back ${foundUser.fname}!`);
                res.redirect(`users/${foundUser._id}`);
            }
            catch (err) {
                // couldn't find that user
                res.json({err: err});
            }
        });
    });
});

router.get("/logout", (req, res) => {
    //let user = req.body.user;
    req.logout();
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        //req.flash("success", "Come back soon!");
        res.redirect('/sign-in');
    });
});

module.exports = router;