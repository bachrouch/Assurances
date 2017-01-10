main.module('assistance.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('consult:consult', function (id) {
      return app.common.post('/svc/consult/consult', {
        id: parseInt(id, 10)
      });
    });
  });
});
