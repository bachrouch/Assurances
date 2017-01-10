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
