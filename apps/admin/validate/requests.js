main.module('admin.validate', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:paymentSearch', function (criteria,
      payback) {
      return app.common.post('/svc/payment/adminPaymentSearch', {
        criteria: criteria,
        payback: payback
      });
    });
    app.reqres.setHandler('admin:validate', function (payment) {
      return app.common.post('/svc/payment/validatePayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('payment:save', function (payment) {
      return app.common.post('/svc/admin/payment/cancelReceipt', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:delay', function (payment) {
      return app.common.post('/svc/payment/delayPayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:reject', function (payment) {
      return app.common.post('/svc/payment/rejectPayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:finalize', function (payment) {
      return app.common.post('/svc/payment/finalizePayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:reverseValidation', function (payment) {
      return app.common.post('/svc/payment/reverseValidatePayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:receiptSearch', function (criteria,
      payment, allReceipts) {
      return app.common.post('/svc/receipt/adminReceiptSearch', {
        criteria: criteria,
        payment: payment,
        allReceipts: allReceipts
      });
    });
  });
});
