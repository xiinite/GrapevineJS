var schemas = require('../models/schemas.js');
var async = require('async');

var model = schemas.User;
var chronicleModel = schemas.Chronicle;

module.exports = {
    'all': function (callback) {
        model.find(callback);
    },
    'find': function (where, callback) {
        model.find(where, function (err, result) {
            var aggregated = [];
            loadNext(result, 0, aggregated, callback);
        });
    },
    'list': function(where, callback){
        var q = model.find(where);
        q.select('googleId displayName emails provider');
        q.exec(callback);
    },
    'clear': function (callback) {
        model.find().remove(callback);
    },
    'insert': function (items, callback) {
        model.create(items, callback);
    },
    'update': function (itemid, update, callback) {
        model.update({'googleId': itemid}, update, {multi: false}, callback);
    }
};

function loadNext(collection, index, returnvalue, callback) {
    var user = collection[index];
    if (!user) {
        callback(null, returnvalue);
        return;
    }

    async.parallel({
        isAdmin: function (cb) {
            chronicleModel.find({
                admins: user.googleId
            }, function (err, result) {
                cb(err, result);
            });
        }
    }, function (err, result) {
        if (result.isAdmin) {
            user.isAdmin = true;
            user.chronicles = result.isAdmin;
        }
        else {
            user.isAdmin = false;
        }


        returnvalue.push(user);
        index += 1;
        loadNext(collection, index, returnvalue, callback);
    });
}