main.module('finance.receipt', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new app.finance.payment.Criteria();
      this.receipts = new app.finance.payment.Receipts();
      this.receiptsSummary = new app.finance.payment.ReceiptsSummary();
      this.searchLayout = new mod.SearchLayout();
    },
    launch: function (id) {
      var self = this;
      app.request('receipt:consult', id)
        .done(function (data) {
          if (data.receipt === null) {
            app.alert('no receipt found');
          }
          else {
            self.container = new mod.Container();
            var receipt = self.container.get('receipt');
            receipt.fromRequest(data.receipt);
            var subscriberName = self.container.get(
              'subscriberName');
            subscriberName = data.receipt.subscriber.name;
            receipt.set('subscriberName', subscriberName);
            var due = self.container.get('due');
            due = data.receipt.recovery.due;
            receipt.set('due', due);
            var total = self.container.get('total');
            total = data.receipt.summary.total;
            receipt.set('total', total);
            var summary = self.container.get('summary');
            summary.fromRequest(data.receipt.summary);
            var stamps = self.container.get('stamps');
            stamps.fromRequest(data.receipt.summary.stamps);
            summary.set('stamps', stamps);
            var taxes = self.container.get('taxes');
            taxes.fromRequest(data.receipt.summary.taxes);
            summary.set('taxes', taxes);
            var payments = self.container.get('payments');
            payments.fromRequest(data.receipt.payments);
            var parts = self.container.get('parts');
            parts.fromRequest(data.receipt.recovery.parts);
            self.layout = new mod.ReceiptConsultView();
            app.mainRegion.show(self.layout);
          }
        })
        .fail(app.fail);
    }
  });
});
