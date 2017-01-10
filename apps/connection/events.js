main.module('connection', function (mod, app) {
  mod.addInitializer(function () {
    // when user asks to login
    app.vent.on('connection:login', function () {
      mod.controller.trigger('connection:login');
    });
    // when user asks to logout
    app.vent.on('connection:logout', function () {
      mod.controller.trigger('connection:logout');
    });
    // when connection status changed (usually after a check)
    app.vent.on('connection:changed', function () {
      mod.controller.trigger('connection:changed');
    });
  });
});
