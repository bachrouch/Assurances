main.module('finance.receipt', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('receipt:consult', function (id) {
      return app.common.post('/svc/receipt/consult', {
        id: parseInt(id, 10)
      });
    });
    app.reqres.setHandler('receipt:search', function (criteria, payment,
      allReceipts) {
      return app.common.post('/svc/receipt/search', {
        criteria: criteria,
        payment: payment,
        allReceipts: allReceipts
      });
    });
  });
});
