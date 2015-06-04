var express = require('express');
var router = require('../bin/routehandler.js');
var homeController = require('../controllers/homeController.js');
var home = express.Router();

home.get('/', homeController.home);
home.get('/login', homeController.login);

module.exports = {
    'config': function (app) {
        app.use('/', home);

        router.register(app, 'character');
        router.register(app, 'chronicle');
        router.register(app, 'downtime');
        router.register(app, 'event');
        router.register(app, 'gametype');
        router.register(app, 'superAdmin');
        router.register(app, 'user');

        router.get(app, 'character', 'new', [':id']);
        router.get(app, 'character', 'lores', [':id']);
        router.get(app, 'character', 'background', [':id']);
        router.get(app, 'character', 'trash', [':id']);
        router.get(app, 'character', 'wizard', [':id']);
        router.get(app, 'character', 'assignfreebies', [':id']);
        router.get(app, 'character', 'export', [":chronicleid", ":exporttype"]);
        router.get(app, 'character', 'allByPlayer');
        router.post(app, 'character', 'import', [':chronicleId']);
        router.post(app, 'character', 'revert');
        router.post(app, 'character', 'submitconcept');
        router.post(app, 'character', 'approveconcept');
        router.post(app, 'character', 'submitdraft');
        router.post(app, 'character', 'submitbackground');
        router.post(app, 'character', 'approvebackground');
        router.post(app, 'character', 'approvefinal');
        router.post(app, 'character', 'awardxp');

        router.post(app, 'chronicle', 'insert');
        router.post(app, 'chronicle', 'addadmin');
        router.post(app, 'chronicle', 'removeadmin');
        router.post(app, 'chronicle', 'addplayer');
        router.post(app, 'chronicle', 'removeplayer');

        router.get(app, 'downtime', 'allPeriods');
        router.get(app, 'downtime', 'openPeriods');
        router.get(app, 'downtime', 'submittedPeriods');
        router.get(app, 'downtime', 'findPeriod', [':id']);
        router.get(app, 'downtime', 'submit', [':id']);
        router.get(app, 'downtime', 'submittedCharacters', [':id']);
        router.post(app, 'downtime', 'savesubmission');

        router.get(app, 'gametype', 'new');

        router.get(app, 'user', 'toggleSuperAdmin', [':id']);
        router.post(app, 'user', 'updateStylesheet');
        router.post(app, 'user', 'updateEmail');
    }
};
