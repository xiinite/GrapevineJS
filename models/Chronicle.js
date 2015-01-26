var async = require('async');
var schemas = require('../models/schemas.js');

var model = schemas.Chronicle;
var charModel = schemas.Character;
var userModel = schemas.User;

var chronicleModel = module.exports = {
    'all': function (callback) {
        model.find(function (err, result) {
            var aggregated = [];
            var total = result.length;

            loadNext(result, 0, aggregated, callback);
        });
    },
    'listAll': function(callback){
        var q = model.find({});
        q.select('id name');
        q.exec(callback);
    },
    'list': function(where, callback){
        var q = model.find(where);
        q.select('id name');
        q.exec(callback);
    },
    'find': function (where, callback) {
        model.find(where, function (err, result) {
            var aggregated = [];
            loadNext(result, 0, aggregated, callback);
        });
    },
    'clear': function (callback) {
        model.find().remove(callback);
    },
    'insert': function (items, callback) {
        model.create(items, callback);
    },
    'update': function (itemid, update, callback) {
        model.update({'id': itemid}, update, {multi: false}, callback);
    }
}


function loadNext(collection, index, returnvalue, callback) {
    var c = collection[index];
    if (!c) {
        callback(null, returnvalue);
        return;
    }

    async.parallel({
        administrators: function (cb) {
            userModel.find({
                googleId: {"$in": c.admins}
            }, function (err, result) {
                cb(err, result);
            });
        },
        characters: function (cb) {
            charModel.find({
                chronicle: c.id
            }, function (err, result) {
                cb(err, result);
            });
        },
        playerDocs: function (cb){
            userModel.find({
                googleId: {"$in": c.players}
            }, function (err, result) {
                cb(err, result);
            });
        }
    }, function (err, result) {
        if (result.administrators) {
            c.administrators = result.administrators;
        }
        else {
            c.administrators = [];
        }
        if (result.characters) {
            c.characters = result.characters;
        }
        else {
            c.characters = [];
        }
        if(result.playerDocs) {
            c.playerDocs = result.playerDocs;
        }else{
            c.playerDocs = [];
        }
        returnvalue.push(c);
        index += 1;
        loadNext(collection, index, returnvalue, callback);
    });
}