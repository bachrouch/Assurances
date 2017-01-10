/*jslint browser: true */
main.module('admin.commission', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('admin:commission:search', function () {
      app.request('admin:commission:checkAccess')
        .done(function () {
          app.admin.current = 'CommissionSearch';
          mod.controller = new mod.ControllerSearch();
          app.mainRegion.show(mod.controller.layout);
          mod.router.navigate('commission', {
            trigger: true,
            replace: false
          });
        })
        .fail(function () {
          window.location.href = '/#unauthorized';
        });
    });
    app.commands.setHandler('admin:commission:manage', function (
      reference) {
      app.request('admin:commission:manage', reference)
        .done(function (data) {
          app.admin.current = 'commissionManage';
          mod.controller = new mod.ControllerManage();
          mod.controller.receipt.fromRequest(data.receipt);
          mod.controller.auditHistory.fromRequest(data.receipt.auditHistory);
          mod.controller.auditCoverages.fromRequest(data.receipt.displayCoverages);
          if (data.receipt.lastAction !== {}) {
            mod.controller.auditActions.fromRequest(data.receipt.lastAction);
          }
          mod.controller.auditAdjCoverages.fromRequest(data.receipt
            .auditAdjCoverages);
          app.mainRegion.show(mod.controller.layout);
        })
        .fail(function () {
          window.location.href = '/#unauthorized';
        });
    });
  });
});
