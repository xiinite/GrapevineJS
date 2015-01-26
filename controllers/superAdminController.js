var uuid = require('node-uuid');

var ViewTemplatePath = 'superAdmin';
module.exports = {
    'index': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'show': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        res.json('not implemented');
    }
};