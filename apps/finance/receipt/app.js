main.module('finance.receipt', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'receipt/:id/consult': function (id) {
          app.execute('finance:receipt', id);
        },
        'receipt/search': function (criteria, payment, allReceipts) {
          app.execute('receipt:search', criteria, payment,
            allReceipts);
        }
      }
    });
  });
});
