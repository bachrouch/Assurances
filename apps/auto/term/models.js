main.module('auto.term', function (mod, app, Backbone, Marionette, $, _) {
  mod.Policy = Backbone.Model.extend({
    /*
    reference: number (référence du Contract)
    effectiveDate: Contract  effective date
    termDate: date d'échéance
    clientName: Client Name
    premium: Premium Raised Equal to 0 for Quote
    details: Link to the details screen in order to validate or
    refuse the term
    */
    dateAttributes: ['effectiveDate', 'termDate'],
    defaults: function () {
      return {
        reference: 0,
        effectiveDate: null,
        termDate: null,
        clientName: null,
        premium: 0,
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    }
  });
  mod.Policies = Backbone.Collection.extend({
    model: mod.Policy
  });
  mod.Criteria = Backbone.Model.extend({
    defaults: {
      reference: null,
      clientName: null
    }
  });
  mod.Step = Backbone.Model.extend({
    defaults: {
      name: null,
      label: null,
      active: false
    }
  });
  mod.Steps = Backbone.Collection.extend({
    model: mod.Step,
    getStep: function (name) {
      return this.find(function (t) {
        return t.get('name') === name;
      });
    },
    getActive: function () {
      return this.find(function (t) {
        return t.get('active');
      });
    },
    setActive: function (step) {
      if (_.isNumber(step)) {
        step = this.at(step);
      }
      else if (_.isString(step)) {
        step = this.getStep(step);
      }
      if (step) {
        this.each(function (s) {
          s.set('active', false);
        });
        step.set('active', true);
        this.trigger('step', step.get('name'));
      }
    }
  });
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
