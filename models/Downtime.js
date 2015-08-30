var schemas = require('../models/schemas.js');

var model = schemas.Downtime;

module.exports = {
    'all': function (callback) {
        model.find(callback);
    },
    'find': function (where, callback) {
        model.find(where, callback);
    },
    'clear': function (callback) {
        model.find().remove(callback);
    },
    'insert': function (items, callback) {
        model.create(items, callback);
    },
    'remove': function(where, callback){
        model.remove(where, callback);
    },
    'update': function (itemid, update, callback) {
        model.update({'id': itemid}, update, {multi: false}, callback);
    }
};