main.module('auto.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('auto:contract:validate', function (data) {
      return app.common.post('/svc/auto/contract/validate', {
        policy: data.policy.toRequest(),
        settlements: data.settlements.toRequest(),
        attestationNumber: data.attestationNumber
      });
    });
    app.reqres.setHandler('auto:contract:regenerate', function (data) {
      return app.common.post('/svc/auto/contract/regenerate', {
        policy: data.policy.toRequest()
      });
    });
  });
});
