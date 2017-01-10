main.module('assistance.search', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('assistance:search:getData', function (data) {
      return app.common.post('/svc/assistance/search/getData', {
        searchcriteria: data.searchcriteria.toRequest()
      });
    });
  });
});
