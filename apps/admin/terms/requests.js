main.module('admin.terms', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:termList', function () {
      return app.common.post('/svc/admin/termList');
    });
    app.reqres.setHandler('admin:termSearch', function (criteria,
      indice) {
      return app.common.post('/svc/admin/termSearch', {
        criteria: criteria,
        indice: indice
      });
    });
    app.reqres.setHandler('admin:terms:remove', function (data) {
      return app.common.post('/svc/admin/term/remove', {
        policy: data.policy.toRequest(),
        settlements: data.settlements.toRequest(),
        attestationNumber: data.attestationNumber
      });
    });
    app.reqres.setHandler('admin:terms:get', function (data) {
      return app.common.post('/svc/admin/terms/get', {
        id: data.id
      });
    });
  });
});
