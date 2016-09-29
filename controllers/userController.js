var model = require('../models/User.js');
var sec = require('../bin/securityhandler.js');

var ViewTemplatePath = 'user';
module.exports = {
    'index': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'profile': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/profile", out);
    },
    'all': function (req, res, next) {
        model.list({}, function (err, result) {
            if(err) return next(new Error(err));
            res.json(result);
        });
    },
    'show': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        if (req.params.id) {
            model.find({"googleId": req.params.id}, function (err, result) {
                if(err) return next(new Error(err));
                var out = {user: req.user, profile: result[0]};
                res.render(ViewTemplatePath + "/show", out);
            });
        }
    },
    'find': function (req, res, next) {
        if (!req.user.isSuperAdmin && req.params.id != req.user.googleId) {
            return next(new Error("forbidden"));
        }

        if (req.params.id) {
            model.find({"googleId": req.params.id}, function (err, result) {
                if(err) return next(new Error(err));
                    res.json(result[0]);
            });
        }
    },
    'clear': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        model.clear(function () {
            res.json('ok')
        });
    },
    'updateStylesheet': function (req, res, next) {
        model.update(req.user.googleId, {stylesheet: req.body.stylesheet}, function (err) {
            if(err) return next(new Error(err));
            res.json("ok");

        });
    },
    'updateEmail': function (req, res, next) {
        var emails = [];
        emails.push({value: req.body.email});
        model.update(req.user.googleId, {emails: emails}, function (err) {
            if(err) return next(new Error(err));
            res.json("ok");

        });
    },
    'toggleSuperAdmin': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        model.find({"googleId": req.params.id}, function (err, result) {
            if (result[0]._doc.isSuperAdmin) {
                model.update(req.params.id, {'isSuperAdmin': false}, function (err2, numAffected) {
                    if(err2) return next(new Error(err2));
                    if (!err2) res.json(numAffected);
                });
            }
            else {
                model.update(req.params.id, {'isSuperAdmin': true}, function (err2, numAffected) {
                    if(err2) return next(new Error(err2));
                    if (!err2) res.json(numAffected);
                });
            }
        });
    },
    'delete': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        if (req.body.id) {
            model.remove({googleId: req.body.id}, function (err) {
                if (err) return next(new Error(err));
                res.json("ok");
            });
        }
    },
    'populate': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        model.clear(function () {
            var superAdmin = {
                "isSuperAdmin": "true",
                "provider": "google",
                "displayName": "Joey Daemen",
                "name": {"familyName": "Daemen", "givenName": "Joey"},
                "googleId": "114799359163510443499",
                "_id": "53e3743c47eb326f43e63b36", "__v": 0,
                "emails": [{"value": "daemen.joey@gmail.com"}],
                "_raw": "{\n \"id\": \"114799359163510443499\",\n \"email\": \"daemen.joey@gmail.com\",\n \"verified_email\": true,\n \"name\": \"Joey Daemen\",\n \"given_name\": \"Joey\",\n \"family_name\": \"Daemen\",\n \"link\": \"https://plus.google.com/+JoeyDaemen\",\n \"picture\": \"https://lh4.googleusercontent.com/-bfhFXQ62pX4/AAAAAAAAAAI/AAAAAAAAAS4/P6PTWZlZVNw/photo.jpg\",\n \"gender\": \"male\",\n \"locale\": \"en\"\n}\n",
                "_json": {
                    "id": "114799359163510443499",
                    "email": "daemen.joey@gmail.com",
                    "verified_email": true,
                    "name": "Joey Daemen",
                    "given_name": "Joey",
                    "family_name": "Daemen",
                    "link": "https://plus.google.com/+JoeyDaemen",
                    "picture": "https://lh4.googleusercontent.com/-bfhFXQ62pX4/AAAAAAAAAAI/AAAAAAAAAS4/P6PTWZlZVNw/photo.jpg",
                    "gender": "male",
                    "locale": "en"
                }
            };
            model.insert(superAdmin, function (err, result) {
                if(err) return next(new Error(err));
                if (!err)res.json(result);
            })
        });
    }
};