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
    }
};