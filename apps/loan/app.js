main.module('loan', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('loan:ui:index');
        },
        index: function () {
          app.execute('loan:ui:index');
        },
        error: function () {
          app.execute('loan:ui:error');
        }
      }
    });
  });
});
