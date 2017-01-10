main.module('finance.premium', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.receipts = new mod.Premiums();
      this.searchLayout = new mod.SearchLayout();
    },
    launch: function (contract, raisedDate) {
      var self = this;
      app.request('premium:consult', contract, raisedDate)
        .done(function (data) {
          self.container = new mod.Container();
          var premium = self.container.get('premium');
          premium.fromRequest(data.premium);
          premium.set('stamps', data.premium.stamps);
          premium.set('taxes', data.premium.taxes);
          var coverages = self.container.get('coverages');
          coverages.fromRequest(data.coverages);
          self.layout = new mod.ReceiptConsultView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    },
    updatePaymentMode: function (mode) {
      if (mode === 0) {
        return 'Virement';
      }
      else if (mode === 1) {
        return 'Espèces/Versement';
      }
      else if (mode === 2) {
        return 'Chèque';
      }
      else if (mode === 3) {
        return 'Traite';
      }
      else if (mode === 5) {
        return 'Prélèvement sur salaire';
      }
      else if (mode === 6) {
        return 'Prélèvement bancaire';
      }
    }
  });
});
