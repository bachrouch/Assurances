main.module('mySpace.exemption', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.mainLayout = new mod.MainLayout();
      this.exemptionCriteria = new mod.ExemptionCriteria();
      this.receipts = new app.finance.payment.Receipts();
      this.payment = new app.finance.payment.Payment();
      this.pos = new app.finance.payment.POS();
      this.request = new mod.Request();
      this.actions = new mod.Actions();
      this.exemption = new mod.Exemption();
      this.exemptions = new mod.Exemptions();
      this.exemptionConsultView = new mod.ExemptionConsultView();
      this.paymentExemptionConsultView = new mod.PaymentExemptionConsultView();
      this.checkBtn = new mod.CheckBtn();
      this.sendExep = new mod.SendExep();
    },
    getPayData: function (ref, cb) {
      var self = this;
      app.request('mySpace:paymentSearch', {
          reference: ref
        })
        .done(function (data) {
          var payment = data[0];
          self.payment.fromRequest(payment);
          var receipts = self.payment.get('receipts');
          receipts.fromRequest(payment.receipts);
          var pos = self.payment.get('pos');
          pos.fromRequest(payment.pos);
          self.pos = pos;
          var premium = self.payment.get('premium');
          premium.fromRequest(payment.premium);
          cb();
        })
        .fail(function () {
          cb('Erreur lors de la récupération des données');
        });
    },
    getExemptionData: function (data) {
      var exemption = data[0];
      this.exemption.fromRequest(exemption);
      var request = this.exemption.get('request');
      request.fromRequest(exemption.request);
      var actions = this.exemption.get('actions');
      actions.fromRequest(exemption.actions);
      var actsList = actions.get('actsList');
      actsList.fromRequest(exemption.actions.actsList);
      this.actsList = actsList;
      var pos = this.exemption.get('pos');
      pos.fromRequest(exemption.pos);
      var receiptsList = request.get('receiptsList');
      receiptsList.fromRequest(exemption.request.receiptsList);
      this.receiptsList = receiptsList;
    }
  });
});
