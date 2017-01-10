main.module('loan.valid', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    launch: function (id) {
      var self = this;
      app.request('loan:policy:get', {
          id: id
        })
        .done(function (data) {
          self.container = new mod.Container();
          var policy = self.container.get('policy');
          policy.fromRequest(data.policy);
          policy.set('receiptDoc', new app.common.Doc({}));
          policy.get('receiptDoc')
            .fromRequest(data.policy.receiptDoc);
          policy.set('attestationDoc', new app.common.Doc({}));
          policy.get('attestationDoc')
            .fromRequest(data.policy.attestationDoc);
          var insured = self.container.get('insured');
          insured.fromRequest(data.insured);
          var medicalSelection = self.container.get(
            'medicalQuestions');
          var insuredComp = self.container.get('insuredComp');
          insuredComp.fromRequest(data.insured);
          medicalSelection.fromRequest(data.insured.medicalSelection);
          insuredComp.set('medicalSelection', medicalSelection);
          var loan = self.container.get('loan');
          loan.fromRequest(data.loan);
          var beneficiary = self.container.get('beneficiary');
          beneficiary.fromRequest(data.beneficiary);
          if (data.person) {
            self.container.get('person')
              .fromRequest(data.person);
          }
          if (data.company) {
            self.container.get('company')
              .fromRequest(data.company);
          }
          var subscriberType = self.container.get('subscriberType');
          subscriberType.fromRequest(data.subscribertype);
          var insuredSubscriber = self.container.get(
            'insuredSubscriber');
          insuredSubscriber.fromRequest(data.insuredsubscriber);
          var validationLocks = self.container.get(
            'validationLocks');
          validationLocks.fromRequest(data.validationLocks);
          self.layout = new mod.PolicyConsultView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    }
  });
});
