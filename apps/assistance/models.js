main.module('assistance', function (mod, app, Backbone, Marionette, $, _) {
  mod.Travel = Backbone.Model.extend({
    /*
     * country: select (France, ...)
     * zone: string (pour info)
     * type: select (individuel, couple sans enfants, couple avec enfant)
     * personsNumber: number
     */
    defaults: {
      zone: ''
    },
    getIndividualTypeValue: function () {
      return 'Individual';
    },
    getCoupleTypeValue: function () {
      return 'coupleWithoutChildren';
    },
    getNumberDisabled: function () {
      if (this.get('type')) {
        if (this.get('type') === this.getIndividualTypeValue()) {
          return true;
        }
        else {
          if (this.get('type') === this.getCoupleTypeValue()) {
            return true;
          }
          else {
            return false;
          }
        }
      }
      else {
        return false;
      }
    }
  });
  mod.ThirdPartyPerson = Backbone.Model.extend({
    /*
     * name: string
     * phone: string
     * address: string
     */
  });
  mod.Traveler = Backbone.Model.extend({
    /*
     * passportId: string
     * firstName: string
     * lastName: string
     * birthDate: date
     * phone: string
     */
    dateAttributes: ['birthDate']
  });
  mod.Travelers = Backbone.Collection.extend({
    model: mod.Traveler
  });
  mod.Coverage = Backbone.Model.extend({
    /*
     * name: string
     * subscribed: boolean
     * subscribedModifiable: boolean
     * limit: amount
     * limitModifiable: boolean
     * deductible: percent
     * deductibleModifiable: boolean
     * rate: amount (tarif annuel)
     * premium: amount (prime nette / term)
     * tax: amount (tax sur prime nette)
     */
    defaults: {
      subscribed: false,
      subscribedModifiable: true,
      limit: null,
      limitModifiable: false,
      deductible: null,
      deductibleModifiable: false,
      rate: null,
      premium: null,
      tax: null
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
     * kind: (temporary or fixed duration)
     * effectiveDate: date (for temporary)
     * endDate: date (for temporary)
     * premium: amount
     * fees: amount
     * taxes: amount
     * commission: amount
     * stampFGA: num
     * subscriber: select (personne physique ou morale)
     * subscriberName: string
     * subscriberPhone: string
     * subscriberEmail: string
     * quoteDoc: quote printed offer
     * cpDoc: conditions particulières
     * receiptDoc: quittance
     */
    dateAttributes: ['effectiveDate', 'endDate', 'maxEndDate'],
    getTemporaryKind: function () {
      return 'Temporaire';
    },
    isTemporary: function () {
      return this.get('kind') === this.getTemporaryKind();
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
    getCompanySubscriber: function () {
      return 'Personne morale';
    },
    isSubscriberCompany: function () {
      return this.get('subscriber') === this.getCompanySubscriber();
    },
    wasSubscriberCompany: function () {
      return this.previous('subscriber') === this.getCompanySubscriber();
    },
    defaults: function () {
      return {
        kind: this.getTemporaryKind(),
        effectiveDate: moment()
          .startOf('day')
          .add(1, 'd')
          .toDate(),
        endDate: null,
        premium: null,
        fees: null,
        taxes: null,
        stampFGA: null,
        subscriber: this.getPersonSubscriber(),
        quoteDoc: new app.common.Doc({
          title: 'Devis'
        }),
        cpDoc: new app.common.Doc({
          title: 'Conditions particulières'
        }),
        receiptDoc: new app.common.Doc({
          title: 'Quittance'
        })
      };
    }
  });
  mod.Pricing = Backbone.Model.extend({});
  mod.Pricings = Backbone.Collection.extend({
    model: mod.Pricing
  });
});
