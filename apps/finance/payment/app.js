main.module('finance.payment', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'payment': function () {
          app.execute('payment:index');
        },
        'payment/:reference/edit': function (reference) {
          app.execute('payment:edit', reference);
        },
        'payment/search': function (criteria) {
          app.execute('payment:search', criteria);
        },
        'payment/:reference/consult': function (reference) {
          app.execute('payment:consult', reference);
        },
        'payment/:reference/paymentRequest': function (reference) {
          app.execute('payment:paymentRequest', reference);
        }
      }
    });
  });
});
