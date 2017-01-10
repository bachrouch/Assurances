main.module('admin.commission', function (mod, app, Backbone, Marionette) {
  mod.ControllerSearch = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.receipts = new mod.ReceiptsComm();
      this.pos = new mod.PosSummaryModel();
      this.layout = new mod.LayoutSearch();
    }
  });
  mod.ControllerManage = Marionette.Controller.extend({
    initialize: function () {
      this.layout = new mod.LayoutManage();
      this.receipt = new mod.ReceiptComm();
      this.pos = new mod.PosSummaryModel();
      this.auditHistory = new mod.AuditHistory();
      this.auditCoverages = new mod.AuditCoverages();
      this.auditActions = new mod.AuditAction();
      this.auditAdjCoverages = new mod.AuditCoverages();
    }
  });
});
