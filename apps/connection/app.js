main.module('connection', function (mod, app) {
  app.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  app.on('start', function () {
    app.vent.trigger('connection:changed');
    app.execute('connection:check');
  });
});
