main.module('admin.terms', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'terms': function () {
          app.execute('admin:terms');
        },
        'terms/id/:reference': function (reference) {
          app.execute('admin:terms:get', reference);
        }
      }
    });
  });
});
