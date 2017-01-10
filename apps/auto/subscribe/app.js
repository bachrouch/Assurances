main.module('auto.subscribe', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        subscribe: function () {
          app.execute('auto:subscribe:new');
        },
        'subscribe/id/:id': function (id) {
          app.execute('auto:subscribe:existing', id);
        },
        'subscribe/step/:step': function (step) {
          app.execute('auto:subscribe:step', parseInt(step));
        }
      }
    });
  });
});
