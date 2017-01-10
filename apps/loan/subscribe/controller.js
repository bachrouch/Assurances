main.module('loan.subscribe', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.container = new mod.Container();
      this.initSteps();
      this.layout = new mod.Layout();
    },
    launch: function (id) {
      var self = this;
      app.request('loan:policy:get', {
          id: id
        })
        .done(function (data) {
          self.container.get('quote')
            .fromRequest(data.policy);
          self.container.get('credit')
            .fromRequest(data.credit);
          self.container.get('insured')
            .fromRequest(data.insured);
          self.container.get('coverages')
            .fromRequest(data.coverages);
          self.container.get('amortizations')
            .fromRequest(data.amortizations);
          self.container.get('beneficiary')
            .fromRequest(data.beneficiary);
          if (data.person) {
            self.container.get('person')
              .fromRequest(data.person);
          }
          if (data.company) {
            self.container.get('company')
              .fromRequest(data.company);
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
        label: 'Emprunt'
      });
      steps[0].on('check', function () {
        var credit = self.container.get('credit');
        var insured = self.container.get('insured');
        var beneficiary = self.container.get('beneficiary');
        credit.trigger('commit');
        if (!this.validationError && credit.validationError) {
          this.validationError = 'Emprunt: ' + credit.validationError;
        }
        insured.trigger('commit');
        if (!this.validationError && insured.validationError) {
          this.validationError = 'Assuré: ' + insured.validationError;
        }
        beneficiary.trigger('commit');
        if (!this.validationError && beneficiary.validationError) {
          this.validationError = 'Bénéficiaire: ' + beneficiary.validationError;
        }
        var from = credit.get('releaseDate');
        var to = credit.get('endDate');
        if (_.isUndefined(from) || _.isNull(from) || _.isUndefined(
            to) || _.isNull(to)) {
          this.validationError =
            'Emprunt: Veuillez renseigner les dates !';
          return;
        }
        var dur = moment.duration(to.getTime() - from.getTime())
          .asMonths();
        if (dur <= 0) {
          this.validationError =
            'Emprunt: Les dates spécifiées sont incorrectes !';
          return;
        }
      });
      steps[0].after = function (done, fail) {
        var quote = self.container.get('quote');
        var credit = self.container.get('credit');
        var insured = self.container.get('insured');
        var beneficiary = self.container.get('beneficiary');
        var req;
        if (!quote.get('reference')) {
          req = 'loan:credit:create';
        }
        else {
          req = 'loan:credit:update';
        }
        app.request(req, {
            quote: quote,
            credit: credit,
            insured: insured,
            beneficiary: beneficiary
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            insured.fromRequest(data.insured);
            done();
          })
          .fail(fail);
      };
      steps[1] = new mod.Step({
        rank: 2,
        active: false,
        label: 'Sélection médicale'
      });
      steps[1].before = function (done, fail) {
        var quote = self.container.get('quote');
        if (quote.get('validated')) {
          done();
          return;
        }
        var coverages = self.container.get('coverages');
        var medquestions = self.container.get('medquestions');
        var medselections = self.container.get('medselections');
        var doctorprovider = self.container.get('doctorprovider');
        var doctortests = self.container.get('doctortests');
        var labprovider = self.container.get('labprovider');
        var labtests = self.container.get('labtests');
        var cardioprovider = self.container.get('cardioprovider');
        var cardiotests = self.container.get('cardiotests');
        var imageprovider = self.container.get('imageprovider');
        var imagetests = self.container.get('imagetests');
        if (medquestions.length !== 0) {
          app.request('loan:coverage:list', {
              quote: quote
            })
            .done(function (data) {
              quote.fromRequest(data.quote);
              coverages.fromRequest(data.coverages);
              medselections.fromRequest(data.medselections);
              if (data.doctorprovider) {
                //DOCTOR PROVIDER AND TESTS PROCESSING
                doctorprovider.fromRequest(data.doctorprovider);
                doctortests.fromRequest(data.doctorprovider.listselections);
                //LAB PROVIDER AND TESTS PROCESSING
                labprovider.fromRequest(data.labprovider);
                labtests.fromRequest(data.labprovider.listselections);
                //CARDIO PROVIDER AND TESTS PROCESSING
                cardioprovider.fromRequest(data.cardioprovider);
                cardiotests.fromRequest(data.cardioprovider.listselections);
                //MEDICAL IMAGERY PROVIDER AND TESTS PROCESSING
                imageprovider.fromRequest(data.imageprovider);
                imagetests.fromRequest(data.imageprovider.listselections);
              }
              done();
            })
            .fail(fail);
        }
        else {
          app.request('loan:coverage:list', {
              quote: quote
            })
            .done(function (data) {
              quote.fromRequest(data.quote);
              coverages.fromRequest(data.coverages);
              medquestions.fromRequest(data.medquestions);
              medselections.fromRequest(data.medselections);
              if (data.doctorprovider) {
                //DOCTOR PROVIDER AND TESTS PROCESSING
                doctorprovider.fromRequest(data.doctorprovider);
                doctortests.fromRequest(data.doctorprovider.listselections);
                //LAB PROVIDER AND TESTS PROCESSING
                labprovider.fromRequest(data.labprovider);
                labtests.fromRequest(data.labprovider.listselections);
                //CARDIO PROVIDER AND TESTS PROCESSING
                cardioprovider.fromRequest(data.cardioprovider);
                cardiotests.fromRequest(data.cardioprovider.listselections);
                //MEDICAL IMAGERY PROVIDER AND TESTS PROCESSING
                imageprovider.fromRequest(data.imageprovider);
                imagetests.fromRequest(data.imageprovider.listselections);
              }
              done();
            })
            .fail(fail);
        }
      };
      steps[1].on('check', function () {
        var insured = self.container.get('insured');
        var quote = self.container.get('quote');
        var sErr;
        insured.trigger('commit');
        if (!this.validationError && insured.validationError) {
          this.validationError = 'Assuré: ' + insured.validationError;
        }
        if (!quote.get('applyMedicalSelection')) {
          sErr = 'Questionnaire: Veuillez répondre aux questions';
          var medquestions = self.container.get('medquestions');
          medquestions.trigger('commit');
          var lstmed = [];
          lstmed = medquestions.models;
          for (var i = 0, l = lstmed.length; i < l; i++) {
            var medquest = lstmed[i];
            var answerYes = medquest.attributes.answerYes;
            var details = medquest.attributes.answerDetails;
            if (answerYes && details === null) {
              this.validationError = sErr;
              break;
            }
            if (answerYes && details === '') {
              this.validationError = sErr;
              break;
            }
          }
        }
      });
      steps[1].after = function (done, fail) {
        var quote = self.container.get('quote');
        var insured = self.container.get('insured');
        var doctorprovider = self.container.get('doctorprovider');
        var labprovider = self.container.get('labprovider');
        var cardioprovider = self.container.get('cardioprovider');
        var imageprovider = self.container.get('imageprovider');
        doctorprovider.trigger('commit');
        labprovider.trigger('commit');
        cardioprovider.trigger('commit');
        imageprovider.trigger('commit');
        if (!quote.get('applyMedicalSelection')) {
          if (quote.get('validated')) {
            done();
            return;
          }
          var medquestions = self.container.get('medquestions');
          medquestions.trigger('commit');
          app.request('loan:medicalselection:set', {
              quote: quote,
              insured: insured,
              medquestions: medquestions
            })
            .done(done)
            .fail(fail);
        }
        else {
          app.request('loan:medicalselection:check', {
              quote: quote,
              insured: insured
            })
            .done(function (data) {
              quote.fromRequest(data.quote);
              done();
            })
            .fail(fail);
        }
      };
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
        }
      });
      steps[3] = new mod.Step({
        rank: 4,
        active: false,
        label: 'Police'
      });
      steps[3].before = function (done, fail) {
        var amortizations = self.container.get('amortizations');
        var quote = self.container.get('quote');
        var subscriber;
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else {
          subscriber = self.container.get('company');
        }
        var sub = app.request('loan:subscriber:set', {
          quote: quote,
          subscriber: subscriber
        });
        var amo = app.request('loan:amortization:list', {
            quote: quote
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            amortizations.fromRequest(data.amortizations);
          });
        $.when(sub, amo)
          .done(done)
          .fail(fail);
      };
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
