main.module('admin.payback', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'payback': function () {
          app.execute('payback:index');
        },
        'payback/search': function (criteria) {
          app.execute('payback:search', criteria);
        },
        'payback/:reference/edit': function (reference) {
          app.execute('payback:edit', reference);
        },
        'payback/:reference/consult': function (reference) {
          app.execute('payback:consult', reference);
        }
      }
    });
  });
});
