main.module('auto.valid', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'contract/:id/valid': function (id) {
        app.execute('auto:valid', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});
