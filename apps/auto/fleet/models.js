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
