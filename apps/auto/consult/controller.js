main.module('auto.consult', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    launch: function (id) {
      var self = this;
      app.request('auto:policy:get', {
          id: id
        })
        .done(function (data) {
          self.container = new mod.Container();
          var policy = self.container.get('policy');
          policy.fromRequest(data.policy);
          policy.get('quoteDoc')
            .fromRequest(data.policy.quoteDoc);
          policy.get('subscribeLink')
            .fromRequest(data.policy.subscribeLink);
          policy.get('transformLink')
            .fromRequest(data.policy.transformLink);
          policy.get('cpDoc')
            .fromRequest(data.policy.cpDoc);
          policy.get('attestationDoc')
            .fromRequest(data.policy.attestationDoc);
          policy.get('receiptDoc')
            .fromRequest(data.policy.receiptDoc);
          self.container.get('insured')
            .fromRequest(data.insured);
          self.container.get('vehicle')
            .fromRequest(data.vehicle);
          self.container.get('coverages')
            .fromRequest(data.coverages);
          if (data.person) {
            self.container.get('person')
              .fromRequest(data.person);
          }
          if (data.company) {
            self.container.get('company')
              .fromRequest(data.company);
          }
          if (data.beneficiary) {
            self.container.get('beneficiary')
              .fromRequest(data.beneficiary);
          }
          var settlements = self.container.get('settlements');
          settlements.fromRequest(data.settlements);
          self.layout = new mod.PolicyConsultView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    }
  });
});
