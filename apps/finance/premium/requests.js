main.module('finance.premium', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('premium:consult', function (contract,
      raisedDate) {
      return app.common.post('/svc/premium/consult', {
        contract: contract,
        raisedDate: raisedDate
      });
    });
    app.reqres.setHandler('premium:search', function (criteria) {
      return app.common.post('/svc/premium/receiptsearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('premium:receipt:generate', function (data) {
      return app.common.post('/svc/premium/generate', {
        premium: data.premium.toRequest(),
        settlements: data.settlements.toRequest()
      });
    });
    app.reqres.setHandler('premium:senderror', function (data) {
      return app.common.post('/svc/premium/senderror', {
        premium: data.premium.toRequest(),
        reportText: data.reportText
      });
    });
    app.reqres.setHandler('premium:memoir:generate', function (data) {
      return app.common.post('/svc/premium/memoir', {
        premium: data.premium.toRequest()
      });
    });
  });
});
