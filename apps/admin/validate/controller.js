main.module('admin.validate', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.receiptCriteria = new mod.ReceiptCriteria();
      this.pos = new mod.POS();
      this.paymentCriteria = new mod.PaymentCriteria();
      this.receiptsSummary = new mod.ReceiptsSummary();
      this.receipts = new mod.Receipts();
      this.payment = new mod.Payment();
      this.payments = new mod.Payments();
      this.mainLayout = new mod.MainLayout();
      this.paymentValidateView = new mod.PaymentValidateView();
      this.paymentControleView = new mod.PaymentControleView();
      this.paymentSearchView = new mod.PaymentSearchView();
      this.settlement = new mod.Settlement();
    },
    getPaymentData: function (data) {
      var payment = data[0];
      this.payment.fromRequest(payment);
      var receipts = this.payment.get('receipts');
      receipts.fromRequest(payment.receipts);
      var pos = this.payment.get('pos');
      pos.fromRequest(payment.pos);
      this.pos = pos;
      var premium = this.payment.get('premium');
      premium.fromRequest(payment.premium);
      //get settlement
      var settlements = this.payment.get('settlements');
      settlements.fromRequest(payment.settlements);
      var listSettlements = payment.settlements;
      _.each(listSettlements, function (settlement) {
        var recs = settlement.receipts;
        var index = _.indexOf(listSettlements, settlement);
        var setl = settlements.at(index);
        var theReceipts = setl.get('receipts');
        _.each(recs, function (receipt) {
          theReceipts.push(receipt);
        });
      });
      var parts = this.payment.get('parts');
      parts.fromRequest(payment.parts);
    }
  });
});
