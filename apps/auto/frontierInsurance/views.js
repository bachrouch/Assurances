main.module('auto.frontierInsurance', function (mod, app, Backbone, Marionette,
  $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-frontierInsurance',
    regions: {
      content: '.tkf-content',
      summary: '.tkf-summary'
    },
    onRender: function () {
      this.content.show(new mod.Content());
      this.summary.show(new mod.SummaryView({
        model: mod.controller.container.get('summary')
      }));
    }
  });
  mod.SummaryItemView = Marionette.View.extend({
    tagName: 'p',
    template: _.template(
      '<% _.each(a, function(e) { %> <%= e %></br> <% }); %>'),
    render: function () {
      var html = this.template(this.model.toJSON());
      this.$el.html(html);
      return this;
    }
  });
  mod.SummaryView = Marionette.Layout.extend({
    template: '#auto-frontierInsurance-summary',
    regions: {
      contract: '.tkf-summary-contract',
      vehicle: '.tkf-summary-vehicle',
      premium: '.tkf-summary-premium',
      subscriber: '.tkf-summary-subscriber'
    },
    renderItem: function (item) {
      this[item].show(new mod.SummaryItemView({
        model: new Backbone.Model({
          a: this.model.get(item)
        })
      }));
    },
    renderContract: function () {
      this.renderItem('contract');
    },
    renderVehicle: function () {
      this.renderItem('vehicle');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderContract();
      this.renderVehicle();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:contract': 'renderContract',
      'change:vehicle': 'renderVehicle',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.QuoteForm = app.common.CustForm.extend({
    template: _.template($('#auto-frontierInsurance-quote-form')
      .html()),
    schema: {
      type: {
        title: 'Type',
        type: 'CustSelect',
        validators: ['required'],
        request: 'auto:frontierInsurance:listUsages'
      },
      duration: {
        title: 'Durée du contrat',
        type: 'CustSelect',
        validators: ['required'],
        request: 'auto:frontierInsurance:durationsList'
      },
      beginDate: {
        title: 'Date d\'effet',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          value: moment()
            .startOf('day')
            .toDate()
        }]
      },
      endDate: {
        title: 'Date d\'expiration',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          field: 'beginDate'
        }]
      }
    },
    initEvents: function () {
      this.on('duration:set  type:set', function () {
        var duration = this.getValue('duration');
        var values = duration.split('~');
        var numberOfDaysToAdd = parseInt(values[0]);
        this.model.set('duration', duration);
        this.setValue('endDate', moment(this.getValue('beginDate'))
          .add(numberOfDaysToAdd, values[1])
          .add(-1, 'days')
          .toDate());
        if ((this.getValue('type') !== null) && (this.getValue(
            'duration') !== '')) {
          var quote = mod.controller.container.get('quote');
          quote.set('type', this.getValue('type'));
          app.request('auto:frontierInsurance:getPremium', {
              quote: quote
            })
            .done(function (data) {
              quote.fromRequest(data.quote);
            })
            .fail(app.fail);
        }
      });
      this.on('beginDate:set', function () {
        var self = this;
        var duration = this.model.get('duration');
        var values = duration.split('~');
        var numberOfDaysToAdd = parseInt(values[0]);
        self.model.set('beginDate', self.getValue('beginDate'));
        self.setValue('endDate', moment(self.getValue('beginDate'))
          .add(numberOfDaysToAdd, values[1])
          .toDate());
      });
    },
    initListeners: function () {
      this.disable('beginDate', true);
      this.disable('endDate', true);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
        this.initListeners();
      }, this), 0);
      return this;
    }
  });
  mod.VehicleForm = app.common.CustForm.extend({
    template: _.template($('#auto-frontierInsurance-vehicle-form')
      .html()),
    schema: {
      vin: {
        title: 'Num de Chassis',
        type: 'CustText',
        validators: ['required']
      },
      make: {
        title: 'Marque',
        type: 'CustSelect',
        validators: ['required'],
        minInput: 1,
        request: 'auto:vehicle:makes'
      },
      registrationNumber: {
        title: 'Num d\'Immatricule',
        type: 'CustText',
        validators: ['required']
      },
      motorNumber: {
        title: 'N° Moteur',
        type: 'CustText',
      },
      internationalCode: {
        title: 'Sigle International',
        type: 'CustText',
      },
      trailerMake: {
        title: 'Marque',
        type: 'CustText',
      },
      trailerRegistrationNumber: {
        title: 'Matricule',
        type: 'CustText',
      }
    },
    initEvents: function () {
      this.on(
        'vin:set make:set registrationNumber:set motorNumber:set trailerMake:set trailerRegistrationNumber:set',
        function () {
          var self = this;
          self.model.set('vin', self.getValue('vin'));
          self.model.set('make', self.getValue('make'));
          self.model.set('registrationNumber', self.getValue(
            'registrationNumber'));
          self.model.set('motorNumber', self.getValue('motorNumber'));
          self.model.set('trailerMake', self.getValue('trailerMake'));
          self.model.set('trailerRegistrationNumber', self.getValue(
            'trailerRegistrationNumber'));
          _.defer(function () {
            self.model.trigger('premium');
          });
        });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.SubscriberForm = app.common.CustForm.extend({
    template: _.template($('#auto-frontierInsurance-subscriber-form')
      .html()),
    schema: {
      gender: {
        title: 'Titre',
        type: 'CustSelect',
        data: 'actors:person:genders',
        disabler: {
          lockcontrols: true
        }
      },
      firstName: {
        title: 'Prénom',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      lastName: {
        title: 'Nom',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      typePI: {
        title: 'Type de P.I',
        type: 'CustSelect',
        validators: ['required'],
        request: 'auto:frontierInsurance:idTypes'
      },
      numPI: {
        title: 'Num de P.I',
        type: 'CustText',
        validators: ['required']
      },
      countryOfOrigin: {
        title: 'Pays d\'origine',
        type: 'CustSelect',
        validators: ['required'],
        data: 'common:countryList'
      },
      addressOfCountryOfOrigin: {
        title: 'Adresse du pays d\'origine',
        validators: ['required'],
        type: 'CustText'
      }
    },
    initEvents: function () {
      this.on(
        'firstName:set lastName:set typePI:set numPI:set countryOfOrigin:set addressOfCountryOfOrigin:set',
        function () {
          var self = this;
          self.model.set('firstName', self.getValue('firstName'));
          self.model.set('lastName', self.getValue('lastName'));
          self.model.set('typePI', self.getValue('typePI'));
          self.model.set('numPI', self.getValue('numPI'));
          self.model.set('countryOfOrigin', self.getValue(
            'countryOfOrigin'));
          self.model.set('addressOfCountryOfOrigin', self.getValue(
            'addressOfCountryOfOrigin'));
          _.defer(function () {
            self.model.trigger('premium');
          });
        });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.ErrorView = Marionette.ItemView.extend({
    template: '#auto-frontierInsurance-display-error'
  });
  mod.ValidatePolicy = app.common.CustForm.extend({
    template: _.template($('#auto-frontierInsurance-actions-policy')
      .html()),
    schema: {
      attestationNumber: {
        title: 'Numéro de l\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list',
        validators: ['required']
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.receiptDoc.remove();
      this.attestationDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
    },
    validateContract: function () {
      this.commit();
      var container = mod.controller.container;
      var quote = container.get('quote');
      var vehicle = container.get('vehicle');
      var person = container.get('person');
      var errorQ = quote.trigger('commit');
      var errorV = vehicle.trigger('commit');
      var errorP = person.trigger('commit');
      if ((errorQ.validationError !== null) || (errorV.validationError !==
          null) || (errorP.validationError !== null)) {
        var dialog = new app.common.DiagView({
          el: '#modal'
        });
        dialog.setTitle('Alerte');
        var errorMsg = new mod.ErrorView();
        dialog.show(errorMsg);
        return;
      }
      else {
        this.$('.tkf-message-text')
          .addClass('hidden');
        this.$('a[data-actions="validateContract"]')
          .addClass('disabled');
        var attestationNumber = this.model.get('attestationNumber');
        app.request(
            'auto:frontierInsurance:validateFrontierInsuranceContract',
            container, attestationNumber)
          .done(function (data) {
            if (data.receipt === null) {
              app.alert('no receipt found');
            }
            else {
              var reference = quote.get('reference');
              var receiptRef = data.receiptRef;
              reference = data.reference;
              quote.set('reference', reference);
              quote.set('receiptRef', receiptRef);
              quote.set('isValid', true);
            }
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="validateContract"]': 'validateContract',
    }
  });
  //Bouton d'impression(QUITTANCE)
  mod.PrintBtns = Marionette.ItemView.extend({
    template: '#auto-frontierInsurance-print-buttons'
  });
  mod.GenerateDocs = Marionette.Layout.extend({
    template: '#auto-frontierInsurance-btn',
    regions: {
      validatePolicy: '.tkf-frontierInsurance-actionsPolicy',
      printBtns: '.tkf-frontierInsurance-printBtns'
    },
    onRender: function () {
      this.validatePolicy.show(new mod.ValidatePolicy({
        model: mod.controller.container.get('quote')
      }));
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:isValid', function () {
        this.printBtns.show(new mod.PrintBtns({
          model: mod.controller.container.get('quote')
        }));
      });
    }
  });
  mod.Content = Marionette.Layout.extend({
    template: '#auto-frontierInsurance-index',
    regions: {
      quote: '.tkf-quote-form',
      vehicle: '.tkf-vehicle',
      subscriber: '.tkf-subscriber',
      generateDocs: '.tkf-regenerate'
    },
    onRender: function () {
      this.quote.show(new mod.QuoteForm({
        model: mod.controller.container.get('quote')
      }));
      this.vehicle.show(new mod.VehicleForm({
        model: mod.controller.container.get('vehicle')
      }));
      this.subscriber.show(new mod.SubscriberForm({
        model: mod.controller.container.get('person')
      }));
      this.generateDocs.show(new mod.GenerateDocs());
    }
  });
});
