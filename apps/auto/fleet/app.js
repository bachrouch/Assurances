main.module('auto.fleet', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        fleet: function () {
          app.execute('auto:fleet:new');
        },
        'fleet/id/:id': function (id) {
          app.execute('auto:fleet:existing', id);
        },
        'fleet/step/:step': function (step) {
          app.execute('auto:fleet:step', parseInt(step));
        }
      }
    });
  });
});
