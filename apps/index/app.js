main.module('index', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('index:ui:index');
        },
        forbidden: function () {
          app.execute('index:ui:forbidden');
        },
        wip: function () {
          app.execute('index:ui:wip');
        },
        unauthorized: function () {
          app.execute('index:ui:unauthorized');
        },
        locked: function () {
          app.execute('index:ui:locked');
        }
      }
    });
  });
});
