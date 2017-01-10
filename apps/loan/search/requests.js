main.module('loan.search', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('loan:search:getData', function (data) {
      return app.common.post('/svc/loan/search/getData', {
        searchcriteria: data.searchcriteria.toRequest()
      });
    });
  });
});
