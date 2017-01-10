main.module('auto', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('auto:ui:index');
        },
        index: function () {
          app.execute('auto:ui:index');
        },
        error: function () {
          app.execute('auto:ui:error');
        }
      }
    });
  });
});

main.module('auto', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:ui:index', function () {
      app.auto.current = 'index';
      app.mainRegion.show(new mod.IndexView());
    });
    app.commands.setHandler('auto:ui:error', function () {
      app.auto.current = 'error';
      app.mainRegion.show(new mod.ErrorView());
    });
    app.commands.setHandler('auto:vehicle:energies', function (cb) {
      cb([{
        id: 'Essence',
        text: 'Essence'
      }, {
        id: 'Diesel',
        text: 'Diesel'
      }, {
        id: 'GPL',
        text: 'GPL'
      }, {
        id: 'Hybride',
        text: 'Hybride'
      }, {
        id: 'Electrique',
        text: 'Electrique'
      }]);
    });
    app.commands.setHandler('auto:contract:kinds', function (cb) {
      cb([{
        id: 'Renouvelable',
        text: 'Renouvelable'
      }, {
        id: 'Ferme',
        text: 'Ferme'
      }]);
    });
    app.commands.setHandler('auto:contract:frequencies', function (cb) {
      cb([{
        id: 'Annuel',
        text: 'Annuel'
      }, {
        id: 'Semestriel',
        text: 'Semestriel'
      }]);
    });
    app.commands.setHandler('auto:subscriber:types', function (cb) {
      cb([{
        id: 'Personne physique',
        text: 'Personne physique'
      }, {
        id: 'Personne morale',
        text: 'Personne morale'
      }]);
    });
    app.commands.setHandler('auto:insured:types', function (cb) {
      cb([{
        id: 'Souscripteur',
        text: 'Souscripteur'
      }, {
        id: 'Autre',
        text: 'Autre'
      }]);
    });
  });
});







main.module('auto', function (mod, app, Backbone, Marionette, $, _) {
  mod.Insured = Backbone.Model.extend({
    /*
     * usage: select
     * subUsage: select
     * bonus: select
     */
    defaults: {
      usage: null,
      subUsage: null,
      bonus: null
    }
  });
  mod.Vehicle = Backbone.Model.extend({
    /*
     * vin: text (numéro de chassis)
     * make: select (peugeot)
     * model: select (mégane)
     * kind: text (véhicule particulier...)
     * fuel: select (diesel)
     * power: num (puissane fiscale)
     * placesNumber: num (nombre de places)
     * emptyWeight: num (poids vide en KG)
     * totalWeight: num (poids total en KG)
     * payload: num (charge utile en KG)
     * registrationNumber: string (immatricule)
     * issueDate: date (première mise en circulation)
     * newValue: amount (valeur catalogue)
     * updatedValue: amount (valeur vénale)
     * vehicleModel: added in order to process the display of the fleet
       as model is reserved on collection same as model
     */
    dateAttributes: ['issueDate'],
    defaults: function () {
      return {
        make: null,
        model: null,
        power: null,
        issueDate: null,
        registrationNumber: null,
        vehicleModel: null,
        coverages: new mod.Coverages()
      };
    },
    validate: function (attrs) {
      if (attrs.newValue && attrs.newValue < attrs.updatedValue) {
        var res =
          'La valeur à neuf ne peut être inférieure à la valeur vénale';
        return res;
      }
    }
  });
  mod.Coverage = Backbone.Model.extend({
    /*
     * name: string
     * subscribed: boolean
     * subscribedModifiable: boolean
     * limit: amount
     * limitModifiable: boolean
     * minLimit: amount
     * maxLimit: amount
     * deductible: percent
     * deductibleModifiable: boolean
     * minDeductible: percent
     * maxDeductible: percent
     * rate: amount (tarif annuel)
     * premium: amount (prime nette / term)
     * tax: amount (tax sur prime nette)
     */
    defaults: {
      subscribed: false,
      subscribedModifiable: true,
      limit: null,
      limitModifiable: false,
      minLimit: 0,
      maxLimit: 1000000000,
      deductible: null,
      deductibleModifiable: false,
      minDeductible: 0,
      maxDeductible: 100,
      rate: null,
      premium: null,
      tax: null
    },
    initEvents: function () {
      this.on('premium', function () {
        if (!this.validationError && (this.hasChanged(
            'subscribed') || this.hasChanged('limit') || this.hasChanged(
            'deductible'))) {
          var quote;
          if (typeof (_.checkObjectTree(app.auto.subscribe,
              'controller.container')) !== 'undefined') {
            quote = app.auto.subscribe.controller.container.get(
              'quote');
          }
          else {
            quote = app.auto.fleet.controller.container.get(
              'quote');
          }
          app.request('auto:coverage:update', {
              quote: quote,
              coverage: this
            })
            .done(_.bind(function (data) {
              quote.fromRequest(data.quote);
              this.collection.update(data.coverages);
            }, this))
            .fail(app.fail);
        }
      });
    },
    initialize: function () {
      this.initEvents();
    }
  });
  mod.Coverages = Backbone.Collection.extend({
    model: mod.Coverage,
    update: function (coverages) {
      _.each(coverages, _.bind(function (coverage) {
        var c = this.findWhere({
          name: coverage.name
        });
        if (c) {
          c.fromRequest(coverage);
        }
      }, this));
    }
  });
  mod.Quote = Backbone.Model.extend({
    /*
     * reference: string
     * kind: (renewable or fixed duration)
     * billingFrequency: (annual or bi-annual)
     * effectiveDate: date (for renewable)
     * primaryTermDate: date (for renewable)
     * beginDate: date (for fixed duration)
     * endDate: date (for fixed duration)
     * premium: amount
     * fees: amount
     * taxes: amount
     * commission: amount
     * stampFGA: num
     * stampFSSR: num
     * stampFPAC: num
     * subscriber: select (personne physique ou morale)
     * subscriberName: string
     * subscriberPhone: string
     * subscriberEmail: string
     * insured: select (personne physique ou morale)
     * quoteDoc: quote printed offer
     * cpDoc: conditions particulières
     * attestationDoc: attestation d'assurance
     * receiptDoc: quittance
     */
    dateAttributes: ['effectiveDate', 'primaryTermDate', 'beginDate',
      'endDate', 'termDate', 'fleetTermDate'
    ],
    getRenewableKind: function () {
      return 'Renouvelable';
    },
    isRenewable: function () {
      return this.get('kind') === this.getRenewableKind();
    },
    getAnnualBillingFrequency: function () {
      return 'Annuel';
    },
    isBillingAnnual: function () {
      return this.get('billingFrequency') === this.getAnnualBillingFrequency();
    },
    getPersonSubscriber: function () {
      return 'Personne physique';
    },
    isSubscriberPerson: function () {
      return this.get('subscriber') === this.getPersonSubscriber();
    },
    wasSubscriberPerson: function () {
      return this.previous('subscriber') === this.getPersonSubscriber();
    },
    getPersonInsured: function () {
      return 'Personne physique';
    },
    isInsuredPerson: function () {
      return this.get('insured') === this.getPersonInsured();
    },
    wasInsuredPerson: function () {
      return this.previous('insured') === this.getPersonInsured();
    },
    defaults: function () {
      return {
        kind: this.getRenewableKind(),
        billingFrequency: this.getAnnualBillingFrequency(),
        effectiveDate: moment()
          .startOf('day')
          .add(1, 'd')
          .toDate(),
        primaryTermDate: moment()
          .startOf('day')
          .add(1, 'd')
          .add(1, 'y')
          .toDate(),
        termDate: moment()
          .startOf('day')
          .add(1, 'd')
          .add(1, 'y')
          .toDate(),
        beginDate: moment()
          .startOf('day')
          .add(1, 'd')
          .toDate(),
        endDate: moment()
          .startOf('day')
          .add(1, 'y')
          .toDate(),
        fleetTermDate: moment()
          .startOf('day')
          .add(1, 'd')
          .add(1, 'y')
          .toDate(),
        premium: null,
        fees: null,
        taxes: null,
        stampFGA: null,
        stampFSSR: null,
        stampFPAC: null,
        subscriber: this.getPersonSubscriber(),
        insured: this.getPersonInsured(),
        quoteDoc: new app.common.Doc({
          title: 'Devis'
        }),
        aeDoc: new app.common.Doc({
          title: 'Avis d\'échéance'
        }),
        cpDoc: new app.common.Doc({
          title: 'Conditions particulières'
        }),
        attestationDoc: new app.common.Doc({
          title: 'Attestation d\'assurance'
        }),
        receiptDoc: new app.common.Doc({
          title: 'Quittance'
        }),
        subscribeLink: new app.common.ProcessLink({
          title: 'Souscrire'
        }),
        transformLink: new app.common.ProcessLink({
          title: 'Transformer en contrat'
        }),
        validateLink: new app.common.ProcessLink({
          title: 'Valider'
        })
      };
    },
    initEvents: function () {
      this.on('change:billingFrequency', function () {
        if (!this.isBillingAnnual()) {
          this.set('primaryTermDate', moment(this.get(
              'effectiveDate'))
            .add(1, 'y')
            .toDate());
        }
      });
      this.on('change:effectiveDate', function () {
        this.set('primaryTermDate', moment(this.get(
            'effectiveDate'))
          .add(1, 'y')
          .toDate());
      });
      this.on('premium', function () {
        if (!this.validationError && (this.hasChanged('kind') ||
            this.hasChanged('billingFrequency') || this.hasChanged(
              'effectiveDate') || this.hasChanged(
              'primaryTermDate') || this.hasChanged('beginDate') ||
            this.hasChanged('endDate'))) {
          var quote = this;
          var coverages = app.auto.subscribe.controller.container
            .get('coverages');
          app.request('auto:coverage:list', {
              quote: quote
            })
            .done(function (data) {
              quote.fromRequest(data.quote);
              coverages.update(data.coverages);
            })
            .fail(app.fail);
        }
      });
    },
    initialize: function () {
      this.initEvents();
    }
  });
});

main.module('auto', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('auto:vehicle:usages', function (criterium) {
      return app.common.post('/svc/auto/vehicle/usages', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:bonuses', function (usage,
      criterium) {
      return app.common.post('/svc/auto/vehicle/bonuses', {
        usage: usage,
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:makes', function (criterium) {
      return app.common.post('/svc/auto/vehicle/makes', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:models', function (make,
      criterium) {
      return app.common.post('/svc/auto/vehicle/models', {
        make: make,
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:create', function (data) {
      return app.common.post('/svc/auto/vehicle/create', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest(),
        vehicle: data.vehicle.toRequest()
      });
    });
    app.reqres.setHandler('auto:vehicle:update', function (data) {
      return app.common.post('/svc/auto/vehicle/update', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest(),
        vehicle: data.vehicle.toRequest()
      });
    });
    app.reqres.setHandler('auto:coverage:list', function (data) {
      return app.common.post('/svc/auto/coverage/list', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:coverage:update', function (data) {
      return app.common.post('/svc/auto/coverage/update', {
        quote: data.quote.toRequest(),
        coverage: data.coverage.toRequest()
      });
    });
    app.reqres.setHandler('auto:subscriber:set', function (data) {
      return app.common.post('/svc/auto/subscriber/set', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest(),
        insured: data.insured.toRequest()
      });
    });
    app.reqres.setHandler('auto:beneficiary:set', function (data) {
      return app.common.post('/svc/auto/beneficiary/set', {
        quote: data.quote.toRequest(),
        beneficiary: data.beneficiary.toRequest()
      });
    });
    app.reqres.setHandler('auto:print:quote', function (data) {
      return app.common.post('/svc/auto/print/quote', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:contract:create', function (data) {
      return app.common.post('/svc/auto/contract/create', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:policy:get', function (data) {
      return app.common.post('/svc/auto/policy/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('auto:beneficiary:get', function (criterium) {
      return app.common.post('/svc/auto/beneficiary/get', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:attestation:list', function (policy,
      criterium) {
      return app.common.post('/svc/auto/attestation/list', {
        policy: policy,
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:coverage:check', function (data) {
      return app.common.post('/svc/auto/coverage/check', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:term:get', function (data) {
      return app.common.post('/svc/auto/term/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('auto:fleet:save', function (data) {
      return app.common.post('/svc/auto/fleet/save', {
        vehicle: data.vehicle.toRequest(),
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:add', function (data) {
      return app.common.post('/svc/auto/fleet/add', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:remove', function (data) {
      return app.common.post('/svc/auto/fleet/remove', {
        vehicle: data.vehicle.toRequest(),
        vehicles: data.vehicles.toRequest(),
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:summary', function (data) {
      return app.common.post('/svc/auto/fleet/summary', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:recalculate', function (data) {
      return app.common.post('/svc/auto/fleet/recalculate', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:create', function (data) {
      return app.common.post('/svc/auto/fleet/create', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:get', function (data) {
      return app.common.post('/svc/auto/fleet/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('auto:fleet:validate', function (data) {
      return app.common.post('/svc/auto/fleet/validate', {
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:printAttestation', function (data) {
      return app.common.post('/svc/auto/fleet/printAttestation', {
        vehicle: data.vehicle.toRequest(),
        attestation: data.attestation,
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:printvehicle', function (data) {
      return app.common.post('/svc/auto/fleet/printVehicle', {
        vehicle: data.vehicle.toRequest(),
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:getVehicle', function (data) {
      return app.common.post('/svc/auto/fleet/getVehicle', {
        quote: data.quote.toRequest(),
        vehicle: data.vehicle.toRequest(),
        forEdit: data.forEdit
      });
    });
    app.reqres.setHandler('auto:fleet:exportFleet', function (data) {
      return app.common.post('/svc/auto/fleet/exportFleet', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:lockvalidation', function (data) {
      return app.common.post('/svc/auto/fleet/admin/lockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:unlockvalidation', function (data) {
      return app.common.post(
        '/svc/auto/fleet/admin/unlockvalidation', {
          policy: data.policy.toRequest(),
          valid: data.valid.toRequest()
        });
    });
    app.reqres.setHandler('auto:admin:lockvalidation', function (data) {
      return app.common.post('/svc/auto/fleet/admin/lockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:applyBonus', function (data) {
      return app.common.post('/svc/auto/fleet/admin/applyBonus', {
        policy: data.policy.toRequest(),
        bonus: data.bonus.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:revertBonus', function (data) {
      return app.common.post('/svc/auto/fleet/admin/revertBonus', {
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:saveBonus', function (data) {
      return app.common.post('/svc/auto/fleet/admin/saveBonus', {
        policy: data.policy.toRequest(),
        vehicle: data.vehicle.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:usages', function (reference) {
      return app.common.post('/svc/auto/fleet/usages', {
        id: reference
      });
    });
    app.reqres.setHandler('auto:fleet:covers', function (reference) {
      return app.common.post('/svc/auto/fleet/covers', {
        id: reference
      });
    });
    app.reqres.setHandler('auto:admin:cancelDiscount', function (data) {
      return app.common.post('/svc/auto/admin/cancelDiscount', {
        discount: data.discount
      });
    });
    app.reqres.setHandler('auto:admin:saveDiscount', function (data) {
      return app.common.post('/svc/auto/admin/saveDiscount', {
        discount: data.discount
      });
    });
    app.reqres.setHandler('auto:subscribe:checkLockSubscription',
      function () {
        return app.common.post(
          '/svc/auto/subscribe/checkLockSubscription');
      });
    app.reqres.setHandler('auto:frontierInsurance:listUsages', function (
      criterium) {
      return app.common.post('/svc/auto/getListUsages', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:frontierInsurance:durationsList',
      function (criterium) {
        return app.common.post('/svc/auto/getDurationsList', {
          criterium: criterium
        });
      });
    app.reqres.setHandler('auto:frontierInsurance:idTypes', function (
      criterium) {
      return app.common.post('/svc/auto/getIdTypes', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:frontierInsurance:getPremium', function (
      data) {
      return app.common.post('/svc/auto/getPremium', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler(
      'auto:frontierInsurance:validateFrontierInsuranceContract',
      function (container, attestationNumber) {
        return app.common.post(
          '/svc/auto/validateFrontierInsuranceContract', {
            container: container,
            attestationNumber: attestationNumber
          });
      });
    app.reqres.setHandler('auto:frontierInsurance:getListOfCountries',
      function (criterium) {
        return app.common.post('/svc/auto/getListOfCountries', {
          criterium: criterium
        });
      });
  });
});

main.module('auto', function (mod, app, Backbone, Marionette, $, _) {
  mod.IndexView = Marionette.ItemView.extend({
    template: '#auto-index'
  });
  mod.ErrorView = Marionette.ItemView.extend({
    template: '#auto-error'
  });
  mod.InsuredForm = app.common.CustForm.extend({
    template: _.template($('#auto-insured-form')
      .html()),
    schema: {
      usage: {
        title: 'Usage',
        type: 'CustSelect',
        validators: ['required'],
        minInput: 1,
        request: 'auto:vehicle:usages'
      },
      bonus: {
        title: 'Bonus',
        type: 'CustSelect',
        validators: ['required'],
        request: 'auto:vehicle:bonuses',
        requestParam: 'usage'
      }
    }
  });
  mod.VehicleForm = app.common.CustForm.extend({
    template: _.template($('#auto-vehicle-form')
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
      model: {
        title: 'Modèle',
        type: 'CustSelect',
        validators: ['required'],
        minInput: 1,
        request: 'auto:vehicle:models',
        requestParam: 'make'
      },
      fuel: {
        title: 'Energie',
        type: 'CustSelect',
        data: 'auto:vehicle:energies'
      },
      power: {
        title: 'Puissance',
        type: 'CustNumber',
        unit: 'CV',
        validators: ['required']
      },
      placesNumber: {
        title: 'Nb de Places',
        type: 'CustNumber',
        unit: 'Places',
        validators: ['required']
      },
      emptyWeight: {
        title: 'Poids Vide',
        type: 'CustNumber',
        unit: 'Tonnes (PV)'
      },
      totalWeight: {
        title: 'Poids Tot',
        type: 'CustNumber',
        unit: 'Tonnes (PT)'
      },
      payload: {
        title: 'Charge Utile',
        type: 'CustNumber',
        unit: 'Tonnes (CU)'
      },
      registrationNumber: {
        title: 'Num d\'Immatricule',
        type: 'CustText',
        validators: ['required']
      },
      issueDate: {
        title: 'Date PMC',
        type: 'CustDate',
        validators: ['required']
      },
      newValue: {
        title: 'Val Catalogue',
        type: 'CustNumber',
        unit: 'DT (Cat)'
      },
      updatedValue: {
        title: 'Val Vénale',
        type: 'CustNumber',
        unit: 'DT (Vén)',
        validators: ['required']
      },
    },
    initEvents: function () {
      this.on('make:change', function () {
        this.setValue('model', null);
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
  mod.QuoteFormProperties = app.common.CustForm.extend({
    template: _.template($('#auto-quote-form-properties')
      .html()),
    schema: {
      kind: {
        title: 'Nature du contrat',
        type: 'CustSelect',
        data: 'auto:contract:kinds',
        validators: ['required']
      },
      billingFrequency: {
        title: 'Fractionnement',
        type: 'CustSelect',
        data: 'auto:contract:frequencies',
        validators: ['required']
      }
    },
    hideBillingFrequency: function (hi) {
      if (hi) {
        this.$('[data-fields="billingFrequency"]')
          .parent()
          .addClass('hidden');
      }
      else {
        this.$('[data-fields="billingFrequency"]')
          .parent()
          .removeClass('hidden');
      }
    },
    initEvents: function () {
      this.on('kind:set billingFrequency:set', function () {
        this.commit();
        var self = this;
        _.defer(function () {
          self.model.trigger('premium');
        });
      });
    },
    initListeners: function () {
      this.listenTo(this.model, 'change:kind', function () {
        this.hideBillingFrequency(!this.model.isRenewable());
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.hideBillingFrequency(!this.model.isRenewable());
        this.initEvents();
        this.initListeners();
      }, this), 0);
      return this;
    }
  });
  mod.QuoteFormRenewableDates = app.common.CustForm.extend({
    template: _.template($('#auto-quote-form-ren-dates')
      .html()),
    templateData: function () {
      return {
        intermediateTermDate: moment(this.model.effectiveDate)
          .add(6, 'M')
          .toDate()
      };
    },
    schema: {
      effectiveDate: {
        title: 'Date d\'effet',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          value: moment()
            .startOf('day')
            .toDate()
        }]
      },
      primaryTermDate: {
        title: 'Date d\'échéance principale',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          field: 'effectiveDate'
        }]
      }
    },
    refreshForAnnual: function (annual) {
      if (annual) {
        this.$('[data-values="intermediateTermDate"]')
          .parent()
          .addClass('hidden');
        this.disable('primaryTermDate', false);
      }
      else {
        this.$('[data-values="intermediateTermDate"]')
          .parent()
          .removeClass('hidden');
        this.disable('primaryTermDate', true);
      }
    },
    initEvents: function () {
      this.on('effectiveDate:set', function () {
        this.$('[data-values="intermediateTermDate"]')
          .text(_.beautifyDate(moment(this.getValue(
              'effectiveDate'))
            .add(6, 'M')
            .toDate()));
      });
      this.on('effectiveDate:set primaryTermDate:set', function () {
        this.commit();
        var self = this;
        _.defer(function () {
          self.model.trigger('premium');
        });
      });
    },
    initListeners: function () {
      this.listenTo(this.model, 'change:billingFrequency', function () {
        this.refreshForAnnual(this.model.isBillingAnnual());
      });
      this.listenTo(this.model, 'change:primaryTermDate', function () {
        this.setValue('primaryTermDate', this.model.get(
          'primaryTermDate'));
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.refreshForAnnual(this.model.isBillingAnnual());
        this.initEvents();
        this.initListeners();
      }, this), 0);
      return this;
    }
  });
  mod.QuoteFormFixedDurationDates = app.common.CustForm.extend({
    template: _.template($('#auto-quote-form-fix-dates')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
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
    setUI: function () {
      this.$('[data-values="duration"]')
        .text(_.beautifyDuration(this.getValue('beginDate'), this.getValue(
          'endDate')));
    },
    initEvents: function () {
      this.on('beginDate:set', function () {
        this.setValue('endDate', moment(this.getValue('beginDate'))
          .add(1, 'y')
          .add(-1, 'd')
          .toDate());
      });
      this.on('beginDate:set endDate:set', function () {
        this.commit();
        this.setUI();
        var self = this;
        _.defer(function () {
          self.model.trigger('premium');
        });
      });
    },
    initListeners: function () {
      this.listenTo(this.model, 'change:endDate', function () {
        this.setValue('endDate', this.model.get('endDate'));
      });
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
  mod.QuoteForm = Marionette.Layout.extend({
    template: '#auto-quote-form',
    regions: {
      properties: '.tkf-properties',
      dates: '.tkf-dates'
    },
    renderProperties: function () {
      var v = new mod.QuoteFormProperties({
        model: this.model
      });
      this.properties.show(v);
    },
    renderDates: function () {
      var v;
      if (this.model.isRenewable()) {
        v = new mod.QuoteFormRenewableDates({
          model: this.model
        });
      }
      else {
        v = new mod.QuoteFormFixedDurationDates({
          model: this.model
        });
      }
      this.dates.show(v);
    },
    onRender: function () {
      this.renderProperties();
      this.renderDates();
    },
    modelEvents: {
      'change:kind': 'renderDates'
    }
  });
  mod.CoverageFormRow = app.common.CustForm.extend({
    template: _.template($('#auto-coverage-form-row')
      .html()),
    schema: {
      subscribed: {
        title: 'Subscribed',
        type: 'CustCheckbox',
        disabler: {
          subscribedModifiable: false
        }
      },
      limit: {
        title: 'Capital',
        type: 'CustNumber',
        unit: 'DT',
        checkOnChange: true,
        disabler: {
          subscribed: false,
          limitModifiable: false
        },
        validators: [{
          type: 'min',
          field: 'minLimit'
        }, {
          type: 'max',
          field: 'maxLimit'
        }]
      },
      deductible: {
        title: 'Franchise',
        type: 'CustNumber',
        unit: '%',
        checkOnChange: true,
        disabler: {
          subscribed: false,
          deductibleModifiable: false
        },
        validators: [{
          type: 'min',
          field: 'minDeductible'
        }, {
          type: 'max',
          field: 'maxDeductible'
        }]
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    setUI: function () {
      var subscribed = this.model.get('subscribed');
      var subscribedModifiable = this.model.get(
        'subscribedModifiable');
      this.$el.removeClass('active success warning danger info');
      if (subscribed) {
        if (!subscribedModifiable) {
          this.$el.addClass('active');
        }
        else {
          this.$el.addClass('success');
        }
      }
      else {
        if (!subscribedModifiable) {
          this.$el.addClass('danger');
        }
      }
    },
    initEvents: function () {
      this.on('subscribed:set limit:set deductible:set', function () {
        this.commit();
        this.setUI();
        this.model.trigger('premium');
      });
    },
    initListeners: function () {
      this.listenTo(this.model, 'change:rate', function () {
        this.$('[data-values="rate"]')
          .text(_.beautifyAmount(this.model.get('rate')));
      });
      this.listenTo(this.model, 'change:premium', function () {
        this.$('[data-values="premium"]')
          .text(_.beautifyAmount(this.model.get('premium')));
      });
      this.listenTo(this.model, 'change:tax', function () {
        this.$('[data-values="tax"]')
          .text(_.beautifyAmount(this.model.get('tax')));
      });
      this.listenTo(this.model, 'change:subscribed', function () {
        this.setValue('subscribed', this.model.get('subscribed'));
        this.setUI();
        this.trigger('subscribed:change'); // enabling is based on form change evt
      });
      this.listenTo(this.model, 'change:limit', function () {
        this.setValue('limit', this.model.get('limit'));
      });
      this.listenTo(this.model, 'change:deductible', function () {
        this.setValue('deductible', this.model.get('deductible'));
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.setUI();
        this.initEvents();
        this.initListeners();
      }, this), 0);
      return this;
    }
  });
  mod.CoverageFormTable = Marionette.CompositeView.extend({
    template: '#auto-coverage-form-table',
    itemView: mod.CoverageFormRow,
    itemViewContainer: 'tbody'
  });
  mod.QuoteConsultHeader = Marionette.ItemView.extend({
    template: '#auto-quote-consult-header',
    ui: {
      billingFrequency: '[data-values="billingFrequency"]',
      effectiveDate: '[data-values="effectiveDate"]',
      primaryTermDate: '[data-values="primaryTermDate"]',
      beginDate: '[data-values="beginDate"]',
      endDate: '[data-values="endDate"]'
    },
    onRender: function () {
      if (this.model.isRenewable()) {
        this.ui.beginDate.parent()
          .addClass('hidden');
        this.ui.endDate.parent()
          .addClass('hidden');
      }
      else {
        this.ui.billingFrequency.parent()
          .addClass('hidden');
        this.ui.effectiveDate.parent()
          .addClass('hidden');
        this.ui.primaryTermDate.parent()
          .addClass('hidden');
      }
    }
  });
  mod.QuoteConsultVehicle = Marionette.ItemView.extend({
    template: '#auto-quote-consult-vehicle'
  });
  mod.QuoteConsultPremium = Marionette.ItemView.extend({
    template: '#auto-quote-consult-premium',
    templateHelpers: {
      totalPremium: function () {
        return this.premium + this.fees + this.taxes + this.stampFGA +
          this.stampFSSR + this.stampFPAC;
      }
    }
  });
  mod.CoverageConsultRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#auto-coverage-consult-row'
  });
  mod.CoverageConsultTable = Marionette.CompositeView.extend({
    template: '#auto-coverage-consult-table',
    itemView: mod.CoverageConsultRow,
    itemViewContainer: 'tbody'
  });
  mod.QuoteConsultMessage = Marionette.ItemView.extend({
    template: '#auto-quote-consult-message'
  });
  mod.QuoteSave = app.common.CustForm.extend({
    template: _.template($('#auto-quote-save')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.docView = new app.common.DocView({
        model: this.model.get('quoteDoc')
      });
    },
    remove: function () {
      this.docView.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    schema: {
      subscriber: {
        title: 'Type du souscripteur',
        type: 'CustSelect',
        data: 'auto:subscriber:types',
        validators: ['required'],
      },
      subscriberName: {
        title: 'Nom',
        type: 'CustText',
        validators: ['required']
      },
      subscriberPhone: {
        title: 'Téléphone',
        type: 'CustText',
        dataType: 'tel',
        validators: ['required']
      },
      subscriberEmail: {
        title: 'Email',
        type: 'CustText',
        dataType: 'email',
        validators: ['email']
      }
    },
    save: function () {
      var self = this;
      var error = this.commit();
      if (!error) {
        app.request('auto:print:quote', {
            quote: this.model
          })
          .done(function (data) {
            var doc = self.model.get('quoteDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
          })
          .fail(function (q) {
            self.model.get('quoteDoc')
              .set('error', q.responseText);
          });
      }
    },
    events: {
      'click a[data-actions="save"]': 'save',
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="print"]')
        .append(this.docView.render()
          .el);
    }
  });
  mod.QuoteFormBeneficiary = app.common.CustForm.extend({
    template: _.template($('#auto-quote-form-beneficiary')
      .html()),
    schema: {
      id: {
        title: 'Registre du commerce',
        type: 'CustText'
      },
      companyName: {
        title: 'Raison sociale',
        type: 'CustSelect',
        request: 'auto:beneficiary:get',
      },
      phone: {
        title: 'Téléphone',
        type: 'CustText'
      },
      beneficiaryClause: {
        title: 'Clause bénéficiaire',
        type: 'CustSelect',
        data: 'actors:beneficiary:clauses'
      },
      fax: {
        title: 'Fax',
        type: 'CustText'
      },
      address: {
        title: 'Adresse',
        type: 'CustText'
      },
      withdrawalDate: {
        title: 'Date de main levée',
        type: 'CustDate'
      }
    }
  });
  mod.QuoteFormSubscriber = app.common.CustForm.extend({
    template: _.template($('#auto-quote-form-subscriber')
      .html()),
    schema: {
      subscriber: {
        title: 'Type du souscripteur',
        type: 'CustSelect',
        data: 'auto:subscriber:types',
        validators: ['required'],
        commitOnSet: true
      }
    }
  });
  mod.QuoteFormInsured = app.common.CustForm.extend({
    template: _.template($('#auto-quote-form-insured')
      .html()),
    schema: {
      insuredType: {
        title: 'Assuré',
        type: 'CustSelect',
        data: 'auto:insured:types',
        validators: ['required'],
        commitOnSet: true
      },
      insured: {
        title: 'Type assuré',
        type: 'CustSelect',
        data: 'auto:subscriber:types',
        validators: ['required'],
        commitOnSet: true
      }
    }
  });
  mod.ContractSave = Marionette.Layout.extend({
    template: '#auto-contract-save',
    onRender: function () {
      if (this.model.get('contractref')) {
        this.$('[data-actions="save"]')
          .addClass('disabled');
      }
      this.$('[data-actions="validate"]')
        .append(this.validateLink.render()
          .el);
    },
    initialize: function () {
      Marionette.Layout.prototype.initialize.apply(this, arguments);
      this.validateLink = new app.common.LinkView({
        model: this.model.get('validateLink')
      });
    },
    save: function () {
      var self = this;
      var quote = this.model;
      app.request('auto:contract:create', {
          quote: this.model
        })
        .done(function (data) {
          var validateLink = self.model.get('validateLink');
          quote.fromRequest(data.quote);
          validateLink.fromRequest(data.quote.validateLink);
          self.$('[data-actions="save"]')
            .addClass('disabled');
          self.$('[data-actions="validate"]')
            .removeClass('disabled');
          self.validateLink.renderTitle();
        })
        .fail(app.fail);
    },
    events: {
      'click p[data-actions="save"]': 'save'
    }
  });
});

main.module('auto.consult', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'consult/id/:id': function (id) {
        app.execute('auto:consult', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('auto.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:consult', function (id) {
      app.auto.current = 'consult';
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});

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





main.module('auto.consult', function (mod, app, Backbone) {
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

main.module('auto.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('auto:contract:validate', function (data) {
      return app.common.post('/svc/auto/contract/validate', {
        policy: data.policy.toRequest(),
        settlements: data.settlements.toRequest(),
        attestationNumber: data.attestationNumber
      });
    });
    app.reqres.setHandler('auto:contract:regenerate', function (data) {
      return app.common.post('/svc/auto/contract/regenerate', {
        policy: data.policy.toRequest()
      });
    });
  });
});

main.module('auto.consult', function (mod, app, Backbone, Marionette, $, _) {
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#auto-consult',
    regions: {
      header: '.tkf-header',
      vehicle: '.tkf-vehicle',
      coverages: '.tkf-coverages',
      premium: '.tkf-premium',
      subscriber: '.tkf-subscriber',
      payment: '.tkf-payment',
      paymentList: '.tkf-payment-list',
      actionsQuote: '.tkf-actions-quote',
      actionsPolicy: '.tkf-actions-policy',
      message: '.tkf-message'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var vehicle = mod.controller.container.get('vehicle');
      var coverages = mod.controller.container.get('coverages');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      var settlement = mod.controller.container.get('settlement');
      var settlements = mod.controller.container.get('settlements');
      var ref = policy.get('reference');
      policy.set('remainingAmont', policy.get('totalContribution'));
      this.listenTo(policy, 'change:validated', function () {
        var pol = mod.controller.container.get('policy');
        if (pol.get('validated')) {
          this.$('.tkf-payment')
            .addClass('hidden');
          this.$('[data-actions="erase"]')
            .addClass('hidden');
        }
      });
      this.header.show(new app.auto.QuoteConsultHeader({
        model: policy
      }));
      this.vehicle.show(new app.auto.QuoteConsultVehicle({
        model: vehicle
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: new app.auto.Coverages(coverages.filter(
          function (c) {
            return c.get('subscribed');
          }))
      }));
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: policy
      }));
      if (person.id) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: person
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: company
        }));
      }
      if (policy.get('isquote')) {
        this.$('.page-header.tkf-consult-title h3')
          .append(' Devis N° ' + ref);
        this.actionsQuote.show(new mod.ActionsQuoteConsult({
          model: policy
        }));
        this.$('.list-group-item.tkf-actions-policy')
          .addClass('hidden');
        this.$('.tkf-payment')
          .addClass('hidden');
        this.$('.list-group-item.tkf-payment-list')
          .addClass('hidden');
      }
      else {
        this.$('.list-group-item.tkf-actions-quote')
          .addClass('hidden');
        this.$('.page-header.tkf-consult-title h3')
          .append(' Police N° ' + ref);
        if (policy.get('validated')) {
          this.actionsPolicy.show(new mod.ActionsPolicyConsult({
            model: policy
          }));
          if (settlements.length !== 0) {
            this.paymentList.show(new mod.Payments({
              collection: settlements
            }));
          }
          else {
            this.$('.list-group-item.tkf-payment-list')
              .addClass('hidden');
          }
        }
        else {
          this.actionsPolicy.show(new mod.ActionsValidate({
            model: policy
          }));
          this.payment.show(new mod.Payment({
            model: settlement
          }));
          this.paymentList.show(new mod.Payments({
            collection: settlements
          }));
        }
      }
    }
  });
  mod.ActionsQuoteConsult = app.common.CustForm.extend({
    template: _.template($('#auto-consult-actions-quote')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.quoteDoc = new app.common.DocView({
        model: this.model.get('quoteDoc')
      });
      this.subscribeLink = new app.common.LinkView({
        model: this.model.get('subscribeLink')
      });
    },
    remove: function () {
      this.quoteDoc.remove();
      this.subscribeLink.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="print"]')
        .append(this.quoteDoc.render()
          .el);
      this.$('[data-actions="subscribe"]')
        .append(this.subscribeLink.render()
          .el);
    }
  });
  mod.ActionsPolicyConsult = app.common.CustForm.extend({
    template: _.template($('#auto-consult-actions-policy')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.cpDoc = new app.common.DocView({
        model: this.model.get('cpDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.cpDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="cpPrint"]')
        .append(this.cpDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      var doccp = this.model.get('cpDoc');
      var docat = this.model.get('attestationDoc');
      var docrc = this.model.get('receiptDoc');
      if (doccp.hasURL() && docrc.hasURL() && docat.hasURL()) {
        this.$('.row.tkf-regenerate')
          .addClass('hidden');
      }
      else {
        this.$('.row.tkf-regenerate')
          .removeClass('hidden');
      }
    },
    regenerate: function () {
      var self = this;
      var docs = {};
      var policy = mod.controller.container.get('policy');
      app.request('auto:contract:regenerate', {
          policy: policy
        })
        .done(function (data) {
          docs = data.docs;
          var doccp = self.model.get('cpDoc');
          doccp.unset('error');
          doccp.fromRequest(docs.cpdoc);
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(docs.rcdoc);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="regenerate"]': 'regenerate',
    }
  });
  mod.ActionsValidate = app.common.CustForm.extend({
    template: _.template($('#auto-consult-validate-policy')
      .html()),
    schema: {
      attestationNumber: {
        title: 'Numéro de l\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list',
        requestParam: 'reference'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.cpDoc = new app.common.DocView({
        model: this.model.get('cpDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.cpDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="cpPrint"]')
        .append(this.cpDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      this.$('.tkf-message-text')
        .addClass('hidden');
    },
    validateContract: function () {
      this.commit();
      this.$('.tkf-message-text')
        .addClass('hidden');
      var self = this;
      var docs = {};
      var settlements = mod.controller.container.get('settlements');
      var attestationNumber = this.model.get('attestationNumber');
      var policy = mod.controller.container.get('policy');
      app.request('auto:contract:validate', {
          policy: policy,
          settlements: settlements,
          attestationNumber: attestationNumber
        })
        .done(function (data) {
          policy.set('validated', true);
          docs = data.docs;
          var doccp = self.model.get('cpDoc');
          doccp.unset('error');
          doccp.fromRequest(docs.cpdoc);
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(docs.rcdoc);
          self.$('[data-actions="validate"]')
            .addClass('disabled');
          self.disable('attestationNumber', true);
          self.$('[data-actions="validate"]')
            .addClass('disabled');
        })
        .fail(function (data) {
          self.$('.tkf-message-text')
            .removeClass('hidden');
          self.$('.tkf-message-text')
            .text(data.responseText);
        });
    },
    events: {
      'click a[data-actions="validate"]': 'validateContract',
    }
  });
  mod.Payment = app.common.CustForm.extend({
    template: _.template($('#auto-payment-form')
      .html()),
    schema: {
      mode: {
        title: 'Mode',
        type: 'CustSelect',
        data: 'common:settlementMode'
      },
      amount: {
        title: 'Montant',
        type: 'CustNumber'
      },
      date: {
        title: 'Date',
        type: 'CustDate'
      },
      num: {
        title: 'Référence',
        type: 'CustText'
      },
      bank: {
        title: 'Banque',
        type: 'CustSelect',
        data: 'common:banklist'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    disableFields: function (disable) {
      this.disable('num', disable);
      this.disable('bank', disable);
      this.disable('date', disable);
    },
    onModeChange: function () {
      var mode = this.getValue('mode');
      if (mode === '1') {
        this.disableFields(true);
      }
      else if (mode === '0' || mode === '2' || mode === '3') {
        this.disableFields(false);
      }
    },
    clearValues: function () {
      this.model.clear();
      this.setValue('num', null);
      this.setValue('bank', null);
      this.setValue('date', null);
    },
    initEvents: function () {
      this.on('mode:set', function () {
        this.clearValues();
        this.onModeChange();
      });
      var policy = mod.controller.container.get('policy');
      this.listenTo(policy, 'change:remainingAmont', function () {
        var pol = mod.controller.container.get('policy');
        var remaining = pol.get('remainingAmont');
        this.setValue('amount', remaining.toFixed(3));
      });
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      var policy = mod.controller.container.get('policy');
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.onModeChange();
        this.initEvents();
        this.setValue('amount', policy.get('totalContribution')
          .toFixed(3));
      }, this), 0);
      return this;
    },
    addPayment: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont')
        .toFixed(3);
      var amount = this.getValue('amount')
        .toFixed(3);
      var remaining = remainingAmont - amount;
      if (remaining < 0) {
        return false;
      }
      this.commit();
      if (this.validatePayment()) {
        settlements.add(this.model);
        this.model = new mod.Settlement();
        this.clearValues();
        this.setValue('mode', null);
        this.setValue('date', null);
        this.disableFields(true);
        policy.set('remainingAmont', remaining);
      }
    },
    validatePayment: function () {
      var mode = this.model.get('mode');
      var amount = this.model.get('amount');
      var date = this.model.get('date');
      var num = this.model.get('num');
      var bank = this.model.get('bank');
      if (mode === '') {
        return false;
      }
      if (amount === null) {
        return false;
      }
      if (mode === '0' || mode === '2') {
        if (date === null || num === '' || bank === '') {
          return false;
        }
      }
      return true;
    },
    events: {
      'click [data-actions="addPayment"]': 'addPayment',
    }
  });
  mod.PaymentRow = Marionette.ItemView.extend({
    template: '#auto-payment-consult-row',
    tagName: 'tr',
    templateHelpers: {
      updateSettlementMode: function () {
        var mode = this.mode;
        if (mode === '0') {
          return 'Virement';
        }
        else if (mode === '1') {
          return 'Espèces/Versement';
        }
        else if (mode === '2') {
          return 'Chèque';
        }
        else if (mode === '3') {
          return 'Traite';
        }
      }
    },
    erase: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont');
      policy.set('remainingAmont', remainingAmont + this.model.get(
        'amount'));
      settlements.remove(this.model);
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  mod.Payments = Marionette.CompositeView.extend({
    template: '#auto-payment-consult-table',
    itemView: mod.PaymentRow,
    itemViewContainer: 'tbody'
  });
});

main.module('auto.fleet', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        fleet: function () {
          app.execute('auto:fleet:new');
        },
        'fleet/id/:id': function (id) {
          app.execute('auto:fleet:existing', id);
        },
        'fleet/step/:step': function (step) {
          app.execute('auto:fleet:step', parseInt(step));
        }
      }
    });
  });
});

main.module('auto.fleet', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:fleet:new', function () {
      app.auto.current = 'fleet';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
      mod.router.navigate('fleet/step/1', {
        trigger: true,
        replace: false
      });
    });
    app.commands.setHandler('auto:fleet:existing', function (id) {
      app.auto.current = 'fleet';
      mod.controller = new mod.Controller();
      mod.controller.container.reset();
      mod.controller.launch(id);
    });
    app.commands.setHandler('auto:fleet:step', function (rank) {
      if (app.auto.current === 'fleet') {
        var current = mod.controller.getActiveStep();
        if (!current) {
          rank = 1;
          mod.controller.activateStep(mod.controller.getStep(rank),
            true);
        }
        else if (rank) {
          delete current.validationError;
          var step = mod.controller.getStep(rank);
          var curRank = current.get('rank');
          if (rank <= curRank) {
            mod.controller.activateStep(step);
          }
          else if (rank > curRank + 1) {
            current.validationError =
              'Vous ne pouvez pas sauter les étapes';
            mod.controller.freezeStep();
          }
          else {
            current.executeCheck(function () {
              if (current.validationError) {
                mod.controller.freezeStep();
              }
              else {
                current.executeAfter(function () {
                  if (current.validationError) {
                    mod.controller.freezeStep();
                  }
                  else {
                    mod.controller.activateStep(step);
                  }
                });
              }
            });
          }
        }
      }
      else {
        mod.router.navigate('error', {
          trigger: true,
          replace: false
        });
      }
    });
  });
});

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





main.module('auto.fleet', function (mod, app, Backbone, Marionette, $, _) {
  mod.Step = app.common.Step.extend({
    getPath: function () {
      return 'fleet/step/' + this.get('rank');
    }
  });
  mod.Summary = Backbone.Model.extend({
    defaults: function () {
      return {
        contract: [],
        premium: [],
        subscriber: []
      };
    },
    updateContract: function (quote) {
      var data = [];
      var kind = quote.get('kind');
      if (kind) {
        data.push(kind);
      }
      if (quote.isRenewable()) {
        var effectiveDate = quote.get('effectiveDate');
        if (effectiveDate) {
          data.push('D. d\'effet: ' + _.beautifyDate(effectiveDate));
        }
        var billingFrequency = quote.get('billingFrequency');
        if (billingFrequency) {
          data.push('Quittancement: ' + billingFrequency);
        }
      }
      else {
        var beginDate = quote.get('beginDate');
        if (beginDate) {
          data.push('D. d\'effet: ' + _.beautifyDate(beginDate));
        }
      }
      this.set('contract', data);
    },
    updatePremium: function (quote) {
      var data = [];
      var total = 0;
      var premium = quote.get('premium');
      if (premium) {
        data.push('Assurance: ' + _.beautifyAmount(premium));
        total += premium;
      }
      var fees = quote.get('fees');
      if (fees) {
        data.push('Frais: ' + _.beautifyAmount(fees));
        total += fees;
      }
      var taxes = quote.get('taxes');
      if (taxes) {
        data.push('Taxes: ' + _.beautifyAmount(taxes));
        total += taxes;
      }
      var stamps = 0;
      var stampFGA = quote.get('stampFGA');
      if (stampFGA) {
        stamps += stampFGA;
      }
      var stampFSSR = quote.get('stampFSSR');
      if (stampFSSR) {
        stamps += stampFSSR;
      }
      var stampFPAC = quote.get('stampFPAC');
      if (stampFPAC) {
        stamps += stampFPAC;
      }
      if (stamps) {
        data.push('Timbres: ' + _.beautifyAmount(stamps));
        total += stamps;
      }
      if (total) {
        data.push('Total: ' + _.beautifyAmount(total) + ' TTC');
      }
      var applyRC = quote.get('applyRC');
      if (applyRC) {
        var premiumMessage =
          '<span class="contribution-message">Avant';
        premiumMessage += ' application Bonus</span>';
        data.push(premiumMessage);
      }
      this.set('premium', data);
    },
    updatePersonSubscriber: function (person) {
      var data = [];
      var id = person.get('id');
      if (id) {
        data.push('CIN: ' + id);
      }
      var fullName = person.getFullName();
      if (fullName) {
        data.push(fullName);
      }
      this.set('subscriber', data);
    },
    updateCompanySubscriber: function (company) {
      var data = [];
      var id = company.get('id');
      if (id) {
        data.push('RC: ' + id);
      }
      var taxNumber = company.get('taxNumber');
      if (taxNumber) {
        data.push('MF: ' + taxNumber);
      }
      var companyName = company.get('companyName');
      var structureType = company.get('structureType');
      if (companyName && structureType) {
        data.push(companyName + ' (' + structureType + ')');
      }
      this.set('subscriber', data);
    }
  });
  mod.Vehicles = Backbone.Collection.extend({
    model: app.auto.Vehicle
  });
  mod.VehicleDialog = Backbone.Model.extend({});
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        steps: new app.common.Steps(),
        quote: new app.auto.Quote(),
        vehicles: new mod.Vehicles(),
        vehicle: new app.auto.Vehicle(),
        insured: new app.auto.Insured(),
        coverages: new app.auto.Coverages(),
        beneficiary: new app.actors.Company(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        insuredperson: new app.actors.InsuredPerson(),
        insuredcompany: new app.actors.InsuredCompany(),
        summary: new mod.Summary(),
        selectedvehicle: new app.auto.Vehicle(),
        vehicleDialog: new mod.VehicleDialog()
      };
    },
    resetVehicle: function (model) {
      this.set('vehicle', model);
    },
    initEvents: function () {
      var quote = this.get('quote');
      var person = this.get('person');
      var company = this.get('company');
      var summary = this.get('summary');
      var subscriberAttrs = ['subscriber', 'subscriberName',
        'subscriberPhone', 'subscriberEmail'
      ];
      var subscriberEvents = _.map(subscriberAttrs, function (attr) {
        return 'change:' + attr;
      });
      var subscriberEventsString = subscriberEvents.join(' ');
      person.listenTo(quote, subscriberEventsString, function () {
        if (quote.isSubscriberPerson()) {
          this.setFullName(quote.get('subscriberName'));
          this.set('phone1', quote.get('subscriberPhone'));
          this.set('email1', quote.get('subscriberEmail'));
        }
      });
      company.listenTo(quote, subscriberEventsString, function () {
        if (!quote.isSubscriberPerson()) {
          this.set('companyName', quote.get('subscriberName'));
          this.set('phone', quote.get('subscriberPhone'));
          this.set('email', quote.get('subscriberEmail'));
        }
      });
      summary.listenTo(quote, 'change', function () {
        this.updateContract(quote);
        this.updatePremium(quote);
      });
      summary.listenTo(person, 'change', function () {
        this.updatePersonSubscriber(person);
      });
      summary.listenTo(company, 'change', function () {
        this.updateCompanySubscriber(company);
      });
    },
    initialize: function () {
      this.initEvents();
    },
    reset: function () {
      this.get('quote')
        .clear();
      this.get('vehicule')
        .clear();
      this.get('vehicules')
        .reset();
      this.get('insured')
        .clear();
      this.get('coverages')
        .reset();
      this.get('beneficiary')
        .clear();
      this.get('person')
        .clear();
      this.get('company')
        .clear();
      this.get('selectedvehicle')
        .clear();
      this.get('vehicleDialog')
        .clear();
      this.get('summary')
        .clear();
    }
  });
});



/*jslint browser:true */
main.module('auto.fleet', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-fleet',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content',
      summary: '.tkf-summary'
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.summary.show(new mod.SummaryFleetView({
        model: mod.controller.container.get('summary')
      }));
    },
    onStep: function (step) {
      this.content.show(new mod['Step' + step.get('rank') + 'View']({
        model: step
      }));
    },
    onError: function () {
      this.content.currentView.refreshError();
    }
  });
  mod.NavItemView = Marionette.View.extend({
    tagName: 'li',
    template: _.template('<a href="#<%= path %>"><%= label %></a>'),
    initialize: function () {
      this.listenTo(this.model, 'change:active', this.updateActive);
    },
    render: function () {
      var html = this.template(_.extend({
        path: this.model.getPath()
      }, this.model.toJSON()));
      this.$el.html(html);
      return this;
    },
    updateActive: function () {
      if (this.model.get('active')) {
        this.$el.addClass('active');
      }
      else {
        this.$el.removeClass('active');
      }
    }
  });
  mod.NavView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-pills',
    itemView: mod.NavItemView,
    initialize: function () {
      this.collection = mod.controller.container.get('steps');
    }
  });
  mod.SummaryFleetItemView = Marionette.View.extend({
    tagName: 'p',
    template: _.template(
      '<% _.each(a, function(e) { %> <%= e %></br> <% }); %>'),
    render: function () {
      var html = this.template(this.model.toJSON());
      this.$el.html(html);
      return this;
    }
  });
  mod.SummaryFleetView = Marionette.Layout.extend({
    template: '#auto-fleet-summary',
    regions: {
      contract: '.tkf-summary-contract',
      premium: '.tkf-summary-premium',
      subscriber: '.tkf-summary-subscriber'
    },
    renderItem: function (item) {
      this[item].show(new mod.SummaryFleetItemView({
        model: new Backbone.Model({
          a: this.model.get(item)
        })
      }));
    },
    renderContract: function () {
      this.renderItem('contract');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderContract();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:contract': 'renderContract',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.Step1View = app.common.StepView.extend({
    template: '#auto-fleet-step1',
    regions: {
      vehicleList: '.tkf-vehicle-list',
      fleetImport: '.tkf-fleet-import',
      newVehicle: '.tkf-new-vehicle',
      vehicleCovers: '.tkf-vehicle-covers'
    },
    onRender: function () {
      this.vehicleList.show(new mod.VehicleListTable({
        collection: mod.controller.container.get('vehicles')
      }));
      this.fleetImport.show(new mod.FleetImportView({
        model: mod.controller.container.get('quote')
      }));
      this.newVehicle.show(new mod.VehicleFleetForm({
        model: new app.auto.Vehicle()
      }));
      this.vehicleCovers.show(new app.auto.CoverageFormTable({
        collection: mod.controller.container.get('coverages')
      }));
    }
  });
  mod.VehicleFleetForm = app.common.CustForm.extend({
    template: _.template($('#auto-new-vehicle-form')
      .html()),
    schema: {
      number: {
        title: 'N°',
        type: 'CustNumber'
      },
      usage: {
        title: 'Usage',
        type: 'CustSelect',
        validators: ['required'],
        minInput: 1,
        request: 'auto:vehicle:usages'
      },
      registrationNumber: {
        title: 'Immat.',
        type: 'CustText',
        validators: ['required']
      },
      vin: {
        title: 'N° Chassis',
        type: 'CustText',
        validators: ['required']
      },
      power: {
        title: 'Puissance',
        type: 'CustNumber',
        validators: ['required']
      },
      placesNumber: {
        title: 'Nb. Places',
        type: 'CustNumber',
        validators: ['required']
      },
      issueDate: {
        title: 'Date PMC',
        type: 'CustDate',
        validators: ['required']
      },
      totalWeight: {
        title: 'PTC',
        type: 'CustNumber',
        unit: 'Tonnes (PTC)'
      },
      payload: {
        title: 'CU',
        type: 'CustNumber',
        unit: 'Tonnes (CU)'
      },
      make: {
        title: 'Marque',
        type: 'CustSelect',
        validators: ['required'],
        minInput: 1,
        request: 'auto:vehicle:makes'
      },
      model: {
        title: 'Modèle',
        type: 'CustSelect',
        validators: ['required'],
        minInput: 1,
        request: 'auto:vehicle:models',
        requestParam: 'make'
      },
      newValue: {
        title: 'Val. à neuf',
        type: 'CustNumber',
        unit: 'DT (Neuf)'
      },
      updatedValue: {
        title: 'Val. Vénale',
        type: 'CustNumber',
        unit: 'DT (Vén)',
        validators: ['required']
      },
      companyName: {
        title: 'Raison sociale',
        type: 'CustSelect',
        request: 'auto:beneficiary:get',
      },
      beneficiaryClause: {
        title: 'Clause bénéficiaire',
        type: 'CustSelect',
        data: 'actors:beneficiary:clauses'
      }
    },
    addNewVehicle: function () {
      var self = this;
      this.$('.tkf-validation-msg')
        .addClass('hidden');
      var error = this.commit();
      var coverages = mod.controller.container.get('coverages');
      var vehicles = mod.controller.container.get('vehicles');
      var quote = mod.controller.container.get('quote');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      var usage = this.$('[data-fields="usage"]')
        .text();
      usage = usage.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      this.model.set('usageDesc', usage);
      var make = this.$('[data-fields="make"]')
        .text();
      var model = this.$('[data-fields="model"]')
        .text();
      make = make.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      model = model.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      make += ' ' + model;
      this.model.set('vehicleMake', make);
      if (!error) {
        app.request('auto:fleet:add', {
            quote: quote,
            vehicles: vehicles
          })
          .done(function (data) {
            vehicles.fromRequest(data.vehicles);
            coverages.reset();
            selVehicle.clear();
            self.$('[data-actions="saveVehicle"]')
              .removeClass('disabled');
            self.$('[data-actions="addNewVehicle"]')
              .addClass('disabled');
            self.disable('usage', false);
            self.setValue('usage', null);
            self.disable('vin', false);
            self.setValue('vin', null);
            self.disable('registrationNumber', false);
            self.setValue('registrationNumber', null);
            self.disable('issueDate', false);
            self.setValue('issueDate', null);
            self.disable('power', false);
            self.setValue('power', null);
            self.disable('placesNumber', false);
            self.setValue('placesNumber', null);
            self.disable('totalWeight', false);
            self.setValue('totalWeight', null);
            self.disable('payload', false);
            self.setValue('payload', null);
            self.disable('newValue', false);
            self.setValue('newValue', null);
            self.disable('updatedValue', false);
            self.setValue('updatedValue', null);
            self.disable('make', false);
            self.setValue('make', null);
            self.disable('model', false);
            self.setValue('model', null);
            self.disable('companyName', false);
            self.setValue('companyName', null);
            self.disable('beneficiaryClause', false);
            self.setValue('beneficiaryClause', null);
            self.setValue('number', null);
          })
          .fail(app.fail);
      }
    },
    saveVehicle: function () {
      var self = this;
      this.$('.tkf-validation-msg')
        .addClass('hidden');
      var error = this.commit();
      var quote = mod.controller.container.get('quote');
      var coverages = mod.controller.container.get('coverages');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      if (!error) {
        app.request('auto:fleet:save', {
            vehicle: this.model,
            quote: quote
          })
          .done(function (data) {
            selVehicle.clear();
            quote.fromRequest(data.quote);
            coverages.fromRequest(data.coverages);
            self.$('[data-actions="saveVehicle"]')
              .addClass('disabled');
            self.$('[data-actions="addNewVehicle"]')
              .removeClass('disabled');
            self.disable('usage', true);
            self.disable('vin', true);
            self.disable('registrationNumber', true);
            self.disable('issueDate', true);
            self.disable('power', true);
            self.disable('placesNumber', true);
            self.disable('totalWeight', true);
            self.disable('payload', true);
            self.disable('newValue', true);
            self.disable('updatedValue', true);
            self.disable('make', true);
            self.disable('model', true);
            self.disable('companyName', true);
            self.disable('beneficiaryClause', true);
          })
          .fail(function (data) {
            self.$('.tkf-validation-msg')
              .text(data.responseText);
            self.$('.tkf-validation-msg')
              .removeClass('hidden');
          });
      }
    },
    initEvents: function () {
      var self = this;
      var quote = mod.controller.container.get('quote');
      var coverages = mod.controller.container.get('coverages');
      this.on('make:change', function () {
        this.setValue('model', null);
      });
      this.$('[data-actions="addNewVehicle"]')
        .addClass('disabled');
      this.$('.tkf-validation-msg')
        .addClass('hidden');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      this.listenTo(selVehicle, 'change', function () {
        this.setValue(selVehicle.attributes);
        this.$('[data-actions="saveVehicle"]')
          .addClass('disabled');
        this.$('[data-actions="addNewVehicle"]')
          .removeClass('disabled');
        selVehicle.clear();
      });
      this.on('usage:change', function () {
        if (this.getValue('number')) {
          var vehicleDialog = mod.controller.container.get(
            'vehicleDialog');
          var diagText = 'Toutes les garanties seront';
          diagText += ' réinitialisées !';
          vehicleDialog.set('dialogText', diagText);
          var dialog = new app.common.DiagView({
            el: '#modal'
          });
          dialog.setTitle('Modifier l\'usage de ce véhicule?');
          var selVeh = new mod.VehicleDialogView({
            model: vehicleDialog
          });
          var diagbut = {};
          diagbut = {};
          diagbut.yes = {};
          diagbut.yes.label = 'Oui';
          diagbut.yes.className = 'col-sm-3 btn-success';
          diagbut.yes.className += ' pull-left';
          diagbut.yes.callback = function () {
            quote.set('resetCovers', true);
            self.commit();
            app.request('auto:fleet:save', {
                vehicle: self.model,
                quote: quote
              })
              .done(function (data) {
                quote.fromRequest(data.quote);
                coverages.fromRequest(data.coverages);
              })
              .fail(app.fail);
          };
          diagbut.no = {};
          diagbut.no.label = 'Non';
          diagbut.no.className = 'col-sm-3 btn-warning';
          diagbut.no.className += ' pull-right';
          diagbut.no.callback = function () {
            self.setValue('usage', self.model.get('usage'));
          };
          selVeh.closeButton = false;
          selVeh.buttons = diagbut;
          dialog.show(selVeh);
        }
      });
      var cSchema = 'registrationNumber:set vin:set issueDate:set';
      cSchema += ' power:set placesNumber:set totalWeight:set';
      cSchema += ' payload:set newValue:set updatedValue:set';
      cSchema += ' make:set model:set companyName:set';
      cSchema += ' beneficiaryClause:set';
      this.on(cSchema, function () {
        if (this.getValue('number')) {
          var inEditMode = quote.get('inEditMode');
          if (_.isUndefined(inEditMode)) {
            inEditMode = 0;
          }
          if (inEditMode === 0) {
            this.commit();
            var coverages = mod.controller.container.get(
              'coverages');
            app.request('auto:fleet:save', {
                vehicle: self.model,
                quote: quote
              })
              .done(function (data) {
                quote.fromRequest(data.quote);
                coverages.fromRequest(data.coverages);
              })
              .fail(app.fail);
          }
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.initEvents();
    },
    events: {
      'click a[data-actions="addNewVehicle"]': 'addNewVehicle',
      'click a[data-actions="saveVehicle"]': 'saveVehicle'
    }
  });
  mod.VehicleListRow = Marionette.ItemView.extend({
    template: '#auto-fleet-vehicle-row',
    tagName: 'tr',
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    editVehicle: function () {
      var quote = mod.controller.container.get('quote');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      quote.set('inEditMode', 1);
      selVehicle.set(this.model.attributes);
      var coverages = mod.controller.container.get('coverages');
      coverages.reset();
      var veh = this.model;
      app.request('auto:fleet:getVehicle', {
          quote: quote,
          vehicle: veh,
          forEdit: true
        })
        .done(function (data) {
          coverages.fromRequest(data.coverages);
          quote.set('inEditMode', 0);
        })
        .fail(app.fail);
    },
    removeVehicle: function () {
      var self = this;
      var coverages = mod.controller.container.get('coverages');
      if (coverages.length !== 0) {
        return false;
      }
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Voulez vous vraiment supprimer ce véhicule?');
      var selVeh = new app.auto.QuoteConsultVehicle({
        model: this.model
      });
      var diagbut = {};
      diagbut = {};
      diagbut.yes = {};
      diagbut.yes.label = 'Oui';
      diagbut.yes.className = 'col-sm-3 btn-success pull-left';
      diagbut.yes.callback = function () {
        var quote = mod.controller.container.get('quote');
        var vehicles = mod.controller.container.get('vehicles');
        app.request('auto:fleet:remove', {
            vehicle: self.model,
            vehicles: vehicles,
            quote: quote
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            vehicles.fromRequest(data.vehicles);
          })
          .fail(app.fail);
      };
      diagbut.no = {};
      diagbut.no.label = 'Non';
      diagbut.no.className = 'col-sm-3 btn-warning pull-right';
      diagbut.no.callback = function () {};
      selVeh.buttons = diagbut;
      selVeh.closeButton = false;
      dialog.show(selVeh);
    },
    coverVehicle: function () {
      var currentRow = this.$el.closest('tr');
      if ($('.tkf-selected-covers')
        .length === 1) {
        $('.tkf-selected-covers')
          .slideUp(function () {
            $('.tkf-selected-covers')
              .parent()
              .remove();
            return false;
          });
      }
      else {
        var newRow = '<tr><td colspan="8" ';
        newRow += 'class="tkf-selected-covers">';
        newRow += '</td></tr>';
        $(newRow)
          .insertAfter(currentRow);
        var quote = mod.controller.container.get('quote');
        var veh = this.model;
        var self = this;
        var mgr = new app.common.TransitionView({
          el: $('.tkf-selected-covers')
        });
        app.request('auto:fleet:getVehicle', {
            quote: quote,
            vehicle: veh,
            forEdit: false
          })
          .done(function (data) {
            veh.get('coverages')
              .fromRequest(data.coverages);
            mgr.show(new app.auto.CoverageConsultTable({
              collection: self.model.get('coverages')
            }));
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="editVehicle"]': 'editVehicle',
      'click a[data-actions="removeVehicle"]': 'removeVehicle',
      'click a[data-actions="coverVehicle"]': 'coverVehicle'
    }
  });
  mod.VehicleListTable = Marionette.CompositeView.extend({
    template: '#auto-fleet-vehicle-table',
    itemView: mod.VehicleListRow,
    itemViewContainer: 'tbody'
  });
  mod.VehicleDialogView = Marionette.ItemView.extend({
    template: '#auto-fleet-vehicle-dialog'
  });
  mod.FleetImportView = Marionette.ItemView.extend({
    template: '#auto-fleet-import',
    importFleet: function () {},
    dowloadModel: function () {
      var link = document.createElement('a');
      link.download = 'modele.csv';
      link.href = 'fleet?doc=modele';
      link.click();
    },
    dowloadExp: function () {
      var link = document.createElement('a');
      link.download = 'flotte-doc.pdf';
      link.href = 'fleet?doc=explain';
      link.click();
    },
    events: {
      'click a[data-actions="importFleet"]': 'importFleet',
      'click a[data-actions="dowloadModel"]': 'dowloadModel',
      'click a[data-actions="dowloadExp"]': 'dowloadExp'
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#auto-fleet-step2',
    regions: {
      quote: '.tkf-quote-form',
      vehicles: '.tkf-vehicles'
    },
    onRender: function () {
      this.quote.show(new mod.FleetQuoteForm({
        model: mod.controller.container.get('quote')
      }));
      this.vehicles.show(new mod.FleetVehicleView({
        collection: mod.controller.container.get('vehicles')
      }));
    }
  });
  mod.FleetQuoteForm = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-quote-form')
      .html()),
    schema: {
      effectiveDate: {
        title: 'Date d\'effet',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          value: moment()
            .startOf('day')
            .toDate()
        }]
      },
      fleetTermDate: {
        title: 'Date d\'échéance',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          field: 'effectiveDate'
        }]
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
    },
    recalculate: function () {
      var oldEffDate = this.model.get('effectiveDate');
      var oldTerDate = this.model.get('fleetTermDate');
      var error = this.commit();
      var quote = mod.controller.container.get('quote');
      var vehicles = mod.controller.container.get('vehicles');
      var self = this;
      if (!error) {
        app.request('auto:fleet:recalculate', {
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
          })
          .fail(function (data) {
            self.setValue('effectiveDate', oldEffDate);
            self.setValue('fleetTermDate', oldTerDate);
            app.fail(data);
          });
      }
    },
    exportFleet: function () {
      var error = this.commit();
      var oldEffDate = this.model.get('effectiveDate');
      var oldTerDate = this.model.get('fleetTermDate');
      var quote = mod.controller.container.get('quote');
      var vehicles = mod.controller.container.get('vehicles');
      var self = this;
      if (!error) {
        app.request('auto:fleet:exportFleet', {
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
            var pdfname = quote.get('reference');
            var link = document.createElement('a');
            link.download = pdfname;
            link.href = 'fleet?doc=' + pdfname;
            link.click();
          })
          .fail(function (data) {
            self.setValue('effectiveDate', oldEffDate);
            self.setValue('fleetTermDate', oldTerDate);
            app.fail(data);
          });
      }
    },
    events: {
      'click a[data-actions="recalculate"]': 'recalculate',
      'click a[data-actions="exportFleet"]': 'exportFleet'
    }
  });
  mod.FleetVehicleRow = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-view-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
    },
    showCovers: function () {
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Liste des garanties');
      var vehCoverages = new app.auto.CoverageConsultTable({
        collection: this.model.get('coverages')
      });
      dialog.show(vehCoverages);
    },
    events: {
      'click a[data-actions="covers"]': 'showCovers'
    }
  });
  mod.FleetVehicleView = Marionette.CompositeView.extend({
    template: '#auto-fleet-view-table',
    itemView: mod.FleetVehicleRow,
    itemViewContainer: 'tbody'
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#auto-fleet-step3',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      subscriber: '.tkf-subscriber'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.auto.QuoteFormSubscriber({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonForm({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyForm({
          model: mod.controller.container.get('company')
        }));
      }
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
    },
    initialize: function () {
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:subscriber', function () {
        if (quote.wasSubscriberPerson()) {
          mod.controller.container.get('person')
            .trigger('flush');
        }
        else {
          mod.controller.container.get('company')
            .trigger('flush');
        }
        this.renderSubscriber();
      });
    }
  });
  mod.FleetSave = Marionette.Layout.extend({
    template: '#auto-contract-save',
    onRender: function () {
      if (this.model.get('contractref')) {
        this.$('[data-actions="save"]')
          .addClass('disabled');
      }
      this.$('[data-actions="validate"]')
        .append(this.validateLink.render()
          .el);
    },
    initialize: function () {
      Marionette.Layout.prototype.initialize.apply(this, arguments);
      this.validateLink = new app.common.LinkView({
        model: this.model.get('validateLink')
      });
    },
    save: function () {
      var self = this;
      var quote = this.model;
      app.request('auto:fleet:create', {
          quote: this.model
        })
        .done(function (data) {
          var validateLink = self.model.get('validateLink');
          quote.fromRequest(data.quote);
          validateLink.fromRequest(data.quote.validateLink);
          self.$('[data-actions="save"]')
            .addClass('disabled');
          self.$('[data-actions="validate"]')
            .removeClass('disabled');
          self.validateLink.renderTitle();
        })
        .fail(app.fail);
    },
    events: {
      'click p[data-actions="save"]': 'save'
    }
  });
  mod.Step4View = app.common.StepView.extend({
    template: '#auto-subscribe-step5',
    regions: {
      subscriber: '.tkf-step5-subscriber',
      premium: '.tkf-step5-premium',
      message: '.tkf-step5-message',
      save: '.tkf-step5-save'
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderPremium: function ()  {
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new mod.FleetSave({
        model: mod.controller.container.get('quote')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderSave();
    }
  });
});

main.module('auto.frontierInsurance', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'frontierInsurance': function () {
          app.execute('auto:frontierInsurance');
        }
      }
    });
  });
});

main.module('auto.frontierInsurance', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:frontierInsurance', function () {
      app.auto.current = 'frontierInsurance';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
    });
  });
});

main.module('auto.frontierInsurance', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.layout = new mod.Layout();
      this.container = new mod.Container();
    }
  });
});





main.module('auto.frontierInsurance', function (mod, app, Backbone, Marionette,
  $, _) {
  mod.Quote = Backbone.Model.extend({
    dateAttributes: ['beginDate', 'endDate'],
    isRenewable: function () {
      return false;
    },
    defaults: function () {
      return {
        kind: 'Ferme',
        isValid: false,
        reference: null,
        receiptRef: null,
        type: null,
        duration: '',
        beginDate: moment()
          .toDate(),
        endDate: moment()
          .toDate(),
        premium: null,
        fees: null,
        taxes: null,
        stampFGA: null,
        stampFSSR: null,
        stampFPAC: null,
        receiptDoc: new app.common.Doc({
          title: 'Quittance'
        }),
        attestationDoc: new app.common.Doc({
          title: 'Attestation'
        }),
      };
    }
  });
  mod.Vehicle = Backbone.Model.extend({
    defaults: function () {
      return {
        vin: null,
        make: null,
        registrationNumber: null,
        motorNumber: null,
        internationalCode: null,
        trailerMake: null,
        trailerRegistrationNumber: null
      };
    }
  });
  mod.Person = Backbone.Model.extend({
    defaults: {
      typePI: null,
      numPI: null,
      countryOfOrigin: '',
      addressOfCountryOfOrigin: '',
      firstName: '',
      lastName: ''
    },
    getFullName: function () {
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      if (firstName && lastName) {
        return firstName + ' ' + lastName;
      }
    },
    getAddress: function () {
      var countryOfOrigin = this.get('countryOfOrigin');
      var addressOfCountryOfOrigin = this.get(
        'addressOfCountryOfOrigin');
      if (countryOfOrigin) {
        return countryOfOrigin + ' ' + addressOfCountryOfOrigin;
      }
    },
    updateIdType: function () {
      var typePI = this.get('typePI');
      return _.updateIdType(typePI);
    },
  });
  mod.Summary = Backbone.Model.extend({
    defaults: function () {
      return {
        contract: [],
        vehicle: [],
        premium: [],
        subscriber: []
      };
    },
    updateContract: function (quote) {
      var data = [];
      var kind = quote.get('kind');
      if (kind) {
        data.push(kind);
      }
      if (!quote.isRenewable()) {
        var beginDate = quote.get('beginDate');
        if (beginDate) {
          data.push('D. d\'effet: ' + _.beautifyDate(beginDate));
        }
      }
      this.set('contract', data);
    },
    updateVehicle: function (vehicle) {
      var data = [];
      var make = vehicle.get('make');
      var registrationNumber = vehicle.get('registrationNumber');
      var vin = vehicle.get('vin');
      var motorNumber = vehicle.get('motorNumber');
      var trailerMake = vehicle.get('trailerMake');
      var trailerRegistrationNumber = vehicle.get(
        'trailerRegistrationNumber');
      if (registrationNumber) {
        data.push('Immat: ' + registrationNumber);
      }
      if (vin) {
        data.push('Num de chassis: ' + vin);
      }
      if (make) {
        data.push('Marque: ' + make);
      }
      if (motorNumber) {
        data.push('N° Moteur: ' + motorNumber);
      }
      if (trailerMake || trailerRegistrationNumber) {
        data.push('Remorque: ' + trailerMake + ' ' +
          trailerRegistrationNumber);
      }
      this.set('vehicle', data);
    },
    updatePremium: function (quote) {
      var data = [];
      var total = 0;
      var premium = quote.get('premium');
      if (premium) {
        data.push('Assurance: ' + _.beautifyAmount(premium));
        total += premium;
      }
      var fees = quote.get('fees');
      if (fees) {
        data.push('Frais: ' + _.beautifyAmount(fees));
        total += fees;
      }
      var taxes = quote.get('taxes');
      if (taxes) {
        data.push('Taxes: ' + _.beautifyAmount(taxes));
        total += taxes;
      }
      var stamps = 0;
      var stampFGA = quote.get('stampFGA');
      if (stampFGA) {
        stamps += stampFGA;
      }
      var stampFSSR = quote.get('stampFSSR');
      if (stampFSSR) {
        stamps += stampFSSR;
      }
      var stampFPAC = quote.get('stampFPAC');
      if (stampFPAC) {
        stamps += stampFPAC;
      }
      if (stamps) {
        data.push('Timbres: ' + _.beautifyAmount(stamps));
        total += stamps;
      }
      if (total) {
        data.push('Total: ' + _.beautifyAmount(total) + ' TTC');
      }
      this.set('premium', data);
    },
    updatePersonSubscriber: function (person) {
      var data = [];
      var typePI = person.updateIdType();
      var numPI = person.get('numPI');
      var countryOfOrigin = person.get('countryOfOrigin');
      var fullName = person.getFullName();
      var address = person.getAddress();
      if (fullName) {
        data.push(fullName);
      }
      if (typePI) {
        data.push('Type de P.I: ' + typePI);
      }
      if (numPI) {
        data.push('Num de P.I: ' + numPI);
      }
      if (countryOfOrigin) {
        data.push('Pays : ' + address);
      }
      this.set('subscriber', data);
    }
  });
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        quote: new mod.Quote(),
        vehicle: new mod.Vehicle(),
        person: new mod.Person(),
        summary: new mod.Summary()
      };
    },
    initEvents: function () {
      var quote = this.get('quote');
      var vehicle = this.get('vehicle');
      var person = this.get('person');
      var summary = this.get('summary');
      summary.listenTo(quote, 'change', function () {
        this.updateContract(quote);
        this.updatePremium(quote);
      });
      summary.listenTo(vehicle, 'change', function () {
        this.updateVehicle(vehicle);
      });
      summary.listenTo(person, 'change', function () {
        this.updatePersonSubscriber(person);
      });
    },
    initialize: function () {
      this.initEvents();
    },
    reset: function () {
      this.get('quote')
        .clear();
      this.get('vehicle')
        .clear();
      this.get('person')
        .clear();
    }
  });
});



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

main.module('auto.search', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  mod.addInitializer(function () {
    var routes = {};
    routes.search = function () {
      app.execute('auto:search');
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('auto.search', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:search', function () {
      app.auto.current = 'search';
      mod.controller = new mod.Controller();
      app.request('auto:search:init')
        .done(function (data) {
          mod.controller.criteria.set('admin', data.admin);
          mod.controller.criteria.set('pos', parseInt(data.pos));
          app.mainRegion.show(mod.controller.layout);
        })
        .fail(app.fail);
    });
  });
});

main.module('auto.search', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.policies = new mod.Policies();
      this.layout = new mod.Layout();
    }
  });
});





main.module('auto.search', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['effcDateFrom', 'effcDateTo'],
    defaults: {
      reference: null,
      clientname: null,
      clientid: null,
      vehicle: null,
      status: null,
      type: null,
      nature: null
    }
  });
  mod.PolicySummary = Backbone.Model.extend({
    /*
    numero: Contract or Quote Reference
    effectiveDate: Contract or Quote effective date
    vehicle: Vehicle Registration Number
    cliName: Client Name
    premium: Premium Raised Equal to 0 for Quote
    details: Link to Consultation Process page
    */
    dateAttributes: ['effectiveDate', 'subscribeDate', 'endDate'],
    defaults: function () {
      return {
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    }
  });
  mod.Policies = Backbone.Collection.extend({
    model: mod.PolicySummary
  });
});

main.module('auto.search', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('auto:search:getData', function (data) {
      return app.common.post('/svc/auto/search/getData', {
        searchcriteria: data.searchcriteria.toRequest()
      });
    });
    app.reqres.setHandler('auto:contract:natures', function () {
      return app.common.post('/svc/auto/contract/natures');
    });
    app.reqres.setHandler('auto:contract:types', function () {
      return app.common.post('/svc/auto/contract/types');
    });
    app.reqres.setHandler('auto:contract:statuses', function () {
      return app.common.post('/svc/auto/contract/statuses');
    });
    app.reqres.setHandler('auto:search:init', function () {
      return app.common.post('/svc/auto/search/init');
    });
  });
});

main.module('auto.search', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-search',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.SearchView());
    }
  });
  mod.SearchView = Marionette.Layout.extend({
    template: '#auto-search-view',
    regions: {
      error: '.tkf-error',
      criteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.criteria
      }));
      if (mod.controller.criteria.get('admin')) {
        this.results.show(new mod.AdminSearchResults({
          collection: mod.controller.policies
        }));
      }
      else {
        this.results.show(new mod.SearchResults({
          collection: mod.controller.policies
        }));
      }
    }
  });
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      vehicle: {
        title: 'Véhicule',
        type: 'CustText'
      },
      clientid: {
        title: 'CIN / RC',
        type: 'CustText'
      },
      clientname: {
        title: 'Nom',
        type: 'CustText'
      },
      effcDateFrom: {
        title: 'De',
        type: 'CustDate'
      },
      effcDateTo: {
        title: 'A',
        type: 'CustDate'
      },
      nature: {
        title: 'Nature',
        type: 'CustSelect',
        request: 'auto:contract:natures'
      },
      status: {
        title: 'Etat',
        type: 'CustSelect',
        request: 'auto:contract:statuses'
      }
    },
    search: function () {
      this.commit();
      app.request('auto:search:getData', {
          searchcriteria: this.model
        })
        .done(function (data) {
          mod.controller.policies.reset();
          _.each(data, function (item) {
            var policy = new mod.PolicySummary();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.policies.add(policy);
          });
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#auto-search-result-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.consultLink = new app.common.LinkView({
        model: this.model.get('consultlink')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="consult"]')
        .append(this.consultLink.render()
          .el);
    }
  });
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#auto-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.AdminResultFormRow = app.common.CustForm.extend({
    template: _.template($('#auto-admin-search-result-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.consultLink = new app.common.LinkView({
        model: this.model.get('consultlink')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="consult"]')
        .append(this.consultLink.render()
          .el);
    }
  });
  mod.AdminSearchResults = Marionette.CompositeView.extend({
    template: '#auto-admin-search-result-table',
    itemView: mod.AdminResultFormRow,
    itemViewContainer: 'tbody'
  });
});

main.module('auto.subscribe', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        subscribe: function () {
          app.execute('auto:subscribe:new');
        },
        'subscribe/id/:id': function (id) {
          app.execute('auto:subscribe:existing', id);
        },
        'subscribe/step/:step': function (step) {
          app.execute('auto:subscribe:step', parseInt(step));
        }
      }
    });
  });
});

/*jslint browser: true */
main.module('auto.subscribe', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:subscribe:new', function () {
      app.request('auto:subscribe:checkLockSubscription')
        .done(function () {
          app.auto.current = 'subscribe';
          mod.controller = new mod.Controller();
          app.mainRegion.show(mod.controller.layout);
          mod.router.navigate('subscribe/step/1', {
            trigger: true,
            replace: false
          });
        })
        .fail(function () {
          window.location.href = '/#locked';
        });
    });
    app.commands.setHandler('auto:subscribe:existing', function (id) {
      app.auto.current = 'subscribe';
      mod.controller = new mod.Controller();
      mod.controller.container.reset();
      mod.controller.launch(id);
    });
    app.commands.setHandler('auto:subscribe:step', function (rank) {
      if (app.auto.current === 'subscribe') {
        var current = mod.controller.getActiveStep();
        if (!current) {
          rank = 1;
          mod.controller.activateStep(mod.controller.getStep(rank),
            true);
        }
        else if (rank) {
          delete current.validationError;
          var step = mod.controller.getStep(rank);
          var curRank = current.get('rank');
          if (rank <= curRank) {
            mod.controller.activateStep(step);
          }
          else if (rank > curRank + 1) {
            current.validationError =
              'Vous ne pouvez pas sauter les étapes';
            mod.controller.freezeStep();
          }
          else {
            current.executeCheck(function () {
              if (current.validationError) {
                mod.controller.freezeStep();
              }
              else {
                current.executeAfter(function () {
                  if (current.validationError) {
                    mod.controller.freezeStep();
                  }
                  else {
                    mod.controller.activateStep(step);
                  }
                });
              }
            });
          }
        }
      }
      else {
        mod.router.navigate('error', {
          trigger: true,
          replace: false
        });
      }
    });
  });
});

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





main.module('auto.subscribe', function (mod, app, Backbone, Marionette, $, _) {
  mod.Step = app.common.Step.extend({
    getPath: function () {
      return 'subscribe/step/' + this.get('rank');
    }
  });
  mod.Summary = Backbone.Model.extend({
    defaults: function () {
      return {
        contract: [],
        vehicle: [],
        premium: [],
        subscriber: []
      };
    },
    updateContract: function (quote) {
      var data = [];
      var kind = quote.get('kind');
      if (kind) {
        data.push(kind);
      }
      if (quote.isRenewable()) {
        var effectiveDate = quote.get('effectiveDate');
        if (effectiveDate) {
          data.push('D. d\'effet: ' + _.beautifyDate(effectiveDate));
        }
        var billingFrequency = quote.get('billingFrequency');
        if (billingFrequency) {
          data.push('Quittancement: ' + billingFrequency);
        }
      }
      else {
        var beginDate = quote.get('beginDate');
        if (beginDate) {
          data.push('D. d\'effet: ' + _.beautifyDate(beginDate));
        }
      }
      this.set('contract', data);
    },
    updateVehicle: function (insured, vehicle) {
      var data = [];
      var usage = insured.get('usage');
      if (usage) {
        data.push(usage);
      }
      var make = vehicle.get('make');
      var model = vehicle.get('model');
      if (make && model) {
        data.push(make + ' ' + model);
      }
      var registrationNumber = vehicle.get('registrationNumber');
      if (registrationNumber) {
        data.push('Immat: ' + registrationNumber);
      }
      var newValue = vehicle.get('newValue');
      if (newValue) {
        data.push('V. Neuve: ' + _.beautifyAmount(newValue));
      }
      var updatedValue = vehicle.get('updatedValue');
      if (updatedValue) {
        data.push('V. Vénale: ' + _.beautifyAmount(updatedValue));
      }
      this.set('vehicle', data);
    },
    updatePremium: function (quote) {
      var data = [];
      var total = 0;
      var premium = quote.get('premium');
      if (premium) {
        data.push('Assurance: ' + _.beautifyAmount(premium));
        total += premium;
      }
      var fees = quote.get('fees');
      if (fees) {
        data.push('Frais: ' + _.beautifyAmount(fees));
        total += fees;
      }
      var taxes = quote.get('taxes');
      if (taxes) {
        data.push('Taxes: ' + _.beautifyAmount(taxes));
        total += taxes;
      }
      var stamps = 0;
      var stampFGA = quote.get('stampFGA');
      if (stampFGA) {
        stamps += stampFGA;
      }
      var stampFSSR = quote.get('stampFSSR');
      if (stampFSSR) {
        stamps += stampFSSR;
      }
      var stampFPAC = quote.get('stampFPAC');
      if (stampFPAC) {
        stamps += stampFPAC;
      }
      if (stamps) {
        data.push('Timbres: ' + _.beautifyAmount(stamps));
        total += stamps;
      }
      if (total) {
        data.push('Total: ' + _.beautifyAmount(total) + ' TTC');
      }
      this.set('premium', data);
    },
    updatePersonSubscriber: function (person) {
      var data = [];
      var id = person.get('id');
      if (id) {
        data.push('CIN: ' + id);
      }
      var fullName = person.getFullName();
      if (fullName) {
        data.push(fullName);
      }
      this.set('subscriber', data);
    },
    updateCompanySubscriber: function (company) {
      var data = [];
      var id = company.get('id');
      if (id) {
        data.push('RC: ' + id);
      }
      var taxNumber = company.get('taxNumber');
      if (taxNumber) {
        data.push('MF: ' + taxNumber);
      }
      var companyName = company.get('companyName');
      var structureType = company.get('structureType');
      if (companyName && structureType) {
        data.push(companyName + ' (' + structureType + ')');
      }
      this.set('subscriber', data);
    }
  });
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        steps: new app.common.Steps(),
        quote: new app.auto.Quote(),
        vehicle: new app.auto.Vehicle(),
        insured: new app.auto.Insured(),
        coverages: new app.auto.Coverages(),
        beneficiary: new app.actors.Company(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        insuredperson: new app.actors.InsuredPerson(),
        insuredcompany: new app.actors.InsuredCompany(),
        summary: new mod.Summary()
      };
    },
    initEvents: function () {
      var quote = this.get('quote');
      var insured = this.get('insured');
      var vehicle = this.get('vehicle');
      var person = this.get('person');
      var company = this.get('company');
      var summary = this.get('summary');
      var subscriberAttrs = ['subscriber', 'subscriberName',
        'subscriberPhone', 'subscriberEmail'
      ];
      var subscriberEvents = _.map(subscriberAttrs, function (attr) {
        return 'change:' + attr;
      });
      var subscriberEventsString = subscriberEvents.join(' ');
      person.listenTo(quote, subscriberEventsString, function () {
        if (quote.isSubscriberPerson()) {
          this.setFullName(quote.get('subscriberName'));
          this.set('phone1', quote.get('subscriberPhone'));
          this.set('email1', quote.get('subscriberEmail'));
        }
      });
      company.listenTo(quote, subscriberEventsString, function () {
        if (!quote.isSubscriberPerson()) {
          this.set('companyName', quote.get('subscriberName'));
          this.set('phone', quote.get('subscriberPhone'));
          this.set('email', quote.get('subscriberEmail'));
        }
      });
      summary.listenTo(quote, 'change', function () {
        this.updateContract(quote);
        this.updatePremium(quote);
      });
      summary.listenTo(insured, 'change', function () {
        this.updateVehicle(insured, vehicle);
      });
      summary.listenTo(vehicle, 'change', function () {
        this.updateVehicle(insured, vehicle);
      });
      summary.listenTo(person, 'change', function () {
        this.updatePersonSubscriber(person);
      });
      summary.listenTo(company, 'change', function () {
        this.updateCompanySubscriber(company);
      });
    },
    initialize: function () {
      this.initEvents();
    },
    reset: function () {
      this.get('quote')
        .clear();
      this.get('vehicle')
        .clear();
      this.get('insured')
        .clear();
      this.get('coverages')
        .reset();
      this.get('beneficiary')
        .clear();
      this.get('person')
        .clear();
      this.get('company')
        .clear();
    }
  });
});



main.module('auto.subscribe', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-subscribe',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content',
      summary: '.tkf-summary'
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.summary.show(new mod.SummaryView({
        model: mod.controller.container.get('summary')
      }));
    },
    onStep: function (step) {
      this.content.show(new mod['Step' + step.get('rank') + 'View']({
        model: step
      }));
    },
    onError: function () {
      this.content.currentView.refreshError();
    }
  });
  mod.NavItemView = Marionette.View.extend({
    tagName: 'li',
    template: _.template('<a href="#<%= path %>"><%= label %></a>'),
    initialize: function () {
      this.listenTo(this.model, 'change:active', this.updateActive);
    },
    render: function () {
      var html = this.template(_.extend({
        path: this.model.getPath()
      }, this.model.toJSON()));
      this.$el.html(html);
      return this;
    },
    updateActive: function () {
      if (this.model.get('active')) {
        this.$el.addClass('active');
      }
      else {
        this.$el.removeClass('active');
      }
    }
  });
  mod.NavView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-pills',
    itemView: mod.NavItemView,
    initialize: function () {
      this.collection = mod.controller.container.get('steps');
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
    template: '#auto-subscribe-summary',
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
  mod.Step1View = app.common.StepView.extend({
    template: '#auto-subscribe-step1',
    regions: {
      insured: '.tkf-insured',
      vehicle: '.tkf-vehicle'
    },
    onRender: function () {
      this.insured.show(new app.auto.InsuredForm({
        model: mod.controller.container.get('insured')
      }));
      this.vehicle.show(new app.auto.VehicleForm({
        model: mod.controller.container.get('vehicle')
      }));
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#auto-subscribe-step2',
    regions: {
      quote: '.tkf-quote-form',
      coverages: '.tkf-coverages'
    },
    onRender: function () {
      this.quote.show(new app.auto.QuoteForm({
        model: mod.controller.container.get('quote')
      }));
      this.coverages.show(new app.auto.CoverageFormTable({
        collection: mod.controller.container.get('coverages')
      }));
    }
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#auto-subscribe-step3',
    regions: {
      header: '.tkf-quote-header',
      vehicle: '.tkf-quote-vehicle',
      coverages: '.tkf-quote-coverages',
      premium: '.tkf-quote-premium',
      message: '.tkf-quote-message',
      save: '.tkf-quote-save'
    },
    onRender: function () {
      this.header.show(new app.auto.QuoteConsultHeader({
        model: mod.controller.container.get('quote')
      }));
      this.vehicle.show(new app.auto.QuoteConsultVehicle({
        model: mod.controller.container.get('vehicle')
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: new app.auto.Coverages(mod.controller.container
          .get('coverages')
          .filter(function (c) {
            return c.get('subscribed');
          }))
      }));
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
      this.message.show(new app.auto.QuoteConsultMessage({
        model: mod.controller.container.get('quote')
      }));
      this.save.show(new app.auto.QuoteSave({
        model: mod.controller.container.get('quote')
      }));
    }
  });
  mod.Step4View = app.common.StepView.extend({
    template: '#auto-subscribe-step4',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      subscriber: '.tkf-subscriber',
      insuredType: '.tkf-insured-type',
      insuredStructure: '.tkf-insured-structure',
      beneficiary: '.tkf-beneficiary'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.auto.QuoteFormSubscriber({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonFormAndMap({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyFormAndMap({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderInsuredType: function () {
      var self = this;
      this.insuredType.show(new app.auto.QuoteFormInsured({
        model: mod.controller.container.get('quote')
      }));
      this.insuredType.currentView.on('insuredType:set', function () {
        var currentSubscriberType = self.subscriberType.currentView;
        var currentInsuredType = self.insuredType.currentView;
        var currentSubscriber = self.subscriber.currentView;
        var currentInsured;
        if (currentInsuredType.getValue('insuredType') ===
          'Souscripteur') {
          var subs = currentSubscriberType.getValue('subscriber');
          currentInsuredType.setValue('insured', subs);
          this.commit();
          currentInsured = self.insuredStructure.currentView;
          currentInsured.setValue(currentSubscriber.model.attributes);
          this.disable('insured', true);
        }
        else {
          self.renderInsuredStructure();
          this.disable('insured', false);
        }
      });
    },
    renderInsuredStructure: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isInsuredPerson()) {
        this.insuredStructure.show(new app.actors.PersonInsuredForm({
          model: mod.controller.container.get('insuredperson')
        }));
      }
      else {
        this.insuredStructure.show(new app.actors.CompanyInsuredForm({
          model: mod.controller.container.get('insuredcompany')
        }));
      }
    },
    renderBeneficiary: function () {
      this.beneficiary.show(new app.auto.QuoteFormBeneficiary({
        model: mod.controller.container.get('beneficiary')
      }));
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
      this.renderBeneficiary();
      this.renderInsuredType();
      this.renderInsuredStructure();
    },
    initialize: function () {
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:subscriber', function () {
        if (quote.wasSubscriberPerson()) {
          mod.controller.container.get('person')
            .trigger('flush');
        }
        else {
          mod.controller.container.get('company')
            .trigger('flush');
        }
        this.renderSubscriber();
      });
      this.listenTo(quote, 'change:insured', function () {
        if (quote.wasInsuredPerson()) {
          mod.controller.container.get('insuredperson')
            .trigger('flush');
        }
        else {
          mod.controller.container.get('insuredcompany')
            .trigger('flush');
        }
        this.renderInsuredStructure();
      });
    }
  });
  mod.Step5View = app.common.StepView.extend({
    template: '#auto-subscribe-step5',
    regions: {
      subscriber: '.tkf-step5-subscriber',
      premium: '.tkf-step5-premium',
      message: '.tkf-step5-message',
      save: '.tkf-step5-save'
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderPremium: function ()  {
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new app.auto.ContractSave({
        model: mod.controller.container.get('quote')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderSave();
    }
  });
});

main.module('auto.term', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  mod.addInitializer(function () {
    var routes = {
      'term/id/:id': function (id) {
        app.execute('auto:term:consult', id);
      },
      'term': function () {
        app.execute('auto:term');
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('auto.term', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:term', function () {
      app.auto.current = 'term';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
    });
    app.commands.setHandler('auto:term:consult', function (id) {
      app.auto.current = 'term';
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});

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

main.module('auto.term', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('policy:termList', function () {
      return app.common.post('/svc/auto/policy/termList');
    });
    app.reqres.setHandler('policy:termSearch', function (criteria,
      indice) {
      return app.common.post('/svc/auto/policy/termSearch', {
        criteria: criteria,
        indice: indice
      });
    });
  });
  app.reqres.setHandler('policy:term:validate', function (data) {
    return app.common.post('/svc/auto/term/validate', {
      policy: data.policy.toRequest(),
      settlements: data.settlements.toRequest(),
      attestationNumber: data.attestationNumber
    });
  });
});

main.module('auto.term', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-term',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content'
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.listenTo(mod.controller.steps, 'step', function (step) {
        this.content.show(new mod['step' + step + 'View']());
      });
      app.request('policy:termList')
        .done(function (data) {
          var dueTerms = data.dueTermPolicies;
          var actualTerms = data.termPolicies;
          var futureTerms = data.futureTermPolicies;
          mod.controller.dueTermPolicies.reset();
          _.each(dueTerms, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.dueTermPolicies.add(policy);
          });
          mod.controller.termPolicies.reset();
          _.each(actualTerms, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.termPolicies.add(policy);
          });
          mod.controller.futureTermPolicies.reset();
          _.each(futureTerms, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.futureTermPolicies.add(policy);
          });
        })
        .fail(app.fail);
      mod.controller.steps.setActive(0);
    }
  });
  mod.NavItemView = Marionette.View.extend({
    tagName: 'li',
    template: _.template('<a href="#"><%= label %></a>'),
    initialize: function () {
      Marionette.View.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'change:active', this.updateActive);
    },
    render: function () {
      var html = this.template(this.model.toJSON());
      this.$el.html(html);
      return this;
    },
    updateActive: function () {
      if (this.model.get('active')) {
        this.$el.addClass('active');
      }
      else {
        this.$el.removeClass('active');
      }
    },
    events: {
      'click a': function (event) {
        event.preventDefault();
        mod.controller.steps.setActive(this.model);
      }
    }
  });
  mod.NavView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-tabs',
    itemView: mod.NavItemView,
    initialize: function () {
      this.collection = mod.controller.steps;
    }
  });
  mod.DueTermCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      clientName: {
        title: 'Nom',
        type: 'CustText'
      }
    },
    term: function () {
      var error = this.commit();
      if (!error) {
        app.request('policy:termSearch', this.model, 0)
          .done(function (data) {
            mod.controller.dueTermPolicies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.dueTermPolicies.add(policy);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="term"]': 'term',
    }
  });
  mod.TermCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      clientName: {
        title: 'Nom',
        type: 'CustText'
      }
    },
    term: function () {
      var error = this.commit();
      if (!error) {
        app.request('policy:termSearch', this.model, 1)
          .done(function (data) {
            mod.controller.termPolicies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.termPolicies.add(policy);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="term"]': 'term',
    }
  });
  mod.FutureTermCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      clientName: {
        title: 'Nom',
        type: 'CustText'
      }
    },
    term: function () {
      var error = this.commit();
      if (!error) {
        app.request('policy:termSearch', this.model, 2)
          .done(function (data) {
            mod.controller.futureTermPolicies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.futureTermPolicies.add(policy);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="term"]': 'term',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.consultLink = new app.common.LinkView({
        model: this.model.get('consultlink')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="consult"]')
        .append(this.consultLink.render()
          .el);
    }
  });
  mod.PolicieTermRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#auto-policy-term-row'
  });
  mod.PolicieTermTable = Marionette.CompositeView.extend({
    template: '#auto-policy-term-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.stepDueTermView = Marionette.Layout.extend({
    template: '#auto-policy-term-view',
    regions: {
      error: '.tkf-error',
      dueTermCriteria: '.tkf-Criteria',
      dueTermPolicies: '.tkf-Policies'
    },
    onRender: function () {
      this.dueTermCriteria.show(new mod.DueTermCriteria({
        model: mod.controller.dueTermCriteria
      }));
      this.dueTermPolicies.show(new mod.PolicieTermTable({
        collection: mod.controller.dueTermPolicies
      }));
    }
  });
  mod.stepTermView = Marionette.Layout.extend({
    template: '#auto-policy-term-view',
    regions: {
      error: '.tkf-error',
      termCriteria: '.tkf-Criteria',
      termPolicies: '.tkf-Policies'
    },
    onRender: function () {
      this.termCriteria.show(new mod.TermCriteria({
        model: mod.controller.termCriteria
      }));
      this.termPolicies.show(new mod.PolicieTermTable({
        collection: mod.controller.termPolicies
      }));
    }
  });
  mod.stepFutureTermView = Marionette.Layout.extend({
    template: '#auto-policy-term-view',
    regions: {
      error: '.tkf-error',
      futureTermCriteria: '.tkf-Criteria',
      futureTermPolicies: '.tkf-Policies'
    },
    onRender: function () {
      this.futureTermCriteria.show(new mod.FutureTermCriteria({
        model: mod.controller.futureTermCriteria
      }));
      this.futureTermPolicies.show(new mod.PolicieTermTable({
        collection: mod.controller.futureTermPolicies
      }));
    }
  });
  //TERM CONSULT VIEWS
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#auto-term-consult',
    regions: {
      header: '.tkf-header',
      vehicle: '.tkf-vehicle',
      coverages: '.tkf-coverages',
      premium: '.tkf-premium',
      subscriber: '.tkf-subscriber',
      payment: '.tkf-payment',
      paymentList: '.tkf-payment-list',
      actionsQuote: '.tkf-actions-quote',
      actionsPolicy: '.tkf-actions-policy',
      message: '.tkf-message'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var vehicle = mod.controller.container.get('vehicle');
      var coverages = mod.controller.container.get('coverages');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      var settlement = mod.controller.container.get('settlement');
      var settlements = mod.controller.container.get('settlements');
      var ref = policy.get('reference');
      policy.set('remainingAmont', policy.get('totalContribution'));
      this.listenTo(policy, 'change:validated', function () {
        var pol = mod.controller.container.get('policy');
        if (pol.get('validated')) {
          this.$('.tkf-payment')
            .addClass('hidden');
          this.$('[data-actions="erase"]')
            .addClass('hidden');
        }
      });
      this.header.show(new mod.TermConsultHeader({
        model: policy
      }));
      this.vehicle.show(new app.auto.QuoteConsultVehicle({
        model: vehicle
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: new app.auto.Coverages(coverages.filter(
          function (c) {
            return c.get('subscribed');
          }))
      }));
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: policy
      }));
      if (person.id) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: person
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: company
        }));
      }
      this.$('.list-group-item.tkf-actions-quote')
        .addClass('hidden');
      this.$('.page-header.tkf-consult-title h3')
        .append(' Police N° ' + ref);
      if (policy.get('validated')) {
        this.actionsPolicy.show(new mod.ActionsPolicyConsult({
          model: policy
        }));
        if (settlements.length !== 0) {
          this.paymentList.show(new mod.Payments({
            collection: settlements
          }));
        }
        else {
          this.$('.list-group-item.tkf-payment-list')
            .addClass('hidden');
        }
      }
      else {
        this.actionsPolicy.show(new mod.ActionsValidate({
          model: policy
        }));
        this.payment.show(new mod.Payment({
          model: settlement
        }));
        this.paymentList.show(new mod.Payments({
          collection: settlements
        }));
      }
    }
  });
  mod.ActionsPolicyConsult = app.common.CustForm.extend({
    template: _.template($('#auto-term-actions-policy')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.aeDoc = new app.common.DocView({
        model: this.model.get('aeDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.aeDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="aePrint"]')
        .append(this.aeDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      var docae = this.model.get('aeDoc');
      var docat = this.model.get('attestationDoc');
      var docrc = this.model.get('receiptDoc');
      if (docae.hasURL() && docrc.hasURL() && docat.hasURL()) {
        this.$('.row.tkf-regenerate')
          .addClass('hidden');
      }
      else {
        this.$('.row.tkf-regenerate')
          .removeClass('hidden');
      }
    },
    regenerate: function () {
      var self = this;
      var docs = {};
      var policy = mod.controller.container.get('policy');
      app.request('auto:contract:regenerate', {
          policy: policy
        })
        .done(function (data) {
          docs = data.docs;
          var docae = self.model.get('aeDoc');
          docae.unset('error');
          docae.fromRequest(docs.aeDoc);
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(docs.rcdoc);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="regenerate"]': 'regenerate',
    }
  });
  mod.ActionsValidate = app.common.CustForm.extend({
    template: _.template($('#auto-term-validate-policy')
      .html()),
    schema: {
      attestationNumber: {
        title: 'Numéro de l\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list',
        requestParams: 'reference'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.aeDoc = new app.common.DocView({
        model: this.model.get('aeDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.aeDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="aePrint"]')
        .append(this.aeDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      this.$('.tkf-message-text')
        .addClass('hidden');
    },
    validateContract: function () {
      this.commit();
      this.$('.tkf-message-text')
        .addClass('hidden');
      var self = this;
      var docs = {};
      var settlements = mod.controller.container.get('settlements');
      var attestationNumber = this.model.get('attestationNumber');
      var policy = mod.controller.container.get('policy');
      app.request('policy:term:validate', {
          policy: policy,
          settlements: settlements,
          attestationNumber: attestationNumber
        })
        .done(function (data) {
          policy.set('validated', true);
          docs = data.docs;
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          self.$('[data-actions="validate"]')
            .addClass('disabled');
          self.disable('attestationNumber', true);
          self.$('[data-actions="validate"]')
            .addClass('disabled');
        })
        .fail(function (data) {
          self.$('.tkf-message-text')
            .removeClass('hidden');
          self.$('.tkf-message-text')
            .text(data.responseText);
        });
    },
    events: {
      'click a[data-actions="validate"]': 'validateContract',
    }
  });
  mod.Payment = app.common.CustForm.extend({
    template: _.template($('#auto-payment-form')
      .html()),
    schema: {
      mode: {
        title: 'Mode',
        type: 'CustSelect',
        data: 'common:settlementMode'
      },
      amount: {
        title: 'Montant',
        type: 'CustNumber'
      },
      date: {
        title: 'Date',
        type: 'CustDate'
      },
      num: {
        title: 'Référence',
        type: 'CustText'
      },
      bank: {
        title: 'Banque',
        type: 'CustSelect',
        data: 'common:banklist'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    disableFields: function (disable) {
      this.disable('num', disable);
      this.disable('bank', disable);
      this.disable('date', disable);
    },
    onModeChange: function () {
      var mode = this.getValue('mode');
      if (mode === '1') {
        this.disableFields(true);
      }
      else if (mode === '0' || mode === '2' || mode === '3') {
        this.disableFields(false);
      }
    },
    clearValues: function () {
      this.model.clear();
      this.setValue('num', null);
      this.setValue('bank', null);
      this.setValue('date', null);
    },
    initEvents: function () {
      this.on('mode:set', function () {
        this.clearValues();
        this.onModeChange();
      });
      var policy = mod.controller.container.get('policy');
      this.listenTo(policy, 'change:remainingAmont', function () {
        var pol = mod.controller.container.get('policy');
        var remaining = pol.get('remainingAmont');
        this.setValue('amount', remaining.toFixed(3));
      });
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      var policy = mod.controller.container.get('policy');
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.onModeChange();
        this.initEvents();
        this.setValue('amount', policy.get('totalContribution')
          .toFixed(3));
      }, this), 0);
      return this;
    },
    addPayment: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont')
        .toFixed(3);
      var amount = this.getValue('amount')
        .toFixed(3);
      var remaining = remainingAmont - amount;
      if (remaining < 0) {
        return false;
      }
      this.commit();
      if (this.validatePayment()) {
        settlements.add(this.model);
        this.model = new mod.Settlement();
        this.clearValues();
        this.setValue('mode', null);
        this.setValue('date', null);
        this.disableFields(true);
        policy.set('remainingAmont', remaining);
      }
    },
    validatePayment: function () {
      var mode = this.model.get('mode');
      var amount = this.model.get('amount');
      var date = this.model.get('date');
      var num = this.model.get('num');
      var bank = this.model.get('bank');
      if (mode === '') {
        return false;
      }
      if (amount === null) {
        return false;
      }
      if (mode === '0' || mode === '2') {
        if (date === null || num === '' || bank === '') {
          return false;
        }
      }
      return true;
    },
    events: {
      'click [data-actions="addPayment"]': 'addPayment',
    }
  });
  mod.PaymentRow = Marionette.ItemView.extend({
    template: '#auto-payment-consult-row',
    tagName: 'tr',
    templateHelpers: {
      updateSettlementMode: function () {
        var mode = this.mode;
        if (mode === '0') {
          return 'Virement';
        }
        else if (mode === '1') {
          return 'Espèces/Versement';
        }
        else if (mode === '2') {
          return 'Chèque';
        }
        else if (mode === '3') {
          return 'Traite';
        }
      },
      updateBankDescription: function () {
        var bank = this.bank;
        if (bank !== '') {
          return app.common.enums.banks[bank - 1].text;
        }
        else {
          return '';
        }
      }
    },
    erase: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont');
      policy.set('remainingAmont', remainingAmont + this.model.get(
        'amount'));
      settlements.remove(this.model);
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  mod.Payments = Marionette.CompositeView.extend({
    template: '#auto-payment-consult-table',
    itemView: mod.PaymentRow,
    itemViewContainer: 'tbody'
  });
  mod.TermConsultHeader = Marionette.ItemView.extend({
    template: '#auto-term-consult-header',
    ui: {
      billingFrequency: '[data-values="billingFrequency"]',
      effectiveDate: '[data-values="effectiveDate"]',
      termDate: '[data-values="termDate"]',
      beginDate: '[data-values="beginDate"]',
      endDate: '[data-values="endDate"]'
    },
    onRender: function () {
      if (this.model.isRenewable()) {
        this.ui.beginDate.parent()
          .addClass('hidden');
        this.ui.endDate.parent()
          .addClass('hidden');
      }
      else {
        this.ui.billingFrequency.parent()
          .addClass('hidden');
        this.ui.effectiveDate.parent()
          .addClass('hidden');
        this.ui.primaryTermDate.parent()
          .addClass('hidden');
      }
    }
  });
});

main.module('auto.valid', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'contract/:id/valid': function (id) {
        app.execute('auto:valid', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('auto.valid', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:valid', function (id) {
      if (app.auto.current !== 'valid') {
        app.auto.current = 'valid';
        mod.controller = new mod.Controller();
        mod.controller.launch(id);
      }
    });
  });
});

main.module('auto.valid', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    launch: function (id) {
      var self = this;
      app.request('auto:fleet:get', {
          id: id
        })
        .done(function (data) {
          self.container = new mod.Container();
          var policy = self.container.get('policy');
          var vehicles = self.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
          policy.set('receiptDoc', new app.common.Doc({
            title: 'Quittance'
          }));
          var validLock = self.container.get('validationLocks');
          validLock.fromRequest(data.validationLocks);
          var discounts = self.container.get('discounts');
          discounts.fromRequest(data.discounts);
          self.layout = new mod.PolicyValidateView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    }
  });
});





main.module('auto.valid', function (mod, app, Backbone) {
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.auto.Quote(),
        vehicles: new mod.Vehicles(),
        validationLocks: new mod.ValidationLocks(),
        discounts: new mod.Discounts()
      };
    },
    initialize: function () {
      this.get('policy')
        .clear();
      this.get('vehicles')
        .reset();
      this.get('validationLocks')
        .reset();
      this.get('discounts')
        .reset();
    }
  });
  mod.Vehicles = Backbone.Collection.extend({
    model: app.auto.Vehicle
  });
  mod.ValidationLock = Backbone.Model.extend({});
  mod.ValidationLocks = Backbone.Collection.extend({
    model: mod.ValidationLock
  });
  mod.Discount = Backbone.Model.extend({
    defaults: function () {
      return {
        usage: null,
        cover: null,
        discount: null
      };
    }
  });
  mod.Discounts = Backbone.Collection.extend({
    model: mod.Discount
  });
});



/*jslint browser:true */
main.module('auto.valid', function (mod, app, Backbone, Marionette, $, _) {
  mod.PolicyValidateView = Marionette.Layout.extend({
    template: '#auto-validate',
    regions: {
      policy: '.tkf-policy',
      contribution: '.tkf-contribution',
      validatePolicy: '.tkf-validate-policy',
      reports: '.tkf-reports'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      this.policy.show(new mod.FleetPolicyView({
        model: policy
      }));
      this.contribution.show(new mod.FleetContributionView({
        model: policy
      }));
      if (policy.get('userAdmin')) {
        this.validatePolicy.show(new mod.FleetValidateView({
          model: policy
        }));
      }
      else {
        this.validatePolicy.show(new mod.FleetValidateActionView({
          model: policy
        }));
      }
      this.reports.show(new mod.FleetVehicleValidate({
        collection: mod.controller.container.get('vehicles')
      }));
    }
  });
  mod.FleetPolicyView = Marionette.ItemView.extend({
    template: '#auto-fleet-policy-view'
  });
  mod.FleetContributionView = Marionette.ItemView.extend({
    template: '#auto-fleet-contribution-view',
    initialize: function () {
      var self = this;
      this.listenTo(this.model, 'change', function () {
        self.render();
      });
    }
  });
  mod.FleetValidateActionView = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-validate-action')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
    },
    validateFleet: function () {
      var policy = this.model;
      app.request('auto:fleet:validate', {
          policy: policy
        })
        .done(function (data) {
          policy.get('receiptDoc')
            .fromRequest(data.receiptDoc);
          policy.set('validated', true);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="validateFleet"]': 'validateFleet'
    }
  });
  mod.FleetVehicleValidateRow = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-vehicle-validate-row')
      .html()),
    schema: {
      attestationNumber: {
        title: 'N° d\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list',
        requestParam: 'reference'
      },
      bonus: {
        title: 'Classe BM',
        type: 'CustNumber'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      var policy = mod.controller.container.get('policy');
      if (policy.get('userAdmin')) {
        this.$('[data-fields="bonus"]')
          .removeClass('hidden');
        this.$('[data-actions="saveBonus"]')
          .removeClass('hidden');
      }
      else {
        this.$('[data-fields="bonus"]')
          .addClass('hidden');
        this.$('[data-actions="saveBonus"]')
          .addClass('hidden');
      }
    },
    details: function () {
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Détails du véhicule');
      var vehicleview = new mod.VehiculeModalView({
        model: this.model
      });
      dialog.show(vehicleview);
    },
    printAtt: function () {
      var vehicle = this.model;
      var policy = mod.controller.container.get('policy');
      var self = this;
      if (this.getValue('attestationNumber') !== '') {
        app.request('auto:fleet:printAttestation', {
            vehicle: vehicle,
            attestation: this.getValue('attestationNumber'),
            policy: policy
          })
          .done(function (data) {
            self.disable('attestationNumber', true);
            var pdfname = data.doc.docname;
            var doc = data.doc.pdfid;
            var lob = data.doc.lob;
            var link = document.createElement('a');
            link.download = pdfname;
            link.href = 'doc?doc=' + pdfname + '&lob=' + lob +
              '&id=' + doc;
            link.click();
          })
          .fail(app.fail);
      }
    },
    printVehicle: function () {
      var vehicle = this.model;
      var policy = mod.controller.container.get('policy');
      app.request('auto:fleet:printvehicle', {
          vehicle: vehicle,
          policy: policy
        })
        .done(function (data) {
          var pdfname = data.doc.docname;
          var doc = data.doc.pdfid;
          var lob = data.doc.lob;
          var link = document.createElement('a');
          link.download = pdfname;
          link.href = 'doc?doc=' + pdfname + '&lob=' + lob + '&id=' +
            doc;
          link.click();
        })
        .fail(app.fail);
    },
    saveBonus: function () {
      if (!_.isNumber(this.getValue('bonus'))) {
        return;
      }
      this.model.set('bonus', this.getValue('bonus'));
      var vehicle = this.model;
      var policy = mod.controller.container.get('policy');
      app.request('auto:admin:saveBonus', {
          policy: policy,
          vehicle: vehicle
        })
        .done(function (data) {
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="details"]': 'details',
      'click a[data-actions="printAtt"]': 'printAtt',
      'click a[data-actions="printVehicle"]': 'printVehicle',
      'click a[data-actions="saveBonus"]': 'saveBonus'
    }
  });
  mod.FleetVehicleValidate = Marionette.CompositeView.extend({
    template: '#auto-fleet-vehicle-validate-table',
    itemView: mod.FleetVehicleValidateRow,
    itemViewContainer: 'tbody'
  });
  mod.FleetConsultVehicle = Marionette.ItemView.extend({
    template: '#auto-fleet-consult-vehicle'
  });
  mod.VehiculeModalView = Marionette.Layout.extend({
    template: '#auto-vehicle-modal-view',
    regions: {
      vehicle: '.tkf-vehicle',
      coverages: '.tkf-coverages'
    },
    onRender: function () {
      this.vehicle.show(new mod.FleetConsultVehicle({
        model: this.model
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: this.model.get('coverages')
      }));
    }
  });
  mod.FleetValidLock = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-valid-lock-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      if (this.model.get('validated') === true) {
        this.$('[data-actions="unlockValidation"]')
          .addClass('disabled');
      }
      else if (this.model.get('validated') === false) {
        this.$('[data-actions="lockValidation"]')
          .addClass('disabled');
      }
    },
    lockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:lockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function (data) {
          validationLocks.fromRequest(data.validationLocks);
          self.$('[data-actions="lockValidation"]')
            .addClass('disabled');
          self.$('[data-actions="unlockValidation"]')
            .removeClass('disabled');
        })
        .fail(app.fail);
    },
    unlockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:unlockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function (data) {
          validationLocks.fromRequest(data.validationLocks);
          self.$('[data-actions="unlockValidation"]')
            .addClass('disabled');
          self.$('[data-actions="lockValidation"]')
            .removeClass('disabled');
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="lockValidation"]': 'lockValidation',
      'click a[data-actions="unlockValidation"]': 'unlockValidation'
    }
  });
  mod.FleetValidationLocks = Marionette.CompositeView.extend({
    template: '#auto-fleet-valid-locks',
    itemView: mod.FleetValidLock,
    itemViewContainer: 'tbody'
  });
  mod.FleetDisc = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-discount-manage')
      .html()),
    schema: {
      usage: {
        title: 'Usage',
        type: 'CustSelect',
        request: 'auto:fleet:usages',
        validators: ['required'],
        requestParam: 'reference'
      },
      cover: {
        title: 'Garantie',
        type: 'CustSelect',
        request: 'auto:fleet:covers',
        validators: ['required'],
        requestParam: 'reference'
      },
      discount: {
        title: 'Réduction',
        type: 'CustNumber',
        validators: ['required'],
        unit: '%'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      var policy = mod.controller.container.get('policy');
      this.model.set('reference', policy.get('reference'));
    },
    saveDiscount: function () {
      var currUs = this.getValue('usage');
      var currCv = this.getValue('cover');
      var currDc = this.getValue('discount');
      if (currUs === null || currCv === null || currDc === null) {
        return false;
      }
      var policy = mod.controller.container.get('policy');
      var usage = this.$('[data-fields="usage"]')
        .text();
      usage = usage.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      var cover = this.$('[data-fields="cover"]')
        .text();
      cover = cover.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      this.model.set('usageDesc', usage);
      this.model.set('coverDesc', cover);
      this.model.set('usage', this.getValue('usage'));
      this.model.set('cover', this.getValue('cover'));
      this.model.set('discount', this.getValue('discount'));
      this.model.set('reference', policy.get('reference'));
      var discounts = mod.controller.container.get('discounts');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:saveDiscount', {
          discount: currValid
        })
        .done(function (data) {
          discounts.add(self.model);
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
          self.model = new mod.Discount();
          self.setValue('usage', null);
          self.setValue('cover', null);
          self.setValue('discount', null);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="saveDiscount"]': 'saveDiscount'
    }
  });
  mod.FleetDiscountRow = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-discounts-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
    },
    cancelDiscount: function () {
      var discounts = mod.controller.container.get('discounts');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:cancelDiscount', {
          discount: currValid
        })
        .done(function (data) {
          discounts.remove(self.model);
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="cancelDiscount"]': 'cancelDiscount'
    }
  });
  mod.FleetDiscounts = Marionette.CompositeView.extend({
    template: '#auto-fleet-discounts',
    itemView: mod.FleetDiscountRow,
    itemViewContainer: 'tbody'
  });
  mod.FleetApplyBonus = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-apply-bonus')
      .html()),
    schema: {
      customBonus: {
        title: 'Nouvelles classes BM',
        type: 'CustNumber'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="applyBonus"]')
        .removeClass('disabled');
      this.$('[data-actions="revertBonus"]')
        .addClass('disabled');
    },
    applyBonus: function () {
      this.trigger('commit');
      if (!_.isNumber(this.getValue('customBonus'))) {
        return;
      }
      var policy = mod.controller.container.get('policy');
      var currBonus = this.model;
      currBonus.set('customBonus', this.getValue('customBonus'));
      var self = this;
      app.request('auto:admin:applyBonus', {
          policy: policy,
          bonus: currBonus
        })
        .done(function (data) {
          self.$('[data-actions="applyBonus"]')
            .addClass('disabled');
          self.$('[data-actions="revertBonus"]')
            .removeClass('disabled');
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    revertBonus: function () {
      var policy = mod.controller.container.get('policy');
      var self = this;
      app.request('auto:admin:revertBonus', {
          policy: policy
        })
        .done(function (data) {
          self.setValue('customBonus', null);
          self.$('[data-actions="applyBonus"]')
            .removeClass('disabled');
          self.$('[data-actions="revertBonus"]')
            .addClass('disabled');
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="applyBonus"]': 'applyBonus',
      'click a[data-actions="revertBonus"]': 'revertBonus'
    }
  });
  mod.FleetValidateView = Marionette.Layout.extend({
    template: '#auto-fleet-validate-view',
    regions: {
      validateLocks: '.tkf-validate-locks',
      validateUpdateBonus: '.tkf-validate-bonus',
      validateDiscountAction: '.tkf-validate-discount-action',
      validateDiscount: '.tkf-validate-discount',
      validateActions: '.tkf-validate-actions'
    },
    onRender: function () {
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      var policy = mod.controller.container.get('policy');
      var discounts = mod.controller.container.get('discounts');
      var singleDisc = new mod.Discount();
      this.validateLocks.show(new mod.FleetValidationLocks({
        collection: validationLocks
      }));
      this.validateUpdateBonus.show(new mod.FleetApplyBonus({
        model: policy
      }));
      this.validateDiscountAction.show(new mod.FleetDisc({
        model: singleDisc
      }));
      this.validateDiscount.show(new mod.FleetDiscounts({
        collection: discounts
      }));
      this.validateActions.show(new mod.FleetValidateActionView({
        model: this.model
      }));
    }
  });
});
