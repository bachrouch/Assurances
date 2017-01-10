// dependencies
var path = require('path');
var express = require('express');
var Q = require('q');
var session = require('./logic/session');
var routes = require('./routes');
//var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var app = express();
exports.fire = function () {
  return Q.Promise(function (resolve, reject) {
    var app = express();
    app.configure(function () {
      try {
        app.set('port', process.env.PORT || 3000);
        if ('test' === app.get('env')) {}
        else if ('development' === app.get('env')) {
          app.use(express.logger('dev'));
        }
        else {
          app.use(express.logger('default'));
        }
        app.use(express.favicon());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.static(path.join(__dirname, 'public')));
        app.locals.basedir = __dirname + '/views';
        app.set('view engine', 'jade');
        app.locals.pretty = true;
        // development only
        if ('development' === app.get('env')) {
          app.use(express.errorHandler());
        }
        else {
          app.enable('view cache');
        }
        session.configure(app);
        app.use(app.router);
        routes.declare(app);
      }
      catch (e) {
        app = null;
        reject(e);
      }
      resolve(app);
    });
  });
};
