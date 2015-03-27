var model = require('../models/Downtime.js');
var periodModel = require('../models/DowntimePeriod.js');
var chronicleModel = require('../models/Chronicle.js');
var characterModel = require('../models/Character.js');
var uuid = require('node-uuid');
var ViewTemplatePath = 'downtime';
var sec = require('../bin/securityhandler.js');

module.exports = {
    'index': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'new': function(req, res){
        var period = {
            openTo: new Date(),
            chronicleId: req.user.chronicles[0].id,
            id: uuid.v4(),
            openFrom: new Date()
        };
        periodModel.insert(period, function (err) {
            if(err) return next(new Error(err));

            var out = {user: req.user, period: period.id};
            res.render(ViewTemplatePath + "/edit", out);
        });
    },
    'edit': function(req, res){
        var out = {user: req.user, period: req.params.id};
        res.render(ViewTemplatePath + "/edit", out);
    },
    'submit': function(req, res){
        var out = {user: req.user, period: req.params.id};
        res.render(ViewTemplatePath + "/submit", out);
    },
    'findPeriod': function(req, res, next){
        periodModel.find({id: req.params.id}, function(err, result){
            if(err) return next(new Error(err));
            res.json(result);
        });
    },
    'allPeriods': function(req, res){
        var where = {};
        if (!req.user.isSuperAdmin) {
            var userId = req.user.googleId;
            where =
            {
                admins: {$in: [userId]}
            };
            chronicleModel.find(where, function (err, result) {
                if(err) return next(new Error(err));
                var chronicleIds = result.map(function(item){
                    return item.id;
                });
                where =
                {
                    chronicleid: {$in: [userId]}
                };
                periodModel.find(where, function (err, result) {
                    if(err) return next(new Error(err));

                    res.json(result);
                });
            })
        }
        else {
            periodModel.find({}, function (err, result) {
                if(err) return next(new Error(err));

                res.json(result);
            });
        }
    },
    'openPeriods': function(req, res){
        var chronicleids = [];
        chronicleModel.list({players: req.user.googleId}, function (err, result) {
            if(err) return next(new Error(err));
            chronicleids = result.map(function(item){
                return item.id;
            });

            periodModel.find({chronicleId: {$in: chronicleids}, openFrom: {$lte: new Date()}, openTo: {$gte: new Date()}}, function(err, result){
                if(err) return next(new Error(err));
                res.json(result);
            });
        });
    },
    'submittedPeriods': function(req, res){
        characterModel.find({googleId: req.user.googleId, state: {$in: ["Active"]}}, function (err, result) {
            if (err) return next(new Error(err));
            var characterids = result.map(function(item){
                return item.id;
            });
            model.find({characterid: {$in: characterids}}, function(err, result){
                if(err) return next(new Error(err));
                if(result.length == 0) return;
                var ids = result.map(function(item){
                    return item.downtimePeriod;
                });
                periodModel.find({id: {$in: ids}}, function(err, result){
                    if(err) return next(new Error(err));
                    res.json(result);
                });
            });
        });
    },
    'update': function(req, res, next){
        if (!sec.checkAdmin(req, next, req.body.period.chronicleId)) {
            return;
        }
        delete req.body.period._id;
        periodModel.update(req.body.period.id, req.body.period, function(err){
            if(err) return next(new Error(err));
            res.json("ok");
        });
    },
    'delete': function(req, res, next){
        periodModel.remove({id: req.body.period}, function(err){
            if(err) return next(new Error(err));
            res.json("ok");
        });
    },
    'savesubmission': function(req, res, next){
        var downtime = req.body.downtime;
        downtime.id = uuid.v4();
        model.insert(downtime, function(err){
            if(err) return next(new Error(err));
            res.json("ok");
        });
    }
};