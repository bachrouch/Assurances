main.module('loan.valid', function (mod, app, Backbone) {
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.loan.Quote(),
        insured: new app.loan.Insured(),
        loan: new app.loan.Credit(),
        beneficiary: new app.loan.Beneficiary(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        reports: new app.loan.Reports(),
        editInsured: new mod.EditModView(),
        editLoan: new mod.EditModView(),
        editBenef: new mod.EditModView(),
        editContrib: new mod.EditModView(),
        editInsuredComp: new mod.EditModView(),
        medicalQuestions: new app.loan.MedicalQuestions(),
        insuredComp: new app.loan.Insured(),
        editSubscriber: new mod.EditModView(),
        subscriberType: new mod.SubscriberType(),
        insuredSubscriber: new mod.InsuredSubscriber(),
        validationLocks: new mod.ValidationLocks(),
        updatedFields: new mod.UpdatedFields()
      };
    }
  });
  mod.EditModView = Backbone.Model.extend({});
  mod.SubscriberType = Backbone.Model.extend({});
  mod.InsuredSubscriber = Backbone.Model.extend({});
  mod.ValidationLock = Backbone.Model.extend({});
  mod.ValidationLocks = Backbone.Collection.extend({
    model: mod.ValidationLock
  });
  mod.UpdatedFields = Backbone.Model.extend({
    dateAttributes: ['birthDate', 'releaseDate', 'endDate']
  });
});
