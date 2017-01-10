main.module('connection', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('connection:login', function (request) {
      return app.common.post('/svc/connection/login', request.pick(
        'username', 'password'));
    });
    app.reqres.setHandler('connection:logout', function () {
      return app.common.post('/svc/connection/logout');
    });
    app.reqres.setHandler('connection:check', function () {
      return app.common.post('/svc/connection/check');
    });
  });
});
