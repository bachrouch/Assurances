main.module('auto.consult', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'consult/id/:id': function (id) {
        app.execute('auto:consult', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});
