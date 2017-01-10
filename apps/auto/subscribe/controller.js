main.module('auto.subscribe', function (mod, app, Backbone, Marionette, $) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.container = new mod.Container();
      this.initSteps();
      this.layout = new mod.Layout();
    },
    launch: function (id) {
      var self = this;
      app.request('auto:policy:get', {
          id: id
        })
        .done(function (data) {
          if (data.policy.isquote) {
            var quote = self.container.get('quote');
            self.container.get('quote')
              .fromRequest(data.policy);
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
            delete quote.attributes.reference;
            //ADDING THE DOCS HERE
            quote.set('quoteDoc', new app.common.Doc({
              title: 'Devis'
            }));
            quote.set('cpDoc', new app.common.Doc({
              title: 'Conditions particulières'
            }));
            quote.set('attestationDoc', new app.common.Doc({
              title: 'Attestation d\'assurance'
            }));
            quote.set('receiptDoc', new app.common.Doc({
              title: 'Quittance'
            }));
            quote.set('validateLink', new app.common.ProcessLink({
              title: 'Valider'
            }));
            //END
            app.mainRegion.show(self.layout);
            mod.router.navigate('subscribe/step/1', {
              trigger: true,
              replace: false
            });
          }
          else {
            mod.router.navigate('error', {
              trigger: true,
              replace: false
            });
          }
        })
        .fail(app.fail);
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      if (typeof (app.auto.fleet) !== 'undefined') {
        delete app.auto.fleet.controller;
      }
      steps[0] = new mod.Step({
        rank: 1,
        active: false,
        label: 'Véhicule'
      });
      steps[0].on('check', function () {
        var insured = self.container.get('insured');
        var vehicle = self.container.get('vehicle');
        insured.trigger('commit');
        if (!this.validationError && insured.validationError) {
          this.validationError = 'Assuré: ' + insured.validationError;
        }
        vehicle.trigger('commit');
        if (!this.validationError && vehicle.validationError) {
          this.validationError = 'Vehicle: ' + vehicle.validationError;
        }
      });
      steps[0].after = function (done, fail) {
        var quote = self.container.get('quote');
        var insured = self.container.get('insured');
        var vehicle = self.container.get('vehicle');
        var req;
        if (!quote.get('reference')) {
          req = 'auto:vehicle:create';
        }
        else {
          req = 'auto:vehicle:update';
        }
        app.request(req, {
            quote: quote,
            insured: insured,
            vehicle: vehicle
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            done();
          })
          .fail(fail);
      };
      steps[1] = new mod.Step({
        rank: 2,
        active: false,
        label: 'Couverture'
      });
      steps[1].on('check', function () {
        var vehicle = self.container.get('vehicle');
        var quote = self.container.get('quote');
        var kind = quote.get('kind');
        if (kind === 'Renouvelable') {
          var effectiveDate = moment(quote.get('effectiveDate'));
          var issueDate = moment(vehicle.get('issueDate'));
          var today = moment()
            .startOf('day');
          if (effectiveDate.diff(today, 'days') === 0) {
            if (today.diff(issueDate, 'days') > 30) {
              var tomorrow = moment(today)
                .add('d', 1)
                .format('DD/MM/YYYY');
              this.validationError =
                'Date d\'effet incorrecte doit être >= ' +
                tomorrow;
            }
          }
        }
      });
      steps[1].before = function (done, fail) {
        var coverages = self.container.get('coverages');
        var quote = self.container.get('quote');
        app.request('auto:coverage:list', {
            quote: quote
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            coverages.fromRequest(data.coverages);
            done();
          })
          .fail(fail);
      };
      steps[1].after = function (done, fail) {
        var quote = self.container.get('quote');
        $.when(app.request('auto:coverage:check', {
            quote: quote
          }), app.request('auto:coverage:list', {
            quote: quote
          }))
          .done(done)
          .fail(fail);
      };
      steps[2] = new mod.Step({
        rank: 3,
        active: false,
        label: 'Devis'
      });
      steps[3] = new mod.Step({
        rank: 4,
        active: false,
        label: 'Souscripteur'
      });
      steps[3].on('check', function () {
        var quote = self.container.get('quote');
        var subscriber;
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else {
          subscriber = self.container.get('company');
        }
        subscriber.trigger('commit');
        this.validationError = subscriber.validationError;
        if (!this.validationError) {
          var insured;
          if (quote.isInsuredPerson()) {
            insured = self.container.get('insuredperson');
          }
          else {
            insured = self.container.get('insuredcompany');
          }
          insured.trigger('commit');
          this.validationError = insured.validationError;
          if (!this.validationError) {
            var beneficiary = self.container.get('beneficiary');
            beneficiary.trigger('commit');
            this.validationError = beneficiary.validationError;
          }
        }
      });
      steps[3].after = function (done, fail) {
        var quote = self.container.get('quote');
        var subscriber;
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else {
          subscriber = self.container.get('company');
        }
        var beneficiary = self.container.get('beneficiary');
        var insured;
        if (quote.isInsuredPerson()) {
          insured = self.container.get('insuredperson');
        }
        else {
          insured = self.container.get('insuredcompany');
        }
        $.when(app.request('auto:subscriber:set', {
            quote: quote,
            subscriber: subscriber,
            insured: insured
          }), app.request('auto:beneficiary:set', {
            quote: quote,
            beneficiary: beneficiary
          }))
          .done(done)
          .fail(fail);
      };
      steps[4] = new mod.Step({
        rank: 5,
        active: false,
        label: 'Police'
      });
      this.container.get('steps')
        .reset(steps);
    },
    getStep: function (rank) {
      return this.container.get('steps')
        .getStep(rank);
    },
    getActiveStep: function () {
      return this.container.get('steps')
        .getActive();
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
    freezeStep: function () {
      var active = this.getActiveStep();
      mod.router.navigate(active.getPath(), {
        replace: true,
        trigger: false
      });
      this.layout.triggerMethod('error');
    }
  });
});
