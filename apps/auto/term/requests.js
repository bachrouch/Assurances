main.module('auto.term', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('policy:termList', function () {
      return app.common.post('/svc/auto/policy/termList');
    });
    app.reqres.setHandler('policy:termSearch', function (criteria,
      indice) {
      return app.common.post('/svc/auto/policy/termSearch', {
        criteria: criteria,
        indice: indice
      });
    });
  });
  app.reqres.setHandler('policy:term:validate', function (data) {
    return app.common.post('/svc/auto/term/validate', {
      policy: data.policy.toRequest(),
      settlements: data.settlements.toRequest(),
      attestationNumber: data.attestationNumber
    });
  });
});
