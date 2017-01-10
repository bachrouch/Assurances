main.module('loan.subscribe', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        subscribe: function () {
          app.execute('loan:subscribe:new');
        },
        'subscribe/id/:id': function (id) {
          app.execute('loan:subscribe:existing', id);
        },
        'subscribe/step/:step': function (step) {
          app.execute('loan:subscribe:step', parseInt(step));
        }
      }
    });
  });
});
