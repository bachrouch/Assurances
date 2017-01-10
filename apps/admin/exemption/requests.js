main.module('admin.exemption', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:exemptionSearch', function (criteria) {
      return app.common.post('/svc/exemption/adminExemptionSearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('admin:acceptExemption', function (exemption,
      comments) {
      return app.common.post('/svc/exemption/adminAcceptExemption', {
        exemption: exemption,
        comments: comments
      });
    });
    app.reqres.setHandler('admin:rejectExemption', function (exemption,
      comments) {
      return app.common.post('/svc/exemption/adminRejectExemption', {
        exemption: exemption,
        comments: comments
      });
    });
    app.reqres.setHandler('admin:postpone', function (receipt,
      paymentReference, exemptionRef) {
      return app.common.post('/svc/payment/postponePayment', {
        receipt: receipt,
        exemptionRef: exemptionRef,
        paymentReference: paymentReference
      });
    });
    app.reqres.setHandler('admin:unlockSubscription', function (payment,
      exemptionRef) {
      return app.common.post('/svc/payment/unlockSubscription', {
        payment: payment,
        exemptionRef: exemptionRef
      });
    });
  });
});
