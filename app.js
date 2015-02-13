var config = require("./config/configuration.js");
var express = require('express');
var sess = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var locals = require('ejs-locals');
var auth = require("./bin/authorizationhandler.js");
var routes = require('./bin/routes.js');
var app = express();
var multer = require('multer');
var mongoose = require('mongoose');
var compression = require('compression');
var MongoStore = require('connect-mongostore')(sess);

// database setup
mongoose.connect(config.db.connectionString);

// view engine setup
app.engine('ejs', locals);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());
app.use(cookieParser('grapevinecookie'));
app.use(sess(
    {
        secret: 'grapevinesecret',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false, maxAge: 1000*60*60*24},
        maxAge: new Date(Date.now() + 1000*60*60*24),
        expires : new Date(Date.now() + 1000*60*60*24),
        store: new MongoStore({'db': 'sessions', mongooseConnection: mongoose.connection})
    }
));

app.use(favicon('./public/img/favicon.ico', function (err, favicon_url) {

}));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
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
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(config.server.PORT, config.server.IP, function () {
    console.log("GrapevineJS running on " + config.server.IP + ":" + config.server.PORT);
});

module.exports = app;
