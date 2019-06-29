const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    fullName: String,
    password: String,
    location: String,
    profileImg: String,
    age: Number,
    email: String,
    climbingAreas: [String],
    climbingStyles: {
        sport: {
            checked: {
                type: Boolean,
                default: false
            },
            lead: String,
            follow: String
        },
        trad: {
            checked: {
                type: Boolean,
                default: false
            },
            lead: String,
            follow: String
        },
        ice: {
            checked: {
                type: Boolean,
                default: false
            },
            lead: String,
            follow: String
        },
        aid: {
            checked: {
                type: Boolean,
                default: false
            },
            lead: String,
            follow: String
        },
        boulder: {
            checked: {
                type: Boolean,
                default: false
            },
            grade: String
        }
    },
    gear: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserGear"
    }]
});

UserSchema.plugin(passportLocalMongoose);

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
/*
UserSchema.pre("save", function(next) {
    let item = this;
    User.find({email: item.email}, function(err, docs) {
        if (!docs.length) {
            next();
        }
        else {
            console.log('user exists: ', item.email);
            throw new Error("user already exists");
        }
    });
});
*/
const User = mongoose.model('User', UserSchema);

module.exports = User;