main.module('finance.payment', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('payment:create', function () {
      return app.common.post('/svc/payment/create');
    });
    app.reqres.setHandler('payment:current', function () {
      return app.common.post('/svc/payment/current');
    });
    app.reqres.setHandler('payment:save', function (payment, close,
      postponedReceipts) {
      return app.common.post('/svc/payment/save', {
        payment: payment,
        close: close,
        postponedReceipts: postponedReceipts
      });
    });
    app.reqres.setHandler('payment:search', function (criteria) {
      return app.common.post('/svc/payment/search', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('payment:finalize', function (payment) {
      return app.common.post('/svc/payment/finalize', {
        payment: payment
      });
    });
    app.reqres.setHandler('payment:sendExemption', function (payment,
      msg, receiptsList) {
      return app.common.post('/svc/payment/sendExemption', {
        payment: payment,
        msg: msg,
        receiptsList: receiptsList
      });
    });
    app.reqres.setHandler('payment:print', function (payment) {
      return app.common.post('/svc/payment/print', {
        payment: payment
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
    app.reqres.setHandler('payment:verifyPostPone', function (recId) {
      return app.common.post('/svc/payment/verifyPostPone', {
        recId: recId
      });
    });
  });
});
