main.module('auto.fleet', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.container = new mod.Container();
      this.initSteps();
      this.layout = new mod.Layout();
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      if (typeof (app.auto.subscribe) !== 'undefined') {
        delete app.auto.subscribe.controller;
      }
      steps[0] = new mod.Step({
        rank: 1,
        active: false,
        label: 'Véhicules'
      });
      steps[0].on('check', function () {
        var vehicles = self.container.get('vehicles');
        if (vehicles.length <= 1) {
          this.validationError =
            'Veuillez ajouter au moins deux véhicules';
        }
      });
      steps[0].after = function (done, fail) {
        var quote = self.container.get('quote');
        var vehicles = self.container.get('vehicles');
        app.request('auto:fleet:summary', {
            quote: quote,
            vehicles: vehicles
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            vehicles.reset();
            _.each(data.vehicles, function (item) {
              var veh = new app.auto.Vehicle();
              veh.fromRequest(item);
              var cov = veh.get('coverages');
              cov.fromRequest(item.coverages);
              vehicles.add(veh);
            });
            done();
          })
          .fail(fail);
      };
      steps[1] = new mod.Step({
        rank: 2,
        active: false,
        label: 'Résumé'
      });
      steps[1].on('check', function () {
        var quote = self.container.get('quote');
        var effectiveDate = moment(quote.get('effectiveDate'));
        var today = moment()
          .startOf('day');
        if (effectiveDate.diff(today, 'days') === 0) {
          var tomorrow = moment(today)
            .add('d', 1)
            .format('DD/MM/YYYY');
          this.validationError =
            'Date d\'effet incorrecte doit être >= ' + tomorrow;
        }
      });
      steps[2] = new mod.Step({
        rank: 3,
        active: false,
        label: 'Souscripteur'
      });
      steps[2].on('check', function () {
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
      });
      steps[2].after = function (done, fail) {
        var quote = self.container.get('quote');
        var subscriber;
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else {
          subscriber = self.container.get('company');
        }
        app.request('auto:subscriber:set', {
            quote: quote,
            subscriber: subscriber,
            insured: subscriber
          })
          .done(done)
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
