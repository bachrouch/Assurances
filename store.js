/* vim: fdm=marker
 */
var Q = require('q');
var util = require('util');
var express = require('express');
var mongo = require('./mongo');
var Store = express.Store || express.session.Store;
var store;
Object.defineProperty(exports, 'store', {
  get: function () {
    // {{{
    return store;
    // }}}
  }
});

function MongoStore(options, callback) {
  // {{{
  var self = this;
  var defaultOptions = {
    collection: 'sessions',
    defaultExpirationTime: 1000 * 60 * 60 * 24 * 14
  };
  options = options || {};
  Store.call(this, options);
  this.db = options.db;
  this.collection = this.db.collection(options.collection || defaultOptions.collection);
  this.defaultExpirationTime = options.defaultExpirationTime || defaultOptions.defaultExpirationTime;
  this.collection.ensureIndex({
    expires: 1
  }, {
    expireAfterSeconds: 0
  }, function (err) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, self);
    }
  });
  // }}}
}
util.inherits(MongoStore, Store);
MongoStore.prototype.serialize = function (session) {
  // {{{
  var obj = {};
  for (var prop in session) {
    if (prop === 'cookie') {
      obj.cookie = session.cookie.toJSON ? session.cookie.toJSON() : session.cookie;
    }
    else {
      obj[prop] = session[prop];
    }
  }
  return obj;
  // }}}
};
MongoStore.prototype.unserialize = function (x) {
  // {{{
  return x;
  // }}}
};
MongoStore.prototype.get = function (sid, callback) {
  // {{{
  var self = this;
  this.collection.findOne({
    _id: sid
  }, function (err, session) {
    if (err) {
      return callback && callback(err, null);
    }
    else {
      if (session) {
        if (!session.expires || new Date() < session.expires) {
          callback(null, self.unserialize(session.session));
        }
        else {
          self.destroy(sid, callback);
        }
      }
      else {
        return callback && callback();
      }
    }
  });
  // }}}
};
MongoStore.prototype.set = function (sid, session, callback) {
  // {{{
  var s = {
    _id: sid,
    session: this.serialize(session)
  };
  if (session && session.cookie && session.cookie.expires) {
    s.expires = new Date(session.cookie.expires);
  }
  else {
    var today = new Date();
    s.expires = new Date(today.getTime() + this.defaultExpirationTime);
  }
  this.collection.update({
    _id: sid
  }, s, {
    upsert: true,
    safe: true
  }, function (err) {
    if (err) {
      return callback && callback(err);
    }
    else {
      return callback && callback(null);
    }
  });
  // }}}
};
MongoStore.prototype.destroy = function (sid, callback) {
  // {{{
  this.collection.remove({
    _id: sid
  }, function () {
    return callback && callback();
  });
  // }}}
};
MongoStore.prototype.length = function (callback) {
  // {{{
  this.collection.count({}, function (err, count) {
    if (err) {
      return callback && callback(err);
    }
    else {
      return callback && callback(null, count);
    }
  });
  // }}}
};
MongoStore.prototype.clear = function (callback) {
  // {{{
  this.collection.drop(function () {
    return callback && callback();
  });
  // }}}
};
exports.init = function () {
  // {{{
  return Q.Promise(function (resolve, reject) {
    new MongoStore({
      db: mongo.db,
      collection: 'sessions'
    }, function (err, st) {
      if (err) {
        reject(err);
      }
      else {
        store = st;
        resolve();
      }
    });
  });
  // }}}
};
