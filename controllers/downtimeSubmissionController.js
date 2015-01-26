var model = require('../models/Downtime.js');
var uuid = require('node-uuid');

var ViewTemplatePath = 'downtimeSubmission';
module.exports = {
    'index': function (req, res, next) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    }
}