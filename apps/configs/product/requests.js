main.module('configs.product', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('configs:product:checkAccess', function () {
      return app.common.post('/svc/configs/product/checkAccess');
    });
    app.reqres.setHandler('configs:product:searchProd', function (data) {
      return app.common.post('/svc/configs/product/searchProd', {
        data: data.toRequest()
      });
    });
    app.reqres.setHandler('configs:product:getDetails', function (prod) {
      return app.common.post('/svc/configs/product/getProdDetails', {
        product: prod.toRequest()
      });
    });
    app.reqres.setHandler('configs:product:applyCommProfileRate',
      function (data) {
        return app.common.post(
          '/svc/configs/product/applyCommProfileRate', {
            data: data
          });
      });
  });
});
