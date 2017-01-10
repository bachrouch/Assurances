main.module('auto.term', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.layout = new mod.Layout();
      this.futureTermCriteria = new mod.Criteria();
      this.termCriteria = new mod.Criteria();
      this.dueTermCriteria = new mod.Criteria();
      this.steps = new mod.Steps();
      this.futureTermPolicies = new mod.Policies();
      this.termPolicies = new mod.Policies();
      this.dueTermPolicies = new mod.Policies();
      this.initSteps();
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      steps[0] = new mod.Step({
        name: 'DueTerm',
        active: false,
        label: 'Termes échus'
      });
      steps[1] = new mod.Step({
        name: 'Term',
        active: false,
        label: 'Termes en cours'
      });
      steps[2] = new mod.Step({
        name: 'FutureTerm',
        active: false,
        label: 'Termes futurs'
      });
      self.steps.reset(steps);
    },
    activateStep: function (step, updateURL) {
      var self = this;
      if (updateURL) {
        mod.router.navigate(step.getPath(), {
          replace: true,
          trigger: false
        });
      }
      step.executeBefore(function () {
        self.container.get('steps')
          .setActive(step);
        self.layout.triggerMethod('step', step);
      });
    },
    launch: function (id) {
      var self = this;
      app.request('auto:term:get', {
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
          policy.get('aeDoc')
            .fromRequest(data.policy.aeDoc);
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
