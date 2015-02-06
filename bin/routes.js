var express = require('express');
var router = require('../bin/routehandler.js');
var homeController = require('../controllers/homeController.js')
var home = express.Router();

home.get('/', homeController.home);
home.get('/login', homeController.login);


module.exports = {
    'config': function (app) {
        app.use('/', home);

        router.get(app, 'character', 'new', [':id']);
        router.get(app, 'character', 'lores', [':id']);
        router.get(app, 'character', 'export', [":chronicleid", ":exporttype"]);
        router.post(app, 'character', 'import', [':chronicleId']);
        router.post(app, 'character', 'revert');

        router.post(app, 'chronicle', 'insert');
        router.post(app, 'chronicle', 'addadmin');
        router.post(app, 'chronicle', 'removeadmin');
        router.post(app, 'chronicle', 'addplayer');
        router.post(app, 'chronicle', 'removeplayer');
        router.get(app, 'chronicle', 'find', [":id"]);

        router.get(app, 'user', 'toggleSuperAdmin', [':id']);
        router.get(app, 'user', 'find', [':id']);
        router.post(app, 'user', 'updateStylesheet');

        router.register(app, 'character');
        router.register(app, 'chronicle');
        router.register(app, 'user');
        router.register(app, 'superAdmin');
        router.register(app, 'downtimeSubmission');
    }
};
