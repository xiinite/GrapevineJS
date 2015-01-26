var config = require("./config/configuration.js");
var express = require('express');
var sess = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var locals = require('ejs-locals');
var auth = require("./bin/authorizationHandler.js");
var routes = require('./bin/routes.js');
var app = express();
var multer = require('multer');
var mongoose = require('mongoose');

// database setup
mongoose.connect(config.db.connectionString);

// view engine setup
app.engine('ejs', locals);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser('grapevinecookie'));
app.use(sess(
    {
        secret: 'grapevinesecret',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false, maxAge: 1000*60*60*24},
        maxAge: new Date(Date.now() + 1000*60*60*24),
        expires : new Date(Date.now() + 1000*60*60*24)
    }
));

app.use(favicon('./public/img/favicon.ico', function (err, favicon_url) {

}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(multer({dest: './tmp/'}));
app.use(express.static(path.join(__dirname, 'public')));
auth.init(app);

routes.config(app);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(config.server.PORT, config.server.IP, function () {
});

module.exports = app;
