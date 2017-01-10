main.module('assistance.subscribe', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        subscribe: function () {
          app.execute('assistance:subscribe:new');
        },
        'subscribe/id/:id': function (id) {
          app.execute('assistance:subscribe:existing', id);
        },
        'subscribe/step/:step': function (step) {
          app.execute('assistance:subscribe:step', parseInt(step));
        }
      }
    });
  });
});
