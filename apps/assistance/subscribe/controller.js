main.module('assistance.subscribe', function (mod, app, Backbone, Marionette, $,
  _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.container = new mod.Container();
      this.initSteps();
      this.layout = new mod.Layout();
    },
    launch: function (id) {
      var self = this;
      app.request('assistance:policy:get', {
          id: id
        })
        .done(function (data) {
          self.container.get('quote')
            .fromRequest(data.policy);
          self.container.get('travel')
            .fromRequest(data.travel);
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
          if (data.traveler) {
            self.container.get('traveler')
              .fromRequest(data.traveler);
          }
          app.mainRegion.show(self.layout);
          mod.router.navigate('subscribe/step/1', {
            trigger: true,
            replace: false
          });
        })
        .fail(app.fail);
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      steps[0] = new mod.Step({
        rank: 1,
        active: false,
        label: 'Voyage et tarifs'
      });
      steps[0].on('check', function () {
        var travel = self.container.get('travel');
        travel.trigger('commit');
        if (!this.validationError && travel.validationError) {
          this.validationError = 'Voyage: ' + travel.validationError;
          return false;
        }
        var pricings = self.container.get('pricings');
        if (pricings.models.length === 0) {
          this.validationError =
            'Tarif: Veuillez selectionner un tarif';
          return false;
        }
        var pricingSelected = false;
        _.each(pricings.models, function (item) {
          if (item.get('selected')) {
            pricingSelected = true;
          }
        });
        if (!pricingSelected) {
          this.validationError =
            'Tarif: Veuillez selectionner un tarif';
          return false;
        }
      });
      steps[0].after = function (done, fail) {
        var quote = self.container.get('quote');
        var travel = self.container.get('travel');
        var travelers = self.container.get('travelers');
        var req;
        if (!quote.get('reference')) {
          req = 'assistance:travel:create';
        }
        else {
          req = 'assistance:travel:update';
        }
        app.request(req, {
            quote: quote,
            travel: travel
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            if (travelers.length !== travel.get('personsNumber')) {
              mod.controller.container.get('travelers')
                .reset(_.map(_.range(travel.get('personsNumber')),
                  function () {
                    return new app.assistance.Traveler();
                  }));
            }
            done();
          })
          .fail(fail);
      };
      steps[1] = new mod.Step({
        rank: 2,
        active: false,
        label: 'Dates et résumé'
      });
      steps[1].on('check', function () {
        var quote = self.container.get('quote');
        quote.trigger('commit');
        var validError = 'Certains champs ne sont pas valides';
        if (!this.validationError && quote.validationError) {
          this.validationError = validError;
          return false;
        }
      });
      steps[1].after = function (done, fail) {
        var quote = self.container.get('quote');
        var travel = self.container.get('travel');
        app.request('assistance:travel:update', {
            quote: quote,
            travel: travel
          })
          .done(done)
          .fail(fail);
      };
      steps[2] = new mod.Step({
        rank: 3,
        active: false,
        label: 'Voyageurs'
      });
      steps[2].on('check', function () {
        var quote = self.container.get('quote');
        var subscriber;
        var doctor = self.container.get('doctor');
        var personToPrevent = self.container.get(
          'personToPrevent');
        var travelers = self.container.get('travelers');
        var validError = 'Certains champs ne sont pas valides';
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else if (quote.isSubscriberCompany()) {
          subscriber = self.container.get('company');
        }
        if (subscriber) {
          subscriber.trigger('commit');
          if (!this.validationError && subscriber.validationError) {
            this.validationError = validError;
          }
        }
        if (doctor) {
          doctor.trigger('commit');
          if (!this.validationError && doctor.validationError) {
            this.validationError = validError;
          }
        }
        if (personToPrevent) {
          personToPrevent.trigger('commit');
          if (!this.validationError && personToPrevent.validationError) {
            this.validationError = validError;
          }
        }
        if (travelers) {
          travelers.trigger('commit');
          if (!this.validationError && travelers.validationError) {
            this.validationError = validError;
          }
        }
      });
      steps[2].after = function (done, fail) {
        var quote = self.container.get('quote');
        var subscriber;
        var doctor = self.container.get('doctor');
        var personToPrevent = self.container.get('personToPrevent');
        var travelers = self.container.get('travelers');
        var travel = self.container.get('travel');
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else if (quote.isSubscriberCompany()) {
          subscriber = self.container.get('company');
        }
        var promises = [];
        if (subscriber) {
          promises.push(app.request('assistance:subscriber:set', {
            quote: quote,
            subscriber: subscriber
          }));
        }
        if (doctor) {
          promises.push(app.request('assistance:doctor:set', {
            quote: quote,
            doctor: doctor
          }));
        }
        if (personToPrevent) {
          promises.push(app.request(
            'assistance:personToPrevent:set', {
              quote: quote,
              personToPrevent: personToPrevent
            }));
        }
        $.when.apply(null, promises)
          .done(function () {
            app.request('assistance:traveler:set', {
                quote: quote,
                travel: travel,
                travelers: travelers
              })
              .done(function (data) {
                quote.fromRequest(data.quote);
                done();
              })
              .fail(fail);
          })
          .fail(fail);
      };
      steps[3] = new mod.Step({
        rank: 4,
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
