main.module('admin.validate', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('payback:create', function () {
      return app.common.post('/svc/payback/paybackCreate');
    });
    app.reqres.setHandler('payback:search', function (criteria) {
      return app.common.post('/svc/payback/paybackSearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('payback:save', function (payback) {
      return app.common.post('/svc/payback/paybackSave', {
        payback: payback
      });
    });
    app.reqres.setHandler('payback:paybackFinalize', function (payback) {
      return app.common.post('svc/payback/paybackFinalize', {
        payback: payback
      });
    });
    app.reqres.setHandler('payback:print', function (payback) {
      return app.common.post('/svc/payback/print', {
        payback: payback
      });
    });
  });
});
