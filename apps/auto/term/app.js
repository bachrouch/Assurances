main.module('auto.term', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  mod.addInitializer(function () {
    var routes = {
      'term/id/:id': function (id) {
        app.execute('auto:term:consult', id);
      },
      'term': function () {
        app.execute('auto:term');
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});
