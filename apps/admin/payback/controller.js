main.module('admin.payback', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.payback = new mod.Payback();
      this.steps = new app.finance.payment.Steps();
      this.payment = new app.finance.payment.Payment();
      this.settlement = new app.finance.payment.Settlement();
      this.payments = new app.finance.payment.Payments();
      this.paymentCriteria = new app.admin.validate.PaymentCriteria();
      this.paybacks = new mod.Paybacks();
      this.doc = new app.common.Doc();
      this.paybackCriteria = new mod.PaybackCriteria();
      this.mainLayout = new mod.MainLayout();
      this.searchLayout = new mod.SearchLayout();
      this.paybacktConsultView = new mod.PaybacktConsultView();
      this.initSteps();
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      steps[0] = new app.finance.payment.Step({
        name: 'Main',
        active: false,
        label: 'Recherche'
      });
      steps[1] = new app.finance.payment.Step({
        name: 'Payment',
        active: false,
        label: 'Feuilles de caisse'
      });
      steps[2] = new app.finance.payment.Step({
        name: 'Settlement',
        active: false,
        label: 'Règlements'
      });
      self.steps.reset(steps);
    },
    setDocData: function (payback) {
      this.doc.set('title', 'Imprimer');
      this.doc.set('id', payback.get('pdfId'));
      this.doc.set('lob', '/payback/sheet');
    },
    getPaybackData: function (data) {
      var payback = data[0];
      this.payback.fromRequest(payback);
      var payments = this.payback.get('payments');
      payments.fromRequest(payback.payments);
      var listPayments = payback.payments;
      _.each(listPayments, function (payment) {
        var index = _.indexOf(listPayments, payment);
        var paymentPremium = payments.at(index)
          .get('premium');
        paymentPremium.fromRequest(payment.premium);
        var pos = payments.at(index)
          .get('pos');
        pos.fromRequest(payment.pos);
      });
      var premium = this.payback.get('premium');
      premium.fromRequest(payback.premium);
      //get settlement
      var settlements = this.payback.get('settlements');
      settlements.fromRequest(payback.settlements);
      var listSettlements = payback.settlements;
      _.each(listSettlements, function (settlement) {
        var pays = settlement.payments;
        var index = _.indexOf(listSettlements, settlement);
        var setl = settlements.at(index);
        var thePayments = setl.get('payments'); //settlements[index].receipts;
        _.each(pays, function (payment) {
          thePayments.push(payment);
        });
      });
    },
    updatePaybackData: function () {}
  });
});
