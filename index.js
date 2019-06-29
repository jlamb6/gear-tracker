require("dotenv").config();

const express                   = require('express'),
      bodyParser                = require('body-parser'),
      mongoose                  = require('mongoose'),
      flash                     = require("connect-flash"),
      methodOverride            = require('method-override'),
      session                   = require('express-session'),
      MongoStore                = require('connect-mongo')(session),
      cookieParser              = require('cookie-parser'),
      passport                  = require('passport'),
      LocalStrategy             = require('passport-local').Strategy,
      passportLocalMongoose     = require("passport-local-mongoose"),
      expressSanitizer          = require('express-sanitizer'),
      bcrypt                    = require("bcryptjs"),
      helmet                    = require("helmet"),
      User                      = require("./models/users"),
      app                       = express();
      
const gearRoutes                = require('./routes/gear'),
      gearApi                   = require('./controllers/api/gear'),
      userRoutes                = require('./routes/users'),
      userApi                   = require('./controllers/api/users'),
      categoryRoutes            = require('./routes/categories'),
      categoryApi               = require('./controllers/api/categories'),
      brandRoutes               = require('./routes/brands'),
      brandApi                  = require('./controllers/api/brands'),
      imageRoutes               = require("./routes/images"),
      seriesRoutes              = require('./routes/series'),
      seriesApi                 = require('./controllers/api/series'),
      authenticationRoutes      = require('./routes/authentication'),
      userGearApi               = require("./controllers/api/user-gear");

const hostname  = process.env.IP;
const port      = process.env.PORT;
const uri       = process.env.MONGO_URI;

mongoose.connect(uri, {useNewUrlParser: true, useFindAndModify: false });

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(flash());
app.use(helmet());

app.use(session({ 
    key: 'user',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
//app.use(passport.session());
//passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy(function(useremail, password, callback) {
    User.find({email: useremail}, (err, user) => {
        if (err) {
            console.log(err);
            return false;
        }
        else {
            bcrypt.compare(password, user.password, function(err, res) {
                if (err) return callback(err);
                if (res === false) {
                    return callback(null, false);
                } else {
                    return callback(null, user);
                }
            });
        }
    });
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    console.log("index.js");
    if (req.session && req.session.user) {
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        User.findOne({ email: req.session.user.email }, function(err, user) {
            if (user) {
                req.user = user;
                req.user.password = "blahhhhhh no password here!"
                req.session.user = user;  //refresh the session value   
                res.locals.currentUser = req.user;
            }
            next();
        });
    } 
    else {
        res.locals.currentUser = false;
        next();
    }
});

//==========//
//  Routes  //
//==========//
app.use(gearRoutes);
app.use(userRoutes);
app.use(brandRoutes);
app.use(seriesRoutes);
app.use(imageRoutes);
app.use(categoryRoutes);
app.use(authenticationRoutes);
app.use("/api/gear", gearApi);
app.use("/api/users", userApi);
app.use("/api/brands", brandApi);
app.use("/api/series", seriesApi);
app.use("/api/user-gear", userGearApi);
app.use("/api/categories", categoryApi);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});