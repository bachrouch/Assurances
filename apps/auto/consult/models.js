main.module('auto.consult', function (mod, app, Backbone) {
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.auto.Quote(),
        vehicle: new app.auto.Vehicle(),
        insured: new app.auto.Insured(),
        coverages: new app.auto.Coverages(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        settlement: new mod.Settlement(),
        settlements: new mod.Settlements()
      };
    }
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
});
