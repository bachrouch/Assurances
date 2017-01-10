main.module('auto', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('auto:ui:index');
        },
        index: function () {
          app.execute('auto:ui:index');
        },
        error: function () {
          app.execute('auto:ui:error');
        }
      }
    });
  });
});
