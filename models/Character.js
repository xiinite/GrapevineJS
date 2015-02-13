var async = require('async');
var schemas = require('../models/schemas.js');

var model = schemas.Character;
var userModel = schemas.User;
var chronicleModel = schemas.Chronicle;

module.exports = {
    'all': function (callback) {
        model.find(function (err, result) {
            var aggregated = [];
            loadNext(result, 0, aggregated, callback);
        });
    },
    'find': function (where, callback) {
        model.find(where, function (err, result) {
            var aggregated = [];
            loadNext(result, 0, aggregated, callback);
        });
    },
    findPlain: function(where, callback){
        model.find(where, callback);
    },
    'list': function(where, callback){
        model.find(where, 'id name chronicle googleId state', callback);
    },
    'clear': function (callback) {
        model.find().remove(callback);
    },
    'insert': function (items, callback) {
        model.create(items, callback);
    },
    'update': function (itemid, update, callback) {
        model.update({'id': itemid}, update, {multi: false}, callback);
    },
    'remove': function(where, callback){
        model.remove(where, callback);
    },
    'count': function(where, callback){
        model.count(where, callback);
    }
};

function loadNext(collection, index, returnvalue, callback) {
    var char = collection[index];
    if (!char) {
        callback(null, returnvalue);
        return;
    }

    async.parallel({
        player: function (cb) {
            userModel.find({
                googleId: char.googleId
            }, function (err, result) {
                cb(err, result[0]);
            });
        },
        chronicle: function (cb) {
            chronicleModel.find({
                id: char.chronicle
            }, function (err, result) {
                cb(err, result[0]);
            });
        }
    }, function (err, result) {
        if (result.player) {
            char.player = result.player;
        }
        else {
            char.player = {displayName: "", googleId: ""};
        }
        if (result.chronicle) {
            char.chronicle = result.chronicle;
        }
        else {
            char.chronicle = {name: ""};
        }
        if (!char.experience) {
            char.experience = {total: 0, spent: 0};
        }
        if (!char.bloodpool) {
            char.bloodpool = {total: 0, current: 0};
        }
        if (!char.willpower) {
            char.willpower = {total: 0, current: 0};
        }

        returnvalue.push(char);
        index += 1;
        loadNext(collection, index, returnvalue, callback);
    });
}