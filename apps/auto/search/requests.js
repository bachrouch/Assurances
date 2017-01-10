main.module('auto.search', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('auto:search:getData', function (data) {
      return app.common.post('/svc/auto/search/getData', {
        searchcriteria: data.searchcriteria.toRequest()
      });
    });
    app.reqres.setHandler('auto:contract:natures', function () {
      return app.common.post('/svc/auto/contract/natures');
    });
    app.reqres.setHandler('auto:contract:types', function () {
      return app.common.post('/svc/auto/contract/types');
    });
    app.reqres.setHandler('auto:contract:statuses', function () {
      return app.common.post('/svc/auto/contract/statuses');
    });
    app.reqres.setHandler('auto:search:init', function () {
      return app.common.post('/svc/auto/search/init');
    });
  });
});
