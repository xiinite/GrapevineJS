var model = require('../models/User.js');
var uuid = require('node-uuid');
var json2html = require('json2html');

var ViewTemplatePath = 'user';
module.exports = {
    'index': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'profile': function (req, res, next) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/profile", out);
    },
    'all': function (req, res, next) {
        if (req.user.isSuperAdmin) {
            model.all(function (err, result) {
                res.json(result);
            })
        } else if(req.user.isAdmin)
        {
            model.list({}, function(err, result){
                res.json(result);
            });
        } else {
            res.json("forbidden");
        }
    },
    'show': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        if (req.params.id) {
            model.find({"googleId": req.params.id}, function (err, result) {
                var out = {user: req.user, profile: result[0]};

                res.render(ViewTemplatePath + "/show", out);
            });
        }
    },
    'find': function (req, res, next){
        if(!req.user.isSuperAdmin && req.params.id != req.user.googleId){
            res.json("forbidden");
            return;}

        if (req.params.id) {
            model.find({"googleId": req.params.id}, function (err, result) {
                if(err)
                {
                    res.err(err);
                }else
                {
                    res.json(result[0]);
                }

            });
        }
    },
    'clear': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        model.clear(function () {
            res.json('ok')
        });
    },
    'updateStylesheet': function(req, res, next){
        model.update(req.user.googleId, {stylesheet: req.body.stylesheet}, function (err) {
            if (err) {
                res.json(err);
            }
            else {
                res.json("ok");
            }
        });
    },
    'toggleSuperAdmin': function (req, res, next) {
        if (!req.user.isSuperAdmin) { res.json("forbidden"); return;}
        model.find({"googleId": req.params.id}, function (err, result) {
            if (result[0]._doc.isSuperAdmin) {
                model.update(req.params.id, {'isSuperAdmin': false}, function (err2, numAffected) {
                    if (err2) {
                        res.json(err2);
                        return;
                    }
                    if (!err2) res.json(numAffected);
                });
            }
            else {
                model.update(req.params.id, {'isSuperAdmin': true}, function (err2, numAffected) {
                    if (err2) {
                        res.json(err2);
                        return;
                    }
                    if (!err2) res.json(numAffected);
                });
            }
        });
    },
    'populate': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
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
                if (err) {
                    res.json(err);
                    return;
                }
                if (!err)res.json(result);
            })
        });
    }
};