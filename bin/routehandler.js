var express = require('express');

module.exports = {
    register: function (app, path) {
        var router = express.Router();
        var controller = '../controllers/' + path + 'Controller.js';
        var handler = require(controller)

        for (var m in handler) {
            switch (m) {
                case "index":
                    router.get('/', require(controller)[m]);
                    router.get('/index', require(controller)[m]);
                    break;
                case "show":
                    router.get('/' + m + "/:id", require(controller)[m]);
                    break;
                case "find":
                    router.get('/' + m + "/:id", require(controller)[m]);
                    break;
                case "edit":
                    router.get('/' + m + "/:id", require(controller)[m]);
                    break;
                case "update":
                    router.post('/' + m, require(controller)[m]);
                    break
                default:
                    router.get('/' + m, require(controller)[m]);
                    break;
            }

        }
        /*var allHandler = require(controller).all;
         router.get('/all', allHandler);*/
        app.use('/' + path, router);
    },
    post: function (app, controller, handler, variables) {

        var path = controller + '/' + handler;
        if(variables !== undefined){
            path += '/' + variables;
        }
        controller = '../controllers/' + controller + 'Controller.js';

        app.post('/' + path, require(controller)[handler]);
    },
    get: function (app, controller, handler, variables) {
        var path = controller + '/' + handler + '/' + variables;
        controller = '../controllers/' + controller + 'Controller.js';

        app.get('/' + path, require(controller)[handler]);
    }
};