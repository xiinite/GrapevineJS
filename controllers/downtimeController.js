var model = require('../models/Downtime.js');
var periodModel = require('../models/DowntimePeriod.js');
var chronicleModel = require('../models/Chronicle.js');
var uuid = require('node-uuid');
var ViewTemplatePath = 'downtime';

module.exports = {
    'index': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'new': function(req, res){
        var period = {
            openTo: new Date(),
            chronicleId: null,
            id: uuid.v4(),
            openFrom: new Date()
        };
        var out = {user: req.user, period: period};
        res.render(ViewTemplatePath + "/new", out);
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
            chronicleModel.all(function (err, result) {
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
            });
        }
    }
};