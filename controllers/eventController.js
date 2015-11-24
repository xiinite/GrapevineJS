var model = require('../models/Event.js');
var uuid = require('node-uuid');
var sec = require('../bin/securityhandler.js');

var ViewTemplatePath = 'event';
module.exports = {
    'index': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'find': function(req, res, next) {
        var filters = req.body.filters;
        filters.chronicleid = {
            $in: req.user.chronicles.map(function (c) {
                return c.id;
            })};
        model.find(filters, function(err, result){
            if(err) return next(new Error(err));
            return res.json(result);
        })
    },
    'edit': function(req, res){
        var out = {user: req.user, event: {id: req.params.id}};
        res.render(ViewTemplatePath + "/edit", out);
    },
    'update': function(req, res, next){
        if (req.body.event.id) {
            model.find({"id": req.body.event.id}, function (err, result) {
                if (!sec.checkAdmin(req, next, result[0].chronicleid)) {
                    return;
                }
                if(err) return next(new Error(err));
                var event = req.body.event;
                delete event._id;
                model.update(event.id, event, function (err) {
                    if(err) return next(new Error(err));
                    res.json("ok");
                });
            });
        }
    },
    'new': function(req, res, next){
        if(req.user.chronicles.length > 0){
            var chronicleid = req.user.chronicles[0].id;
            var event = {
                id: uuid.v4(),
                chronicleid: chronicleid,
                venue: "",
                date: new Date(),
                players: [],
                characters: [],
                xpawarded: false
            };
            model.insert(event, function (err) {
                if(err) return next(new Error("forbidden"));
                var out = {
                    user: req.user,
                    event: event
                };
                return res.render(ViewTemplatePath + "/edit", out);
            });
        }else{
            return next(new Error("forbidden"));
        }
    },
    'delete': function(req,res,next){
        if (req.body.ids) {
            model.find({id: {$in: req.body.ids}}, function(err, result){
                if (err) return next(new Error(err));
                for(var i =0; i<result.length; i++){
                    if (!sec.checkAdmin(req, next, result[i].chronicleid)) {
                        return;
                    }

                    model.remove({id: result[i].id}, function (err) {
                        if (err) return next(new Error(err));

                    });
                }

                res.json("ok");
            });
        }
    }
};