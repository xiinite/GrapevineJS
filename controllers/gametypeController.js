var model = require('../models/Gametype.js');
var uuid = require('node-uuid');
var sec = require('../bin/securityhandler.js');

var ViewTemplatePath = 'gametype';
module.exports = {
    'index': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'edit': function(req, res, next){
        if (!sec.checkSU(req, next)) {
            return;
        }
        var out = {user: req.user, gametypeid: {id: req.params.id}};
        res.render(ViewTemplatePath + "/edit", out);
    },
    'show': function(req, res){
        var out = {user: req.user, gametypeid: {id: req.params.id}};
        res.render(ViewTemplatePath + "/show", out);
    },
    'all': function(req, res){
        model.all(function(err, result){
            if(err) return next(new Error(err));
            return res.json(result);
        });
    },
    'find': function(req, res, next) {
        var id = req.params.id;
        model.find({id: id}, function(err, result){
            if(err) return next(new Error(err));
            return res.json(result);
        })
    },
    'update': function(req, res, next){
        if (!sec.checkSU(req, next)) {
            return;
        }
        if (req.body.event.id) {
            model.find({"id": req.body.event.id}, function (err, result) {
                if(err) return next(new Error(err));
                var gametype = req.body.gametype;
                delete gametype._id;
                model.update(gametype.id, gametype, function (err) {
                    if(err) return next(new Error(err));
                    res.json("ok");
                });
            });
        }
    },
    'new': function(req, res, next){
        if (!sec.checkSU(req, next)) {
            return;
        };
        var gametype = {};
        model.insert(gametype, function (err) {
            if(err) return next(new Error(err));
            var out = {
                user: req.user,
                event: event
            };
            return res.render(ViewTemplatePath + "/edit", out);
        });
    },
    'delete': function(req,res,next){
        if (!sec.checkSU(req, next)) {
            return;
        }
        if (req.body.ids) {
            model.remove({id: {$in: req.body.ids}}, function (err) {
                if (err) return next(new Error(err));

                res.json("ok");
            });
        }
    },
    'clear': function(req,res,next){
        if (!sec.checkSU(req, next)) {
            return;
        }
        model.remove({}, function (err) {
            if (err) return next(new Error(err));

            res.json("ok");
        });
    }
};