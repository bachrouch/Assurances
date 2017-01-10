main.module('mySpace.exemption', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('mySpace:exemptionSearch', function (criteria) {
      return app.common.post('/svc/exemption/exemptionSearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('mySpace:paymentSearch', function (criteria,
      payback) {
      return app.common.post('/svc/payment/adminPaymentSearch', {
        criteria: criteria,
        payback: payback
      });
    });
    app.reqres.setHandler('mySpace:exemptionConsult', function (
      criteria) {
      return app.common.post('/svc/exemption/exemptionConsult', {
        criteria: criteria
      });
    });
  });
});
