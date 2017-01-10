main.module('assistance', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('assistance:ui:index');
        },
        index: function () {
          app.execute('assistance:ui:index');
        },
        error: function () {
          app.execute('assistance:ui:error');
        }
      }
    });
  });
});
