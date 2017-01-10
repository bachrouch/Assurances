main.module('assistance.subscribe', function (mod, app, Backbone, Marionette, $,
  _) {
  mod.Step = app.common.Step.extend({
    getPath: function () {
      return 'subscribe/step/' + this.get('rank');
    }
  });
  mod.Summary = Backbone.Model.extend({
    defaults: function () {
      return {
        contract: [],
        travel: [],
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
      var effectiveDate = quote.get('effectiveDate');
      if (effectiveDate) {
        data.push('Effet: ' + _.beautifyDate(effectiveDate));
      }
      var endDate = quote.get('endDate');
      if (endDate) {
        data.push('Fin: ' + _.beautifyDate(endDate));
      }
      var pricing = quote.get('pricingDesc');
      if (pricing) {
        data.push('<span class="summary-bold">Tarif: ' + pricing +
          '</span>');
      }
      this.set('contract', data);
    },
    updateTravel: function (travel) {
      var data = [];
      var display;
      var country = travel.get('country');
      var zone = travel.get('zone');
      if (country && zone) {
        display = '<span class="summary-bold">Zone ' + zone;
        display += '</span></br>Pays: <ul class="summary-list">';
        _.each(country, function (item) {
          display += '<li>' + item + '</li>';
        });
        display += '</ul>';
        data.push(display);
      }
      this.set('travel', data);
    },
    updatePremium: function (quote) {
      var data = [];
      var total = 0;
      var premium = quote.get('premium');
      if (premium) {
        data.push('Cont Nette: ' + _.beautifyAmount(premium));
        total += premium;
      }
      var fees = quote.get('fees');
      if (fees) {
        data.push('Frais: ' + _.beautifyAmount(fees));
        total += fees;
      }
      var taxes = quote.get('taxes');
      if (taxes) {
        data.push('FGA: ' + _.beautifyAmount(taxes));
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
        data.push('Cont. Totale: ' + _.beautifyAmount(total) + ' TTC');
      }
      var premiumMessage = '<span class="contribution-message">';
      premiumMessage += 'Majoration éventuelle en fonction de';
      premiumMessage += ' l\'âge du (des) voyageur(s).</span>';
      data.push(premiumMessage);
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
        quote: new app.assistance.Quote(),
        travel: new app.assistance.Travel(),
        pricings: new app.assistance.Pricings(),
        pricing: new app.assistance.Pricing(),
        travelers: new app.assistance.Travelers(),
        doctor: new app.assistance.ThirdPartyPerson(),
        personToPrevent: new app.assistance.ThirdPartyPerson(),
        coverages: new app.assistance.Coverages(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        summary: new mod.Summary()
      };
    },
    initEvents: function () {
      var quote = this.get('quote');
      var travel = this.get('travel');
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
      summary.listenTo(travel, 'change', function () {
        this.updateTravel(travel);
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
      this.get('travel')
        .clear();
      this.get('coverages')
        .reset();
      this.get('travelers')
        .reset();
      this.get('doctor')
        .clear();
      this.get('personToPrevent')
        .clear();
      this.get('person')
        .clear();
      this.get('company')
        .clear();
      this.get('pricings')
        .reset();
    }
  });
});
