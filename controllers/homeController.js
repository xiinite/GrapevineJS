var model = require('../models/Character.js');

module.exports = {
    'home': function(req, res, next){
        model.find({googleId: req.user.googleId}, function(err, result){
            if(err) return next(new Error(err));
            res.render('index', {user: req.user, characters: result});
        });
    },
    'login': function(req, res){
        res.render('login', {layout: '_layoutNoAuth'});
    }
}