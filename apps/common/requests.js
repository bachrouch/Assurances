main.module('common', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('common:banklist', function (criterium) {
      return app.common.post('/svc/common/banklist', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('common:paymentStatus', function () {
      return app.common.post('/svc/common/paymentStatus');
    });
    app.reqres.setHandler('common:paybackStatus', function () {
      return app.common.post('/svc/common/paybackStatus');
    });
    app.reqres.setHandler('common:settlementMode', function () {
      return app.common.post('/svc/common/settlementMode');
    });
    app.reqres.setHandler('common:posList', function () {
      return app.common.post('/svc/common/posList');
    });
    app.reqres.setHandler('common:getbankbyid', function (id) {
      return app.common.post('/svc/common/bankname', {
        id: id.id
      });
    });
    app.reqres.setHandler('common:termStatus', function () {
      return app.common.post('/svc/common/termStatus');
    });
    app.reqres.setHandler('common:exemptionStatus', function () {
      return app.common.post('/svc/common/exemptionStatus');
    });
    app.reqres.setHandler('common:exemptionType', function () {
      return app.common.post('/svc/common/exemptionType');
    });
    app.reqres.setHandler('common:branchList', function (criterium) {
      return app.common.post('/svc/common/branchList', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('common:productList', function (branch,
      criterium) {
      return app.common.post('/svc/common/productList', {
        branch: branch,
        criterium: criterium
      });
    });
  });
});
