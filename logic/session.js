/* jshint camelcase: false */
var _ = require('underscore');
var express = require('express');
var store = require('../store');
//
// Config
var COOKIE_SECRET = 'fucking cookie key just for fun';
var SESSION_COOKIE = 'takaful-session';
//
// Users management
function authenticate(username, password, cb) {
  var user = {
    id: '1',
    username: 'bob',
    fullName: 'Bob Marley',
    email: 'bob.marley@attakafulia.tn',
    posAdmin: true,
    admin: true,
    savingsAdmin: true,
    savingsBack: true,
    savingsPos: true,
    pos: {
      code: '100',
      name: 'Agence Centrale',
      deductedCommission: false,
      proratedCommission: false,
      ras: 0.15,
      locked: false
    },
    accessRights: {
      commissionAdmin: true,
      productConfig: true
    }
  };
  if (username === 'bob' && password === 'secret') {
    _.defer(_.bind(cb, null, null, user));
  }
  else {
    _.defer(_.bind(cb, null,
      'Vos identifiants sont erronés, merci de réessayer'));
  }
}
exports.login = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var cb = function (err, user) {
    if (err) {
      res.send(500, {
        error: err
      });
    }
    else {
      req.session.regenerate(function () {
        var remoteIP = req.headers['x-forwarded-for'] || req.connection
          .remoteAddress;
        req.session.user = _.extend({
          ip: remoteIP
        }, user);
        res.send({
          ok: true
        });
      });
    }
  };
  authenticate(username, password, cb);
};
exports.logout = function (req, res) {
  if (req.session.user) {
    req.session.destroy(function () {
      res.send({
        ok: true
      });
    });
  }
  else {
    res.send(500, {
      error: 'vous n\'êtes pas connecté'
    });
  }
};
exports.check = function (req, res) {
  if (req.session.user) {
    res.send({
      status: _.extend({
        connected: true
      }, req.session.user)
    });
  }
  else {
    res.send({
      status: {
        connected: false
      }
    });
  }
};
exports.ensureAuth = function (req, res, next) {
  if (req.session.user) {
    next();
  }
  else {
    if (req.method === 'GET') {
      res.redirect('/#forbidden');
    }
    else {
      res.send(500, {
        error: 'Votre session a expiré, merci de vous reconnecter'
      });
    }
  }
};
exports.ensurePosAdmin = function (req, res, next) {
  if ((req.session.user.posAdmin)) {
    next();
  }
  else {
    if (req.method === 'GET') {
      res.redirect('/#unauthorized');
    }
    else {
      res.send(500, {
        error: 'Ce service requiert le droit Admin'
      });
    }
  }
};
exports.ensureAdmin = function (req, res, next) {
  if (req.session.user.admin) {
    next();
  }
  else {
    if (req.method === 'GET') {
      res.redirect('/#unauthorized');
    }
    else {
      res.send(500, {
        error: 'Ce service requiert le droit Super Admin'
      });
    }
  }
};
exports.ensureLocked = function (req, res, next) {
  console.log(req.session.user.pos.locked);
  if (!req.session.user.pos.locked) {
    next();
  }
  else {
    if (req.method === 'GET') {
      res.redirect('/#locked');
    }
    else {
      res.send(500, {
        error: 'Vous n avez pas accés à ce service actuellement'
      });
    }
  }
};
exports.ensurePosAdminOrAdmin = function (req, res, next) {
  if ((req.session.user.posAdmin) || (req.session.user.admin)) {
    next();
  }
  else {
    if (req.method === 'GET') {
      res.redirect('/#unauthorized');
    }
    else {
      res.send(500, {
        error: 'Ce service requiert le droit Admin'
      });
    }
  }
};
exports.ensureInternal = function (req, res, next) {
  var remoteIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (remoteIP === '127.0.0.1') {
    next();
    return;
  }
  if (req.headers.attakafulia && req.headers.attakafulia === '1234') {
    next();
    return;
  }
  var internalIP = /192\.168\.\d{1,3}\.\d{1,3}/.test(remoteIP);
  if (internalIP) {
    next();
  }
  else {
    if (req.method === 'GET') {
      res.redirect('/#forbidden');
    }
    else {
      res.send(500, {
        error: 'Ce service est accessible uniquement au siège'
      });
    }
  }
};
exports.configure = function (app) {
  app.use(express.cookieParser(COOKIE_SECRET));
  app.use(express.session({
    key: SESSION_COOKIE,
    cookie: {
      maxAge: 12 * 60 * 60 * 1000
    },
    store: store.store
  }));
};
