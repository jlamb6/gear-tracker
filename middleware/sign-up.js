const User = require("../models/users"),
      UserGear = require("../models/user-gear"),
      middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if (!req.user) {
        req.flash("error", "Oops! Looks like your session has expired.");
        res.redirect('/sign-in');
    } else {
        next();
    }
};

// middleware function to check for logged-in users
// this is working
middlewareObj.sessionChecker = (req, res, next) => { 
    console.log("checking session");
    console.log(req.session);
    if (!req.user || !req.session) res.redirect("/sign-in");
    if (req.session.user._id.equals(req.user._id)) {
        next();
    } else {
        req.flash("error", "Oops! Looks like your session has expired.");
        res.redirect('/sign-in');
    }    
};

middlewareObj.checkGearOwnership = function(req, res, next) {
    if (!req.user || !req.session) res.redirect("/sign-in");
    if (req.session.user._id.equals(req.user._id)) {
        UserGear.findById(req.params.gearId, function(err, foundGear){
            if (err) {
                req.flash("error", "Uh-Oh! We couldn't find that Gear!");
                res.redirect("back");
            } 
            else {
                if (!foundGear) {
                    req.flash("error", "Gear not found");
                    return res.redirect("back");
                }
                //does the user own the event?
                if (foundGear.owner.equals(req.user._id)) {
                    next();
                } 
                else {
                    req.flash("error", "Only the owner of the gear has permission to edit/delete their own gear.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that");
        res.redirect("back");
    }
}; 

middlewareObj.isUser = function(req, res, next) {
    console.log("running isUser middleware");
    if (!req.user || !req.session) res.redirect("/sign-in");
    if (req.session.user._id === req.user._id) { // FIXME: this might be needed to be changed to .equals
        User.findById(req.params.id, function(err, foundUser) {
            if (err) {
                res.redirect("/users");
            } 
            else {
                if (!foundUser) {
                    req.flash("error", "User not found");
                    res.redirect("back");
                } 
                if (foundUser._id.equals(req.user._id)) {
                    next();
                } 
                else {
                    req.flash("error", "You don't have permisson to do that");
                    res.redirect("back");
                }
            }
        });
    } 
    else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

module.exports = middlewareObj;