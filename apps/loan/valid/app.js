main.module('loan.valid', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'contract/:id/valid': function (id) {
        app.execute('loan:valid', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});
