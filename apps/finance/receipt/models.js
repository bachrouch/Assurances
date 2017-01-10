main.module('finance.receipt', function (mod, app, Backbone) {
  mod.Stamp = Backbone.Model.extend({
    /*
     * code: string
     * amount: amount
     */
    defaults: function () {
      return {
        code: 0,
        amount: 0
      };
    }
  });
  mod.Stamps = Backbone.Collection.extend({
    model: mod.Stamp
  });
  mod.Part = Backbone.Model.extend({
    /*
     * reference : number (référence de la feuille de caisse)
     * amount: amount (prime nette / term)
     * date: date de clôture
     */
    dateAttributes: ['date'],
    defaults: function () {
      return {
        reference: 0,
        amount: 0,
        date: null
      };
    }
  });
  mod.Parts = Backbone.Collection.extend({
    model: mod.Part
  });
  mod.Summary = Backbone.Model.extend({
    /*
     * premium : number (prime nette)
     * premiumCommission : number (montant de la commission)
     * premiumTaxes : number (montant du taxe)
     * fees : number (frais)
     * feesCommission : number (montant de les frais)
     * feesTaxes : number (montant du taxe)
     * commision: amount (tarif annuel)
     * taxes: amount (tax sur prime nette)
     * stamps: amount (montant des timbres)
     * total : number (Montant TTC)
     */
    defaults: function () {
      return {
        premium: 0,
        premiumCommission: 0,
        premiumTaxes: new mod.Stamps(),
        fees: 0,
        feesCommission: 0,
        feesTaxes: new mod.Stamps(),
        amount: 0,
        commission: 0,
        taxes: new mod.Stamps(),
        stamps: new mod.Stamps(),
        total: 0
      };
    }
  });
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        receipt: new app.finance.payment.Receipt(),
        summary: new mod.Summary(),
        payments: new app.finance.payment.Settlements(),
        stamps: new mod.Stamps(),
        taxes: new mod.Stamps(),
        parts: new mod.Parts()
      };
    },
    initialize: function () {
      this.get('parts')
        .reset();
    }
  });
});
