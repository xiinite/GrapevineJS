var model = require('../models/Character.js');

module.exports = {
    'home': function (req, res, next) {
        model.find({googleId: req.user.googleId}, function (err, result) {
            if (err) return next(new Error(err));
            if (req.user.isAdmin) {
                model.count({
                        state: {$in: ["Approval pending", "Background Submitted"]}, chronicle: {
                            $in: req.user.chronicles.map(function (c) {
                                return c.id;
                            })
                        }
                    }, function (err, c) {
                        if(err) return next(new Error(err));
                        res.render('index', {user: req.user, characters: result, approvals: c});
                    }
                );
            }else{
                res.render('index', {user: req.user, characters: result, approvals: 0});
            }
        });
    },
    'login': function (req, res) {
        res.render('login', {layout: '_layoutNoAuth'});
    }
};