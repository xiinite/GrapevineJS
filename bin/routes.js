var express = require('express');
var router = require('../bin/routehandler.js');
var home = express.Router();
home.get('/', function (req, res) {
    res.render('index', {user: req.user});
});

home.get('/login', function (req, res) {
    res.render('login', {layout: '_layoutNoAuth'});
});


module.exports = {
    'config': function (app) {
        app.use('/', home);

        router.post(app, 'character', 'import', ':chronicleId');
        router.post(app, 'character', 'revert');

        router.post(app, 'chronicle', 'insert');
        router.post(app, 'chronicle', 'addadmin');
        router.post(app, 'chronicle', 'removeadmin');
        router.post(app, 'chronicle', 'addplayer');
        router.post(app, 'chronicle', 'removeplayer');
        router.get(app, 'chronicle', 'find', ":id");

        router.get(app, 'user', 'toggleSuperAdmin', ':id');

        router.register(app, 'character');
        router.register(app, 'chronicle');
        router.register(app, 'user');
        router.register(app, 'superAdmin');
        router.register(app, 'downtimeSubmission');
    }
};
