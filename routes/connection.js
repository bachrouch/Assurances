var session = require('../logic/session');
exports.declare = function (app) {
  app.post('/svc/connection/login', session.login);
  app.post('/svc/connection/logout', session.logout);
  app.post('/svc/connection/check', session.check);
};
