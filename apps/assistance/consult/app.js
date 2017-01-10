main.module('assistance.consult', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'consult/id/:id': function (id) {
        app.execute('assistance:consult', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});
