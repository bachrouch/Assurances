main.module('admin.commission', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:pos:history', function (pos) {
      return app.common.post('/svc/admin/pos/history', {
        pos: pos
      });
    });
    app.reqres.setHandler('admin:commission:search', function (data) {
      return app.common.post('/svc/admin/commission/identify', {
        data: data.toRequest()
      });
    });
    app.reqres.setHandler('admin:commission:checkAccess', function () {
      return app.common.post('/svc/admin/commission/checkAccess');
    });
    app.reqres.setHandler('admin:commission:manage', function (
      reference) {
      return app.common.post('/svc/admin/commission/manage', {
        reference: reference
      });
    });
    app.reqres.setHandler('admin:commission:identify', function (data) {
      return app.common.post(
        '/svc/admin/commission/identifyReceipt', {
          data: data
        });
    });
    app.reqres.setHandler('admin:commission:autofix', function (data) {
      return app.common.post('/svc/admin/commission/autofix', {
        receiptNumber: data.receipt,
        adjCovers: data.adjRec.toRequest()
      });
    });
  });
});
