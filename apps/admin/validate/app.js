main.module('admin.validate', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'payment': function () {
          app.execute('admin:payment');
        },
        'payment/:reference/validate': function (reference) {
          app.execute('admin:validate', reference);
        },
        'payment/:reference/manage': function (reference) {
          app.execute('admin:manage', reference);
        },
        'receipt': function () {
          app.execute('admin:receiptSearch');
        }
      }
    });
  });
});
