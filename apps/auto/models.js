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
