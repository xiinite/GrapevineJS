var model = require("../models/User.js");
var config = require("../config/configuration.js");
var url = require('url');
var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    uuid = require('node-uuid');
;

var sess = require('express-session');

//GOOGLE STRATEGY
passport.use(new GoogleStrategy({
        clientID: config.google.GOOGLE_CLIENT_ID,
        clientSecret: config.google.GOOGLE_CLIENT_SECRET,
        callbackURL: config.google.GOOGLE_RETURN_URL
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return model.find({googleId: profile.id}, function (err, user) {
                if (err) {
                    throw err;
                }
                else if (user.length === 0) {
                    profile.googleId = profile.id;
                    profile.id = uuid.v4();
                    model.insert(profile, function (err, user) {
                        return done(null, user);
                    });
                } else {
                    return done(null, user[0]);
                }
            });
        });
    }
));

//FACEBOOK STRATEGY
passport.use(new FacebookStrategy({
        clientID: config.facebook.FACEBOOK_CLIENT_ID,
        clientSecret: config.facebook.FACEBOOK_CLIENT_SECRET,
        callbackURL: config.facebook.FACEBOOK_RETURN_URL
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return model.find({googleId: profile.id}, function (err, user) {
                if (err) {
                    throw err;
                }
                else if (user.length === 0) {
                    profile.googleId = profile.id;
                    profile.id = uuid.v4();
                    model.insert(profile, function (err, user) {
                        return done(null, user);
                    });
                } else {
                    return done(null, user[0]);
                }
            });
        });
    }
));

/**
 * serializeUser
 * @param {Object} user
 * @param {Function} done
 */
passport.serializeUser(function (user, done) {
    done(null, user.googleId);
});

/**
 * deserializeUser
 * @param {Mixed} id
 * @param {Function} done
 */
passport.deserializeUser(function (id, done) {
    try {
        model.find({googleId: id}, function (err, user) {
            if(err)
            {
                sess.destroy();
            }
            done(err, user[0]);
        });
    } catch (error) {
        sess.destroy();
        //console.log("[User Deserialization Error] - oAuth deserializeUser - User not found. Could not deserialize user.");
        var emptyUser = {googleId: -1, name: "Anonymous"};
        done(null, emptyUser);
    }
});

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next(null);
    }
    res.redirect('/login');
};

module.exports = {
    'init': function initialize(app) {
        app.use(passport.initialize());
        app.use(passport.session());

        app.get('/auth/google',
            passport.authenticate('google', {
                scope: ['https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email']
            }),
            function () {
                // The request will be redirected to Google for authentication, so this
                // function will not be called.
            });

        app.get('/auth/google/callback',
            passport.authenticate('google', {failureRedirect: '/login', session: true}),
            function (req, res) {
                res.redirect("/");
            });

        app.get('/auth/facebook', passport.authenticate('facebook'));


        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect: '/',
                failureRedirect: '/login'
            }));

        app.get('/logout', function (req, res) {
            req.logout();
            res.redirect('/login');
        });

        app.all('*', function (req, res, next) {
            var path = url.parse(req.url).pathname;
            if (path === '/login')
                next();
            else
                ensureAuthenticated(req, res, next);
        });
        return function (req, res, next) {
            init(req, res, function () {
                sess(req, res, next);
            });
        };
    }
};
