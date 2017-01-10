main.module('finance.premium', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    /*
     * policyReference: number
     */
    dateAttributes: ['fromDate', 'toDate'],
    defaults: {
      policyReference: null,
      fromDate: moment()
        .add(-1, 'M')
        .toDate(),
      toDate: moment()
        .toDate()
    }
  });
  mod.Coverage = Backbone.Model.extend({
    /*
     * name: Description of the cover
     * amount: net contribtion
     * tua: amount of tua tax
     * fg: amount of fg tax
     * commission: commission amount
     */
    defaults: {
      name: null,
      amount: 0,
      tua: 0,
      fg: 0,
      commission: 0
    }
  });
  mod.Coverages = Backbone.Collection.extend({
    model: mod.Coverage
  });
  mod.Premium = Backbone.Model.extend({
    /*
     * date : date (date emission de la prime)
     * nature : string (nature de la prime : comptant, avenant, ...)
     * fromDate : premium effective date
     * toDate : premium end date
     * premiumStatus : premium status 0 non raised 1 raised (receipt)
     * statusDesc: status description
     * contract : number (référence de la police)
     * subscriberName : string (Nom du souscripteur)
     * total : number (montant TTC)
     * remainingAmount : number used to check premium remaining amount on settlement
     * taxes : array containing premium taxes
     * stamps : array containing premium stamps
     * commission: amount of commission
     */
    dateAttributes: ['date', 'fromDate', 'toDate'],
    defaults: function () {
      return {
        reference: null,
        date: null,
        nature: null,
        fromDate: null,
        toDate: null,
        contract: null,
        subscriberName: null,
        premiumStatus: null,
        statusDesc: null,
        total: null,
        remainingAmount: null,
        taxes: [],
        stamps: [],
        commission: null
      };
    }
  });
  mod.Premiums = Backbone.Collection.extend({
    model: mod.Premium
  });
  mod.Settlement = Backbone.Model.extend({
    /*
     * mode : number (0:virement, 1 : espèces/Versement, 2: chèque)
     * amount : number (montant total du règlement)
     * date : date (date du règlement : date du jour par défaut, modifiable)
     * Num: number (numéro de la pièce de règlement : num de chèque ou référence virement)
     * bank : string (Nom de la banque)
     */
    dateAttributes: ['date'],
    defaults: function () {
      return {
        mode: null,
        amount: null,
        date: null,
        num: null,
        bank: ''
      };
    }
  });
  mod.Settlements = Backbone.Collection.extend({
    model: mod.Settlement
  });
  mod.PremiumGenerate = Backbone.Model.extend({
    /*
     * reportText : Text to be reported in case there is a problem with the premium
     */
    defaults: function () {
      return {
        reportText: null,
        receiptDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        premium: new mod.Premium(),
        coverages: new mod.Coverages(),
        settlement: new mod.Settlement(),
        settlements: new mod.Settlements(),
        premiumgenerate: new mod.PremiumGenerate()
      };
    }
  });
});
