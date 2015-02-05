var sec = require('../bin/securityhandler.js');

var ViewTemplatePath = 'superAdmin';
module.exports = {
    'index': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'show': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        res.json('not implemented');
    }
};