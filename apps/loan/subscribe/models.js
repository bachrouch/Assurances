main.module('loan.subscribe', function (mod, app, Backbone, Marionette, $, _) {
  mod.Step = app.common.Step.extend({
    getPath: function () {
      return 'subscribe/step/' + this.get('rank');
    }
  });
  mod.Summary = Backbone.Model.extend({
    defaults: function () {
      return {
        insured: [],
        credit: [],
        premium: [],
        subscriber: []
      };
    },
    updateInsured: function (insured) {
      var data = [];
      var fullName = insured.getFullName();
      if (fullName) {
        data.push('Nom:' + fullName);
      }
      var birthDate = insured.get('birthDate');
      if (birthDate) {
        data.push('Date de naissance: ' + _.beautifyDate(birthDate));
      }
      var insuredAge = insured.get('insuredAge');
      if (insuredAge) {
        data.push('Age: ' + insuredAge + ' ans');
      }
      this.set('insured', data);
    },
    updateCredit: function (credit) {
      var data = [];
      var amount = credit.get('amount');
      if (amount) {
        data.push('Montant du prêt: ' + _.beautifyAmount(amount));
      }
      var releaseDate = credit.get('releaseDate');
      if (releaseDate) {
        data.push('Date de déblocage: ' + _.beautifyDate(releaseDate));
      }
      var duration = credit.get('duration');
      if (duration) {
        if (duration % 12 === 0) {
          duration = duration / 12;
          duration += ' Ans';
        }
        else {
          var reste = duration % 12;
          duration = Math.floor(duration / 12);
          duration += ' ans et ' + reste + ' mois';
        }
        data.push('Durée du prêt: ' + duration);
      }
      var deductible = credit.get('deductible');
      if (deductible) {
        data.push('Franchise: ' + deductible + ' mois');
      }
      this.set('credit', data);
    },
    updatePremium: function (quote) {
      var data = [];
      var premium = quote.get('premium');
      if (premium) {
        data.push('Contribution: ' + _.beautifyAmount(premium));
      }
      var fees = quote.get('fees');
      if (fees) {
        data.push('Frais du Contrat: ' + _.beautifyAmount(fees));
      }
      var totalPremium = quote.get('totalPremium');
      if (totalPremium) {
        data.push('Contribution TTC: ' + _.beautifyAmount(
          totalPremium));
      }
      var premiumMessage = '<span class="contribution-message">Sous';
      premiumMessage += ' réserve de bon état de santé</span>';
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
        data.push('Nom:' + fullName);
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
        quote: new app.loan.Quote(),
        credit: new app.loan.Credit(),
        beneficiary: new app.loan.Beneficiary(),
        medquestions: new app.loan.MedicalQuestions(),
        medselections: new app.loan.MedicalSelections(),
        doctorprovider: new app.loan.DoctorProvider(),
        doctortests: new app.loan.DoctorTests(),
        labprovider: new app.loan.LabProvider(),
        labtests: new app.loan.LabTests(),
        cardioprovider: new app.loan.CardioProvider(),
        cardiotests: new app.loan.CardioTests(),
        imageprovider: new app.loan.ImageProvider(),
        imagetests: new app.loan.ImageTests(),
        coverages: new app.loan.Coverages(),
        amortizations: new app.loan.Amortizations(),
        insured: new app.loan.Insured(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        insuredperson: new app.actors.InsuredPerson(),
        insuredcompany: new app.actors.InsuredCompany(),
        summary: new mod.Summary()
      };
    },
    initEvents: function () {
      var quote = this.get('quote');
      var credit = this.get('credit');
      var person = this.get('person');
      var company = this.get('company');
      var summary = this.get('summary');
      var insured = this.get('insured');
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
      summary.listenTo(insured, 'change', function () {
        this.updateInsured(insured);
      });
      summary.listenTo(quote, 'change', function () {
        this.updatePremium(quote);
      });
      summary.listenTo(credit, 'change', function () {
        this.updateCredit(credit);
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
      this.get('credit')
        .clear();
      this.get('beneficiary')
        .clear();
      this.get('medquestions')
        .reset();
      this.get('medselections')
        .reset();
      this.get('providers')
        .reset();
      this.get('coverages')
        .reset();
      this.get('insured')
        .clear();
      this.get('amortizations')
        .reset();
      this.get('person')
        .clear();
      this.get('company')
        .clear();
    }
  });
});
