main.module('loan.search', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  mod.addInitializer(function () {
    var routes = {};
    routes.search = function () {
      app.execute('loan:search');
    };
    new Backbone.Router({
      routes: routes
    });
  });
});
