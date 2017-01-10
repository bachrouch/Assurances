main.module('admin.commission', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        commission: function () {
          app.execute('admin:commission:search');
        },
        'commission/:reference/manage': function (reference) {
          app.execute('admin:commission:manage', reference);
        }
      }
    });
  });
});
