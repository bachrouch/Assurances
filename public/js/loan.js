main.module('loan', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('loan:ui:index');
        },
        index: function () {
          app.execute('loan:ui:index');
        },
        error: function () {
          app.execute('loan:ui:error');
        }
      }
    });
  });
});

main.module('loan', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:ui:index', function () {
      app.loan.current = 'index';
      app.mainRegion.show(new mod.IndexView());
    });
    app.commands.setHandler('loan:ui:error', function () {
      app.loan.current = 'error';
      app.mainRegion.show(new mod.ErrorView());
    });
    app.commands.setHandler('loan:subscriber:types', function (cb) {
      cb([{
        id: 'Personne physique',
        text: 'Personne physique'
      }, {
        id: 'Personne morale',
        text: 'Personne morale'
      }]);
    });
    app.commands.setHandler('loan:person:genders', function (cb) {
      cb([{
        id: 1,
        text: 'Monsieur'
      }, {
        id: 2,
        text: 'Madame'
      }]);
    });
    app.commands.setHandler('loan:fraction:refund', function (cb) {
      cb([{
        id: 'Annuel',
        text: 'Annuel'
      }, {
        id: 'Mensuel',
        text: 'Mensuel'
      }]);
    });
    app.commands.setHandler('loan:fraction:premium', function (cb) {
      cb([{
        id: 'Unique',
        text: 'Unique'
      }, {
        id: 'Unique',
        text: 'Unique'
      }]);
    });
    app.commands.setHandler('loan:insured:types', function (cb) {
      cb([{
        id: 'Assuré',
        text: 'Assuré'
      }, {
        id: 'Autre',
        text: 'Autre'
      }]);
    });
    app.commands.setHandler('loan:insured:smoking', function (cb) {
      cb([{
        id: 'Non',
        text: 'Non'
      }, {
        id: 'Fumeur occasionnel',
        text: 'Fumeur occasionnel'
      }, {
        id: 'Fumeur modéré',
        text: 'Fumeur modéré'
      }, {
        id: 'Grand fumeur',
        text: 'Grand fumeur'
      }]);
    });
    app.commands.setHandler('loan:contribution:adjust', function (cb) {
      cb([{
        id: 0,
        text: 'Aucun ajustement'
      }, {
        id: 5,
        text: 'Ajustement minimal (5%)'
      }, {
        id: 10,
        text: 'Ajustement moyen (10%)'
      }, {
        id: 15,
        text: 'Ajustement moyen (15%)'
      }, {
        id: 20,
        text: 'Ajustement maximal (20%)'
      }]);
    });
    app.commands.setHandler('loan:teta:adjust', function (cb) {
      cb([{
        id: 0,
        text: 'Pas de frais d\'acquisition (0%)'
      }, {
        id: 5,
        text: 'Frais d\'acquisition minimaux (5%)'
      }, {
        id: 10,
        text: 'Frais d\'acquisition moyens (10%)'
      }, {
        id: 15,
        text: 'Frais d\'acquisition moyens (15%)'
      }, {
        id: 20,
        text: 'Frais d\'acquisition maximaux (20%)'
      }]);
    });
  });
});







main.module('loan', function (mod, app, Backbone) {
  mod.Credit = Backbone.Model.extend({
    /*
     * releaseDate: date
     * endDate: date
     * amount: number
     * duration: number
     * deductible: number
     * refundFreq: select
     * premiumFreq: select
     */
    dateAttributes: ['releaseDate', 'endDate']
  });
  mod.Insured = Backbone.Model.extend({
    /*
     * id: string (cin)
     * state: select
     * gender: select (monsieur/madame)
     * firstName: string
     * lastName: string
     * birthDate: date
     * birthPlace: select (gouvernorat)
     */
    dateAttributes: ['birthDate'],
    getFullName: function () {
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      if (firstName && lastName) {
        return firstName + ' ' + lastName;
      }
    }
  });
  mod.Beneficiary = Backbone.Model.extend({
    /*
     * company: select
     * agency: number
     */
  });
  mod.Coverage = Backbone.Model.extend({
    /*
     * name: string
     * rate: number
     * fees: number
     * premium: number
     */
    defaults: {
      name: null,
      rate: null,
      fees: null,
      premium: null
    }
  });
  mod.Coverages = Backbone.Collection.extend({
    model: mod.Coverage
  });
  mod.Reports = Backbone.Model.extend({
    /*
     * medselDoc: Document
     */
    defaults: function () {
      return {
        medicalReport: new app.common.Doc({
          title: 'Rapport médical'
        }),
        urineAnalysis: new app.common.Doc({
          title: 'Examen urines'
        }),
        medicalQuest: new app.common.Doc({
          title: 'Questionnaire médical'
        }),
        bloodProfile: new app.common.Doc({
          title: 'Profil sanguin'
        }),
        ecgReport: new app.common.Doc({
          title: 'ECG'
        }),
        psaReport: new app.common.Doc({
          title: 'PSA'
        }),
        effortECGReport: new app.common.Doc({
          title: 'ECG d\'effort'
        }),
        chestReport: new app.common.Doc({
          title: 'Radio thorax'
        }),
        financialReport: new app.common.Doc({
          title: 'Questionnaire financier'
        })
      };
    }
  });
  mod.MedicalQuestion = Backbone.Model.extend({});
  mod.MedicalQuestions = Backbone.Collection.extend({
    model: mod.MedicalQuestion
  });
  mod.DoctorProvider = Backbone.Model.extend({});
  mod.DoctorTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.DoctorTests = Backbone.Collection.extend({
    model: mod.DoctorTest
  });
  mod.LabProvider = Backbone.Model.extend({});
  mod.LabTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.LabTests = Backbone.Collection.extend({
    model: mod.LabTest
  });
  mod.CardioProvider = Backbone.Model.extend({});
  mod.CardioTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.CardioTests = Backbone.Collection.extend({
    model: mod.CardioTest
  });
  mod.ImageProvider = Backbone.Model.extend({});
  mod.ImageTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.ImageTests = Backbone.Collection.extend({
    model: mod.ImageTest
  });
  mod.MedicalSelection = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.MedicalSelections = Backbone.Collection.extend({
    model: mod.MedicalSelection
  });
  mod.Amortization = Backbone.Model.extend({
    /*
     * date: date
     * amount: amount
     */
    defaults: {
      date: null,
      amount: null
    }
  });
  mod.Amortizations = Backbone.Collection.extend({
    model: mod.Amortization
  });
  mod.Quote = Backbone.Model.extend({
    /*
     * premium: amount
     * rate: amount
     * fees: amount
     * totalPremium: amount
     * subscriber: select (personne physique ou morale)
     * subscriberName: string
     * subscriberPhone: string
     * insured: select (personne physique ou morale)
     * subscriberEmail: string
     * quoteDoc: quote printed offer
     * cpDoc: conditions particulières
     * receiptDoc: quittance
     * isSubscriberInsured: boolean default set to true
     */
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
        premium: null,
        fees: null,
        totalPremium: null,
        isSubscriberInsured: true,
        subscriber: this.getPersonSubscriber(),
        insured: this.getPersonInsured(),
        cpDoc: new app.common.Doc({
          title: 'Conditions particulières'
        }),
        receiptDoc: new app.common.Doc({
          title: 'Quittance'
        }),
        validateLink: new app.common.ProcessLink({
          title: 'Valider'
        })
      };
    }
  });
});

main.module('loan', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('loan:credit:beneficiaries', function (
      criterium) {
      return app.common.post('/svc/loan/credit/beneficiaries', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:coverage:list', function (data) {
      return app.common.post('/svc/loan/coverage/list', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:amortization:list', function (data) {
      return app.common.post('/svc/loan/amortization/list', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:subscriber:set', function (data) {
      return app.common.post('/svc/loan/subscriber/set', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest()
      });
    });
    app.reqres.setHandler('loan:credit:create', function (data) {
      return app.common.post('/svc/loan/credit/create', {
        quote: data.quote.toRequest(),
        credit: data.credit.toRequest(),
        insured: data.insured.toRequest(),
        beneficiary: data.beneficiary.toRequest()
      });
    });
    app.reqres.setHandler('loan:credit:update', function (data) {
      return app.common.post('/svc/loan/credit/update', {
        quote: data.quote.toRequest(),
        credit: data.credit.toRequest(),
        insured: data.insured.toRequest(),
        beneficiary: data.beneficiary.toRequest()
      });
    });
    app.reqres.setHandler('loan:print:quote', function (data) {
      return app.common.post('/svc/loan/print/quote', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:print:cp', function (data) {
      return app.common.post('/svc/loan/print/cp', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:policy:get', function (data) {
      return app.common.post('/svc/loan/policy/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('loan:print:receipt', function (data) {
      return app.common.post('/svc/loan/print/receipt', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:contract:save', function (data) {
      return app.common.post('/svc/loan/contract/save', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:medicalselection:set', function (data) {
      return app.common.post('/svc/loan/medicalselection/set', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest(),
        medquestions: data.medquestions.toRequest()
      });
    });
    app.reqres.setHandler('loan:medicalselection:check', function (data) {
      return app.common.post('/svc/loan/medicalselection/check', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest()
      });
    });
    app.reqres.setHandler('loan:provider:doctor', function (criterium) {
      return app.common.post('/svc/loan/provider/doctor', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:provider:lab', function (criterium) {
      return app.common.post('/svc/loan/provider/lab', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:provider:cardio', function (criterium) {
      return app.common.post('/svc/loan/provider/cardio', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:provider:imagery', function (criterium) {
      return app.common.post('/svc/loan/provider/imagery', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:print:medicalreport', function (data) {
      return app.common.post('/svc/loan/print/medicalreport', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:financialreport', function (data) {
      return app.common.post('/svc/loan/print/financialreport', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:detailedquest', function (data) {
      return app.common.post('/svc/loan/print/detailedquest', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:urinetest', function (data) {
      return app.common.post('/svc/loan/print/urinetest', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:bloodprofile', function (data) {
      return app.common.post('/svc/loan/print/bloodprofile', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:psa', function (data) {
      return app.common.post('/svc/loan/print/psa', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:ecg', function (data) {
      return app.common.post('/svc/loan/print/ecg', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:stressecg', function (data) {
      return app.common.post('/svc/loan/print/stressecg', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:chestfilm', function (data) {
      return app.common.post('/svc/loan/print/chestfilm', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:project:save', function (data) {
      return app.common.post('/svc/loan/project/save', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:contribution:calculate', function (data) {
      return app.common.post('/svc/loan/contribution/calculate', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:admin:edit', function (data) {
      return app.common.post('/svc/loan/admin/edit', {
        policy: data.policy.toRequest(),
        editedmodel: data.editedmodel,
        newdata: data.newdata.toRequest(),
        extradata: data.extradata
      });
    });
    app.reqres.setHandler('loan:contract:validate', function (data) {
      return app.common.post('/svc/loan/contract/validate', {
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('loan:admin:lockvalidation', function (data) {
      return app.common.post('/svc/loan/admin/lockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('loan:admin:unlockvalidation', function (data) {
      return app.common.post('/svc/loan/admin/unlockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('loan:subscriber:check', function (data) {
      return app.common.post('/svc/loan/subscriber/check', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest()
      });
    });
  });
});

main.module('loan', function (mod, app, Backbone, Marionette, $, _) {
  mod.IndexView = Marionette.ItemView.extend({
    template: '#loan-index'
  });
  mod.ErrorView = Marionette.ItemView.extend({
    template: '#loan-error'
  });
  mod.CreditForm = app.common.CustForm.extend({
    template: _.template($('#loan-credit-form')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
      amount: {
        title: 'Montant',
        type: 'CustNumber',
        unit: 'DT',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      deductible: {
        title: 'Franchise',
        type: 'CustNumber',
        unit: 'Mois',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      releaseDate: {
        title: 'Date d\'effet',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          value: moment()
            .startOf('day')
            .toDate()
        }],
        disabler: {
          lockcontrols: true
        }
      },
      endDate: {
        title: 'Date fin',
        type: 'CustDate',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      }
    },
    initEvents: function () {
      this.on('endDate:set releaseDate:set', function () {
        this.setUI();
      });
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('amount', true);
          this.disable('deductible', true);
          this.disable('releaseDate', true);
          this.disable('endDate', true);
        }
        else {
          this.disable('amount', false);
          this.disable('deductible', false);
          this.disable('releaseDate', false);
          this.disable('endDate', false);
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
        this.setUI();
      }, this), 0);
      return this;
    },
    setUI: function () {
      var from = this.getValue('releaseDate');
      var to = this.getValue('endDate');
      if (_.isUndefined(from) || _.isNull(from) || _.isUndefined(to) ||
        _.isNull(to)) {
        this.$('[data-values="duration"]')
          .text('');
        this.model.set('duration', null);
        return;
      }
      var dur = moment.duration(to.getTime() - from.getTime())
        .asMonths();
      if (dur <= 0) {
        this.$('[data-values="duration"]')
          .text('');
        this.model.set('duration', null);
        return;
      }
      this.$('[data-values="duration"]')
        .text(Math.ceil(dur) + ' Mois');
      this.model.set('duration', Math.ceil(dur));
    },
  });
  mod.BeneficiaryForm = app.common.CustForm.extend({
    template: _.template($('#loan-beneficiary-form')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
      company: {
        title: 'Bénéficiaire',
        type: 'CustSelect',
        request: 'loan:credit:beneficiaries',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      agency: {
        title: 'Agence',
        type: 'CustNumber',
        disabler: {
          lockcontrols: true
        }
      }
    },
    initEvents: function () {
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('company', true);
          this.disable('agency', true);
        }
        else {
          this.disable('company', false);
          this.disable('agency', false);
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.initEvents();
    }
  });
  mod.InsuredForm = app.common.CustForm.extend({
    template: _.template($('#loan-insured-form')
      .html()),
    schema: {
      gender: {
        title: 'Titre',
        type: 'CustSelect',
        data: 'loan:person:genders',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      id: {
        title: 'CIN',
        type: 'CustText',
        validators: ['required'],
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
      birthDate: {
        title: 'Date de naissance',
        type: 'CustDate',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      profession: {
        title: 'Profession',
        type: 'CustSelect',
        request: 'actors:professions',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      field: {
        title: 'Secteur activité',
        type: 'CustSelect',
        request: 'actors:fields',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      }
    },
    initEvents: function () {
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('gender', true);
          this.disable('id', true);
          this.disable('firstName', true);
          this.disable('lastName', true);
          this.disable('birthDate', true);
          this.disable('profession', true);
          this.disable('field', true);
        }
        else {
          this.disable('gender', false);
          this.disable('id', false);
          this.disable('firstName', false);
          this.disable('lastName', false);
          this.disable('birthDate', false);
          this.disable('profession', false);
          this.disable('field', false);
        }
      });
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.initEvents();
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
    }
  });
  mod.InsuredHgWg = app.common.CustForm.extend({
    template: _.template($('#loan-insured-hhwg-form')
      .html()),
    schema: {
      insuredHeight: {
        title: 'Taille en cm',
        type: 'CustNumber',
        unit: 'cm',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      insuredWeight: {
        title: 'Poids en kg',
        type: 'CustNumber',
        unit: 'kg',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      insuredSmoker: {
        title: 'Type de fumeur',
        type: 'CustSelect',
        data: 'loan:insured:smoking',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initEvents: function () {
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('insuredHeight', true);
          this.disable('insuredWeight', true);
          this.disable('insuredSmoker', true);
        }
        else {
          this.disable('insuredHeight', false);
          this.disable('insuredWeight', false);
          this.disable('insuredSmoker', false);
        }
      });
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.initEvents();
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
    }
  });
  mod.MedQuestionFormRow = app.common.CustForm.extend({
    template: _.template($('#loan-medquest-form-row')
      .html()),
    schema: {
      answerYes: {
        title: 'Answer Yes',
        type: 'CustCheckbox',
        disabler: {
          lockcontrols: true
        }
      },
      answerDetails: {
        title: 'Donnez les détails',
        type: 'CustText',
        disabler: {
          lockcontrols: true
        }
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initEvents: function () {
      if (this.model.get('lockcontrols')) {
        this.disable('answerDetails', true);
      }
      else {
        this.disable('answerDetails', !this.getValue('answerYes'));
      }
      this.on('answerYes:set', function () {
        this.disable('answerDetails', !this.getValue('answerYes'));
        this.commit();
      });
      this.on('answerDetails:set', function () {
        this.commit();
      });
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('answerYes', true);
          this.disable('answerDetails', true);
        }
        else {
          this.disable('answerYes', false);
          this.disable('answerDetails', !this.getValue(
            'answerYes'));
        }
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
  mod.MedQuestFormTable = Marionette.CompositeView.extend({
    template: '#loan-medquest-form-table',
    itemView: mod.MedQuestionFormRow,
    itemViewContainer: 'tbody'
  });
  mod.MedSelectFormRow = app.common.CustForm.extend({
    template: _.template($('#loan-medselect-form-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.medselDoc = new app.common.DocView({
        model: this.model.get('medselDoc')
      });
    },
    remove: function () {
      this.medselDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      var self = this;
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="print"]')
        .append(this.medselDoc.render()
          .el);
      if (this.model.get('generated')) {
        this.$('[data-actions="generate"]')
          .addClass('btn-danger');
        this.$('[data-actions="generate"]')
          .addClass('disabled');
        return;
      }
      if (this.model.get('apply') === 'O') {
        this.$('[data-actions="generate"]')
          .removeClass('btn-default');
        this.$('[data-actions="generate"]')
          .addClass('btn-danger');
        this.$('[data-actions="generate"]')
          .bind('click', function () {
            var fnct = self.model.get('print_service');
            switch (fnct) {
            case 'printMedicalReport':
              self.printMedicalReport();
              break;
            case 'printFinancialQuest':
              self.printFinancialQuest();
              break;
            case 'printDetailedQuest':
              self.printDetailedQuest();
              break;
            case 'printUrineTest':
              self.printUrineTest();
              break;
            case 'printBloodProfile':
              self.printBloodProfile();
              break;
            case 'printPSA':
              self.printPSA();
              break;
            case 'printECG':
              self.printECG();
              break;
            case 'printStressECG':
              self.printStressECG();
              break;
            case 'printChestFilm':
              self.printChestFilm();
              break;
            default:
            }
          });
      }
      else {
        this.$('[data-actions="generate"]')
          .addClass('btn-default');
        this.$('[data-actions="generate"]')
          .addClass('disabled');
      }
    },
    printMedicalReport: function () {
      var self = this;
      this.commit();
      var firstRec = this.model.collection.at(0);
      var providerid = firstRec.get('providerid');
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      if (providerid && providerid !== '') {
        app.request('loan:print:medicalreport', {
            quoteref: quoteref,
            providerid: providerid,
            doctestid: doctestid
          })
          .done(function (data) {
            var doc = self.model.get('medselDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
            self.$('[data-actions="generate"]')
              .addClass('disabled');
            self.model.set('generated', true);
          })
          .fail(function (q) {
            self.model.get('medselDoc')
              .set('error', q.responseText);
          });
      }
    },
    printFinancialQuest: function () {
      var self = this;
      this.commit();
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      app.request('loan:print:financialreport', {
          quoteref: quoteref,
          providerid: 0,
          doctestid: doctestid
        })
        .done(function (data) {
          var doc = self.model.get('medselDoc');
          doc.unset('error');
          doc.fromRequest(data.doc);
          self.$('[data-actions="generate"]')
            .addClass('disabled');
          self.model.set('generated', true);
        })
        .fail(function (q) {
          self.model.get('medselDoc')
            .set('error', q.responseText);
        });
    },
    printDetailedQuest: function () {
      var self = this;
      this.commit();
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      app.request('loan:print:detailedquest', {
          quoteref: quoteref,
          providerid: 0,
          doctestid: doctestid
        })
        .done(function (data) {
          var doc = self.model.get('medselDoc');
          doc.unset('error');
          doc.fromRequest(data.doc);
          self.$('[data-actions="generate"]')
            .addClass('disabled');
          self.model.set('generated', true);
        })
        .fail(function (q) {
          self.model.get('medselDoc')
            .set('error', q.responseText);
        });
    },
    printUrineTest: function () {
      var self = this;
      this.commit();
      var firstRec = this.model.collection.at(0);
      var providerid = firstRec.get('providerid');
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      if (providerid && providerid !== '') {
        app.request('loan:print:urinetest', {
            quoteref: quoteref,
            providerid: providerid,
            doctestid: doctestid
          })
          .done(function (data) {
            var doc = self.model.get('medselDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
            self.$('[data-actions="generate"]')
              .addClass('disabled');
            self.model.set('generated', true);
          })
          .fail(function (q) {
            self.model.get('medselDoc')
              .set('error', q.responseText);
          });
      }
    },
    printBloodProfile: function () {
      var self = this;
      this.commit();
      var firstRec = this.model.collection.at(0);
      var providerid = firstRec.get('providerid');
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      if (providerid && providerid !== '') {
        app.request('loan:print:bloodprofile', {
            quoteref: quoteref,
            providerid: providerid,
            doctestid: doctestid
          })
          .done(function (data) {
            var doc = self.model.get('medselDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
            self.$('[data-actions="generate"]')
              .addClass('disabled');
            self.model.set('generated', true);
          })
          .fail(function (q) {
            self.model.get('medselDoc')
              .set('error', q.responseText);
          });
      }
    },
    printPSA: function () {
      var self = this;
      this.commit();
      var firstRec = this.model.collection.at(0);
      var providerid = firstRec.get('providerid');
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      if (providerid && providerid !== '') {
        app.request('loan:print:psa', {
            quoteref: quoteref,
            providerid: providerid,
            doctestid: doctestid
          })
          .done(function (data) {
            var doc = self.model.get('medselDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
            self.$('[data-actions="generate"]')
              .addClass('disabled');
            self.model.set('generated', true);
          })
          .fail(function (q) {
            self.model.get('medselDoc')
              .set('error', q.responseText);
          });
      }
    },
    printECG: function () {
      var self = this;
      this.commit();
      var firstRec = this.model.collection.at(0);
      var providerid = firstRec.get('providerid');
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      if (providerid && providerid !== '') {
        app.request('loan:print:ecg', {
            quoteref: quoteref,
            providerid: providerid,
            doctestid: doctestid
          })
          .done(function (data) {
            var doc = self.model.get('medselDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
            self.$('[data-actions="generate"]')
              .addClass('disabled');
            self.model.set('generated', true);
          })
          .fail(function (q) {
            self.model.get('medselDoc')
              .set('error', q.responseText);
          });
      }
    },
    printStressECG: function () {
      var self = this;
      this.commit();
      var firstRec = this.model.collection.at(0);
      var providerid = firstRec.get('providerid');
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      if (providerid && providerid !== '') {
        app.request('loan:print:stressecg', {
            quoteref: quoteref,
            providerid: providerid,
            doctestid: doctestid
          })
          .done(function (data) {
            var doc = self.model.get('medselDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
            self.$('[data-actions="generate"]')
              .addClass('disabled');
            self.model.set('generated', true);
          })
          .fail(function (q) {
            self.model.get('medselDoc')
              .set('error', q.responseText);
          });
      }
    },
    printChestFilm: function () {
      var self = this;
      this.commit();
      var firstRec = this.model.collection.at(0);
      var providerid = firstRec.get('providerid');
      var quoteref = this.model.get('reference');
      var doctestid = this.model.get('testid');
      if (providerid && providerid !== '') {
        app.request('loan:print:chestfilm', {
            quoteref: quoteref,
            providerid: providerid,
            doctestid: doctestid
          })
          .done(function (data) {
            var doc = self.model.get('medselDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
            self.$('[data-actions="generate"]')
              .addClass('disabled');
            self.model.set('generated', true);
          })
          .fail(function (q) {
            self.model.get('medselDoc')
              .set('error', q.responseText);
          });
      }
    }
  });
  mod.MedSelectFormTable = Marionette.CompositeView.extend({
    template: '#loan-medselect-form-table',
    itemView: mod.MedSelectFormRow,
    itemViewContainer: 'tbody'
  });
  mod.DocMedicalSelection = app.common.CustForm.extend({
    template: _.template($('#loan-medselect-doctor')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
      provider: {
        title: 'Nom et adresse du medecin examinateur',
        type: 'CustSelect',
        request: 'loan:provider:doctor'
      }
    },
    initEvents: function () {
      this.on('provider:set', function () {
        this.commit();
      });
    },
    lockprovider: function (lock) {
      if (lock) {
        this.disable('provider', true);
      }
      else {
        this.disable('provider', false);
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.lockprovider(this.model.get('generated'));
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.LabMedicalSelection = app.common.CustForm.extend({
    template: _.template($('#loan-medselect-lab')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
      provider: {
        title: 'Nom et adresse du laboratoire d\'analyse',
        type: 'CustSelect',
        request: 'loan:provider:lab'
      }
    },
    initEvents: function () {
      this.on('provider:set', function () {
        this.commit();
      });
    },
    lockprovider: function (lock) {
      if (lock) {
        this.disable('provider', true);
      }
      else {
        this.disable('provider', false);
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.lockprovider(this.model.get('generated'));
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.CardioMedicalSelection = app.common.CustForm.extend({
    template: _.template($('#loan-medselect-cardio')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
      provider: {
        title: 'Nom et adresse du cardiologue',
        type: 'CustSelect',
        request: 'loan:provider:cardio'
      }
    },
    initEvents: function () {
      this.on('provider:set', function () {
        this.commit();
      });
    },
    lockprovider: function (lock) {
      if (lock) {
        this.disable('provider', true);
      }
      else {
        this.disable('provider', false);
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.lockprovider(this.model.get('generated'));
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.ImageMedicalSelection = app.common.CustForm.extend({
    template: _.template($('#loan-medselect-imagery')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
      provider: {
        title: 'Nom et adresse du centre d\'imagerie médicale',
        type: 'CustSelect',
        request: 'loan:provider:imagery'
      }
    },
    initEvents: function () {
      this.on('provider:set', function () {
        this.commit();
      });
    },
    lockprovider: function (lock) {
      if (lock) {
        this.disable('provider', true);
      }
      else {
        this.disable('provider', false);
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.lockprovider(this.model.get('generated'));
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.QuoteFormInsured = app.common.CustForm.extend({
    template: _.template($('#loan-quote-form-insured')
      .html()),
    schema: {
      insuredType: {
        title: 'Assuré',
        type: 'CustSelect',
        data: 'loan:insured:types',
        validators: ['required'],
        commitOnSet: true,
        disabler: {
          lockcontrols: true
        }
      }
    },
    initEvents: function () {
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('insuredType', true);
        }
        else {
          this.disable('insuredType', false);
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.initEvents();
    }
  });
  mod.QuoteConsultCredit = Marionette.ItemView.extend({
    template: '#loan-quote-consult-credit'
  });
  mod.QuoteConsultInsured = Marionette.ItemView.extend({
    template: '#loan-quote-consult-insured'
  });
  mod.QuoteConsultBeneficiary = Marionette.ItemView.extend({
    template: '#loan-quote-consult-beneficiary'
  });
  mod.QuoteConsultPremium = Marionette.ItemView.extend({
    template: '#loan-quote-consult-premium'
  });
  mod.QuoteConsultMessage = Marionette.ItemView.extend({
    template: '#loan-quote-consult-message'
  });
  mod.QuoteFormSubscriber = app.common.CustForm.extend({
    template: _.template($('#loan-quote-form-subscriber')
      .html()),
    schema: {
      subscriber: {
        title: 'Type du souscripteur',
        type: 'CustSelect',
        data: 'loan:subscriber:types',
        validators: ['required'],
        commitOnSet: true,
        disabler: {
          lockcontrols: true
        }
      }
    },
    initEvents: function () {
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('subscriber', true);
        }
        else {
          this.disable('subscriber', false);
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.initEvents();
    }
  });
  mod.QuotePremiumOperation = app.common.CustForm.extend({
    template: _.template($('#loan-quote-premium-operation')
      .html()),
    schema: {
      adjustContribution: {
        title: 'Mortalité',
        type: 'CustNumber',
        unit: '%',
        validators: ['required', {
          type: 'max',
          value: 20
        }]
      },
      adjustCommission: {
        title: 'Acquisition',
        type: 'CustNumber',
        unit: '%',
        validators: ['required', {
          type: 'max',
          value: 10
        }]
      }
    },
    initEvents: function () {
      var self = this;
      this.on('adjustContribution:set adjustCommission:set', function () {
        this.commit();
        app.request('loan:contribution:calculate', {
            quote: this.model
          })
          .done(function (data) {
            self.model.fromRequest(data.quote);
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
  mod.PolicyPremiumOperation = app.common.CustForm.extend({
    template: _.template($('#loan-policy-premium-operation')
      .html()),
    schema: {
      adjustContribution: {
        title: 'Mortalité',
        type: 'CustNumber',
        unit: '%',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      adjustCommission: {
        title: 'Acquisition',
        type: 'CustNumber',
        unit: '%',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      premium: {
        title: 'Cont. Nette',
        type: 'CustNumber',
        unit: 'DT',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      fees: {
        title: 'Frais',
        type: 'CustNumber',
        unit: 'DT',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      }
    },
    initEvents: function () {
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('adjustContribution', true);
          this.disable('adjustCommission', true);
          this.disable('premium', true);
          this.disable('fees', true);
        }
        else {
          this.disable('adjustContribution', false);
          this.disable('adjustCommission', false);
          this.disable('premium', false);
          this.disable('fees', false);
        }
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
  mod.ProjectConsultMessage = Marionette.ItemView.extend({
    template: '#loan-project-consult-message'
  });
  mod.ProjectSave = Marionette.Layout.extend({
    template: '#loan-project-save',
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
      app.request('loan:project:save', {
          quote: this.model
        })
        .done(function (data) {
          var validateLink = self.model.get('validateLink');
          quote.fromRequest(data.quote);
          validateLink.fromRequest(data.quote.validateLink);
          self.$('[data-actions="save"]')
            .addClass('btn-success');
          self.$('[data-actions="save"]')
            .addClass('disabled');
          self.validateLink.renderTitle();
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="save"]': 'save'
    }
  });
});

main.module('loan.search', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  mod.addInitializer(function () {
    var routes = {};
    routes.search = function () {
      app.execute('loan:search');
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('loan.search', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:search', function () {
      if (app.loan.current !== 'search') {
        app.loan.current = 'search';
        mod.controller = new mod.Controller();
        app.mainRegion.show(mod.controller.layout);
      }
    });
  });
});

main.module('loan.search', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.policies = new mod.Policies();
      this.layout = new mod.Layout();
    }
  });
});





main.module('loan.search', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['subsDateFrom', 'subsDateTo', 'effcDateFrom',
      'effcDateTo'
    ],
    defaults: {
      reference: null,
      clientname: null,
      clientid: null,
      insured: null
    }
  });
  mod.Policy = Backbone.Model.extend({
    /*
    numero: Contract or Quote Reference
    effectiveDate: Contract or Quote effective date
    insured: Life Insured name
    cliName: Client Name (subscriber)
    premium: Premium Raised Equal to 0 for Quote
    details: Link to Consultation Process page
    */
    defaults: function () {
      return {
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    },
    dateAttributes: ['effectiveDate']
  });
  mod.Policies = Backbone.Collection.extend({
    model: mod.Policy
  });
});

main.module('loan.search', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('loan:search:getData', function (data) {
      return app.common.post('/svc/loan/search/getData', {
        searchcriteria: data.searchcriteria.toRequest()
      });
    });
  });
});

main.module('loan.search', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#loan-search',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.SearchView());
    }
  });
  mod.SearchView = Marionette.Layout.extend({
    template: '#loan-search-view',
    regions: {
      error: '.tkf-error',
      criteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.criteria,
        parent: this
      }));
      this.results.show(new mod.SearchResults({
        collection: mod.controller.policies
      }));
    }
  });
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#loan-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      loanAmount: {
        title: 'Montant du prêt',
        type: 'CustNumber'
      },
      subsDateFrom: {
        title: 'De',
        type: 'CustDate'
      },
      subsDateTo: {
        title: 'A',
        type: 'CustDate'
      },
      effcDateFrom: {
        title: 'De',
        type: 'CustDate'
      },
      effcDateTo: {
        title: 'A',
        type: 'CustDate'
      },
      clientname: {
        title: 'Nom',
        type: 'CustText'
      },
      clientid: {
        title: 'CIN / RC',
        type: 'CustText'
      }
    },
    search: function () {
      var error = this.commit();
      if (!error) {
        app.request('loan:search:getData', {
            searchcriteria: this.model
          })
          .done(function (data) {
            mod.controller.policies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.policies.add(policy);
            });
          })
          .fail(function () {});
      }
      else {}
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#loan-search-result-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.consultlink = new app.common.LinkView({
        model: this.model.get('consultlink')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="consult"]')
        .append(this.consultlink.render()
          .el);
    }
  });
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#loan-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
});

main.module('loan.subscribe', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        subscribe: function () {
          app.execute('loan:subscribe:new');
        },
        'subscribe/id/:id': function (id) {
          app.execute('loan:subscribe:existing', id);
        },
        'subscribe/step/:step': function (step) {
          app.execute('loan:subscribe:step', parseInt(step));
        }
      }
    });
  });
});

main.module('loan.subscribe', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:subscribe:new', function () {
      app.loan.current = 'subscribe';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
      mod.router.navigate('subscribe/step/1', {
        trigger: true,
        replace: false
      });
    });
    app.commands.setHandler('loan:subscribe:existing', function (id) {
      app.loan.current = 'subscribe';
      mod.controller = new mod.Controller();
      mod.controller.container.reset();
      mod.controller.launch(id);
    });
    app.commands.setHandler('loan:subscribe:step', function (rank) {
      if (app.loan.current === 'subscribe') {
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



main.module('loan.subscribe', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#loan-subscribe',
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
    template: '#loan-subscribe-summary',
    regions: {
      insured: '.tkf-summary-insured',
      credit: '.tkf-summary-credit',
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
    renderInsured: function () {
      this.renderItem('insured');
    },
    renderCredit: function () {
      this.renderItem('credit');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderInsured();
      this.renderCredit();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:insured': 'renderInsured',
      'change:credit': 'renderCredit',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.Step1View = app.common.StepView.extend({
    template: '#loan-subscribe-step1',
    regions: {
      credit: '.tkf-credit',
      beneficiary: '.tkf-beneficiary',
      insured: '.tkf-insured'
    },
    onRender: function () {
      this.credit.show(new app.loan.CreditForm({
        model: mod.controller.container.get('credit')
      }));
      this.beneficiary.show(new app.loan.BeneficiaryForm({
        model: mod.controller.container.get('beneficiary')
      }));
      this.insured.show(new app.loan.InsuredForm({
        model: mod.controller.container.get('insured')
      }));
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#loan-subscribe-step2',
    regions: {
      insuredhgwg: '.tkf-insuredhgwg',
      medquestions: '.tkf-medquestions',
      medselections: '.tkf-medselections',
      medselectdoctor: '.tkf-medselectdoctor',
      doctortestlist: '.tkf-doctortestlist',
      medselectlab: '.tkf-medselectlab',
      labtestlist: '.tkf-labtestlist',
      medselectcardio: '.tkf-medselectcardio',
      cardiotestlist: '.tkf-cardiotestlist',
      medselectimagery: '.tkf-medselectimagery',
      imagerytestlist: '.tkf-imagerytestlist'
    },
    onRender: function () {
      var self = this;
      this.insuredhgwg.show(new app.loan.InsuredHgWg({
        model: mod.controller.container.get('insured')
      }));
      var quote = mod.controller.container.get('quote');
      var applyMedicalSelection = quote.get('applyMedicalSelection');
      if (!applyMedicalSelection) {
        this.medquestions.show(new app.loan.MedQuestFormTable({
          collection: mod.controller.container.get(
            'medquestions')
        }));
        this.$('.panel.panel-default.tkf-medselections')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-doctorpanel')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-labpanel')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-cardiopanel')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-imagerypanel')
          .addClass('hidden');
      }
      else {
        this.medselections.show(new app.loan.MedSelectFormTable({
          collection: mod.controller.container.get(
            'medselections')
        }));
        this.$('.panel-body.tkf-medquestions')
          .addClass('hidden');
        //DOCTOR FORM AND TEST LIST DISPLAY
        var doctortests = mod.controller.container.get('doctortests');
        if (doctortests.length !== 0) {
          this.medselectdoctor.show(new app.loan.DocMedicalSelection({
            model: mod.controller.container.get(
              'doctorprovider')
          }));
          this.doctortestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get(
              'doctortests')
          }));
          this.medselectdoctor.currentView.on('provider:set',
            function () {
              var doctortests = mod.controller.container.get(
                'doctortests');
              var providerid = self.medselectdoctor.currentView;
              providerid = providerid.getValue('provider');
              var firsttest = doctortests.at(0);
              firsttest.set({
                providerid: providerid
              });
              doctortests.trigger('commit');
            });
        }
        else {
          this.$('.panel.panel-default.tkf-doctorpanel')
            .addClass('hidden');
        }
        //LAB FORM AND TEST DISPLAY
        var labtests = mod.controller.container.get('labtests');
        if (labtests.length !== 0) {
          this.medselectlab.show(new app.loan.LabMedicalSelection({
            model: mod.controller.container.get('labprovider')
          }));
          this.labtestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get('labtests')
          }));
          this.medselectlab.currentView.on('provider:set', function () {
            var labtests = mod.controller.container.get(
              'labtests');
            var providerid = self.medselectlab.currentView;
            providerid = providerid.getValue('provider');
            var firsttest = labtests.at(0);
            firsttest.set({
              providerid: providerid
            });
            labtests.trigger('commit');
          });
        }
        else {
          this.$('.panel.panel-default.tkf-labpanel')
            .addClass('hidden');
        }
        //CARDIO FORM AND TEST DISPLAY
        var cardiotests = mod.controller.container.get('cardiotests');
        if (cardiotests.length !== 0) {
          this.medselectcardio.show(new app.loan.CardioMedicalSelection({
            model: mod.controller.container.get(
              'cardioprovider')
          }));
          this.cardiotestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get(
              'cardiotests')
          }));
          this.medselectcardio.currentView.on('provider:set',
            function () {
              var cardiotests = mod.controller.container.get(
                'cardiotests');
              var providerid = self.medselectcardio.currentView;
              providerid = providerid.getValue('provider');
              var firsttest = cardiotests.at(0);
              firsttest.set({
                providerid: providerid
              });
              cardiotests.trigger('commit');
            });
        }
        else {
          this.$('.panel.panel-default.tkf-cardiopanel')
            .addClass('hidden');
        }
        //MEDICAL IMAGERY FORM AND TEST DISPLAY
        var imagetests = mod.controller.container.get('imagetests');
        if (imagetests.length !== 0) {
          this.medselectimagery.show(new app.loan.ImageMedicalSelection({
            model: mod.controller.container.get('imageprovider')
          }));
          this.imagerytestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get(
              'imagetests')
          }));
          this.medselectimagery.currentView.on('provider:set',
            function () {
              var imagetests = mod.controller.container.get(
                'imagetests');
              var providerid = self.medselectimagery.currentView;
              providerid = providerid.getValue('provider');
              var firsttest = imagetests.at(0);
              firsttest.set({
                providerid: providerid
              });
              imagetests.trigger('commit');
            });
        }
        else {
          this.$('.panel.panel-default.tkf-imagerypanel')
            .addClass('hidden');
        }
      }
    },
    initialize: function () {
      var self = this;
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      var doctortests = mod.controller.container.get('doctortests');
      var labtests = mod.controller.container.get('labtests');
      var cardiotests = mod.controller.container.get('cardiotests');
      var imagetests = mod.controller.container.get('imagetests');
      var doctorprovider = mod.controller.container.get(
        'doctorprovider');
      var labprovider = mod.controller.container.get('labprovider');
      var cardioprovider = mod.controller.container.get(
        'cardioprovider');
      var imageprovider = mod.controller.container.get(
        'imageprovider');
      this.listenTo(doctortests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentdoctor = self.medselectdoctor.currentView;
          currentdoctor.disable('provider', true);
          quote.set('validated', true);
          doctorprovider.set('generated', true);
        }
      });
      this.listenTo(labtests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentlab = self.medselectlab.currentView;
          currentlab.disable('provider', true);
          quote.set('validated', true);
          labprovider.set('generated', true);
        }
      });
      this.listenTo(cardiotests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentcardio = self.medselectcardio.currentView;
          currentcardio.disable('provider', true);
          quote.set('validated', true);
          cardioprovider.set('generated', true);
        }
      });
      this.listenTo(imagetests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentimagery = self.medselectimagery.currentView;
          currentimagery.disable('provider', true);
          quote.set('validated', true);
          imageprovider.set('generated', true);
        }
      });
    }
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#loan-subscribe-step3',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      insuredType: '.tkf-insured-type',
      subscriber: '.tkf-subscriber'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.loan.QuoteFormSubscriber({
        model: mod.controller.container.get('quote')
      }));
    },
    renderInsuredType: function () {
      var self = this;
      this.insuredType.show(new app.loan.QuoteFormInsured({
        model: mod.controller.container.get('quote')
      }));
      this.insuredType.currentView.on('insuredType:set', function () {
        var currentInsuredType = self.insuredType.currentView;
        if (currentInsuredType.getValue('insuredType') ===
          'Assuré') {
          var currentSubscriber = self.subscriber.currentView;
          var insuredModel = mod.controller.container.get(
            'insured');
          currentSubscriber.model.set(insuredModel.attributes);
        }
      });
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonFormAndMap({
          model: mod.controller.container.get('person')
        }));
      }
      else if (quote.isSubscriberCompany()) {
        this.subscriber.show(new app.actors.CompanyFormAndMap({
          model: mod.controller.container.get('company')
        }));
      }
      else {
        this.subscriber.close();
      }
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
      this.renderInsuredType();
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
  mod.Step4View = app.common.StepView.extend({
    template: '#loan-subscribe-step4',
    regions: {
      subscriber: '.tkf-step4-subscriber',
      premium: '.tkf-step4-premium',
      premiumOperation: '.tkf-step4-premium-operation',
      message: '.tkf-step4-message',
      save: '.tkf-step4-save'
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: mod.controller.container.get('person')
        }));
      }
      else if (quote.isSubscriberCompany()) {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderPremium: function ()  {
      this.premium.show(new app.loan.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderPremiumOperation: function ()  {
      this.premiumOperation.show(new app.loan.QuotePremiumOperation({
        model: mod.controller.container.get('quote')
      }));
    },
    renderMessage: function () {
      this.message.show(new app.loan.ProjectConsultMessage({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new app.loan.ProjectSave({
        model: mod.controller.container.get('quote')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderPremiumOperation();
      this.renderMessage();
      this.renderSave();
    },
    initialize: function () {
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:premium', function () {
        this.renderPremium();
      });
    }
  });
});

main.module('loan.valid', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'contract/:id/valid': function (id) {
        app.execute('loan:valid', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('loan.valid', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:valid', function (id) {
      if (app.loan.current !== 'valid') {
        app.loan.current = 'valid';
        mod.controller = new mod.Controller();
        mod.controller.launch(id);
      }
    });
  });
});

main.module('loan.valid', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    launch: function (id) {
      var self = this;
      app.request('loan:policy:get', {
          id: id
        })
        .done(function (data) {
          self.container = new mod.Container();
          var policy = self.container.get('policy');
          policy.fromRequest(data.policy);
          policy.set('receiptDoc', new app.common.Doc({}));
          policy.get('receiptDoc')
            .fromRequest(data.policy.receiptDoc);
          policy.set('attestationDoc', new app.common.Doc({}));
          policy.get('attestationDoc')
            .fromRequest(data.policy.attestationDoc);
          var insured = self.container.get('insured');
          insured.fromRequest(data.insured);
          var medicalSelection = self.container.get(
            'medicalQuestions');
          var insuredComp = self.container.get('insuredComp');
          insuredComp.fromRequest(data.insured);
          medicalSelection.fromRequest(data.insured.medicalSelection);
          insuredComp.set('medicalSelection', medicalSelection);
          var loan = self.container.get('loan');
          loan.fromRequest(data.loan);
          var beneficiary = self.container.get('beneficiary');
          beneficiary.fromRequest(data.beneficiary);
          if (data.person) {
            self.container.get('person')
              .fromRequest(data.person);
          }
          if (data.company) {
            self.container.get('company')
              .fromRequest(data.company);
          }
          var subscriberType = self.container.get('subscriberType');
          subscriberType.fromRequest(data.subscribertype);
          var insuredSubscriber = self.container.get(
            'insuredSubscriber');
          insuredSubscriber.fromRequest(data.insuredsubscriber);
          var validationLocks = self.container.get(
            'validationLocks');
          validationLocks.fromRequest(data.validationLocks);
          self.layout = new mod.PolicyConsultView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    }
  });
});





main.module('loan.valid', function (mod, app, Backbone) {
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.loan.Quote(),
        insured: new app.loan.Insured(),
        loan: new app.loan.Credit(),
        beneficiary: new app.loan.Beneficiary(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        reports: new app.loan.Reports(),
        editInsured: new mod.EditModView(),
        editLoan: new mod.EditModView(),
        editBenef: new mod.EditModView(),
        editContrib: new mod.EditModView(),
        editInsuredComp: new mod.EditModView(),
        medicalQuestions: new app.loan.MedicalQuestions(),
        insuredComp: new app.loan.Insured(),
        editSubscriber: new mod.EditModView(),
        subscriberType: new mod.SubscriberType(),
        insuredSubscriber: new mod.InsuredSubscriber(),
        validationLocks: new mod.ValidationLocks(),
        updatedFields: new mod.UpdatedFields()
      };
    }
  });
  mod.EditModView = Backbone.Model.extend({});
  mod.SubscriberType = Backbone.Model.extend({});
  mod.InsuredSubscriber = Backbone.Model.extend({});
  mod.ValidationLock = Backbone.Model.extend({});
  mod.ValidationLocks = Backbone.Collection.extend({
    model: mod.ValidationLock
  });
  mod.UpdatedFields = Backbone.Model.extend({
    dateAttributes: ['birthDate', 'releaseDate', 'endDate']
  });
});



/*jslint browser:true */
main.module('loan.valid', function (mod, app, Backbone, Marionette, $, _) {
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#loan-consult',
    regions: {
      insured: '.tkf-insured',
      insuredEdit: '.tkf-insured-edit',
      insuredComp: '.tkf-insured-comp',
      loan: '.tkf-loan',
      loanEdit: '.tkf-loan-edit',
      beneficiary: '.tkf-beneficiary',
      beneficiaryEdit: '.tkf-beneficiary-edit',
      premium: '.tkf-premium',
      premiumEdit: '.tkf-premium-edit',
      subscriber: '.tkf-subscriber',
      subscriberEdit: '.tkf-subscriber-edit',
      policyValidate: '.tkf-policy-validate'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var insured = mod.controller.container.get('insured');
      var editInsured = mod.controller.container.get('editInsured');
      var loan = mod.controller.container.get('loan');
      var editLoan = mod.controller.container.get('editLoan');
      var beneficiary = mod.controller.container.get('beneficiary');
      var editBeneficiary = mod.controller.container.get('editBenef');
      var editContribution = mod.controller.container.get(
        'editContrib');
      var insuredComp = mod.controller.container.get('insuredComp');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      var editSubscriber = mod.controller.container.get(
        'editSubscriber');
      if (policy.get('userAdmin')) {
        this.$('.page-header h3')
          .append('Administration police N° ' + policy.get(
            'reference'));
        this.insured.show(new app.loan.InsuredForm({
          model: insured
        }));
        editInsured.set('modelName', 'insured');
        this.insuredEdit.show(new mod.EditView({
          model: editInsured
        }));
        this.$('.tkf-insured-comp')
          .addClass('hidden');
        this.insuredComp.show(new mod.InsuredComplementData({
          model: insuredComp
        }));
        this.loan.show(new app.loan.CreditForm({
          model: loan
        }));
        editLoan.set('modelName', 'loan');
        this.loanEdit.show(new mod.EditView({
          model: editLoan
        }));
        this.beneficiary.show(new app.loan.BeneficiaryForm({
          model: beneficiary
        }));
        editBeneficiary.set('modelName', 'beneficiary');
        this.beneficiaryEdit.show(new mod.EditView({
          model: editBeneficiary
        }));
        this.premium.show(new app.loan.PolicyPremiumOperation({
          model: policy
        }));
        editContribution.set('modelName', 'policy');
        this.premiumEdit.show(new mod.EditView({
          model: editContribution
        }));
        if (person) {
          editSubscriber.set('modelName', 'person');
          this.subscriberEdit.show(new mod.EditView({
            model: editSubscriber
          }));
          this.subscriber.show(new mod.SubscriberEditView({
            model: person
          }));
        }
        else if (company) {
          editSubscriber.set('modelName', 'company');
          this.subscriberEdit.show(new mod.EditView({
            model: editSubscriber
          }));
          this.subscriber.show(new mod.SubscriberEditView({
            model: company
          }));
        }
        this.policyValidate.show(new mod.PolicyValidAction({
          model: policy
        }));
      }
      else {
        this.$('.page-header h3')
          .append('Validation police N° ' + policy.get('reference'));
        this.insured.show(new app.loan.QuoteConsultInsured({
          model: insured
        }));
        this.$('.tkf-insured-edit')
          .addClass('hidden');
        this.loan.show(new app.loan.QuoteConsultCredit({
          model: loan
        }));
        this.$('.tkf-insured-comp')
          .addClass('hidden');
        this.$('.tkf-loan-edit')
          .addClass('hidden');
        this.beneficiary.show(new app.loan.QuoteConsultBeneficiary({
          model: beneficiary
        }));
        this.$('.tkf-beneficiary-edit')
          .addClass('hidden');
        this.premium.show(new app.loan.QuoteConsultPremium({
          model: policy
        }));
        this.$('.tkf-premium-edit')
          .addClass('hidden');
        if (person) {
          this.subscriber.show(new app.actors.PersonConsult({
            model: person
          }));
        }
        else if (company) {
          this.subscriber.show(new app.actors.CompanyConsult({
            model: company
          }));
        }
        this.$('.tkf-subscriber-edit')
          .addClass('hidden');
        this.policyValidate.show(new mod.PolicyValidView({
          model: policy
        }));
      }
    }
  });
  mod.InsuredComplementData = Marionette.Layout.extend({
    template: '#loan-insured-layout',
    regions: {
      insuredComp: '.tkf-insured-comp',
      medicalSelection: '.tkf-medical-selection',
      complEdit: '.tkf-insured-comp-edit'
    },
    onRender: function () {
      var insured = this.model;
      var medSelection = insured.get('medicalSelection');
      var editInsuredComp = mod.controller.container.get(
        'editInsuredComp');
      this.insuredComp.show(new app.loan.InsuredHgWg({
        model: insured
      }));
      this.medicalSelection.show(new app.loan.MedQuestFormTable({
        collection: medSelection
      }));
      editInsuredComp.set('modelName', 'insuredComp');
      this.complEdit.show(new mod.EditView({
        model: editInsuredComp
      }));
    }
  });
  mod.SubscriberEditView = Marionette.Layout.extend({
    template: '#loan-edit-subscriber',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      insuredType: '.tkf-insured-type',
      subscriber: '.tkf-subscriber'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.loan.QuoteFormSubscriber({
        model: mod.controller.container.get('subscriberType')
      }));
    },
    renderInsuredType: function () {
      var self = this;
      this.insuredType.show(new app.loan.QuoteFormInsured({
        model: mod.controller.container.get('insuredSubscriber')
      }));
      this.insuredType.currentView.on('insuredType:set', function () {
        var currentInsuredType = self.insuredType.currentView;
        if (currentInsuredType.getValue('insuredType') ===
          'Assuré') {
          var currentSubscriber = self.subscriber.currentView;
          var insuredModel = mod.controller.container.get(
            'insured');
          currentSubscriber.setValue(insuredModel.attributes);
        }
      });
    },
    renderSubscriber: function () {
      var policy = mod.controller.container.get('policy');
      if (policy.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonForm({
          model: mod.controller.container.get('person')
        }));
      }
      else if (policy.isSubscriberCompany()) {
        this.subscriber.show(new app.actors.CompanyForm({
          model: mod.controller.container.get('company')
        }));
      }
      else {
        this.subscriber.close();
      }
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
      this.renderInsuredType();
    },
    initialize: function () {
      var policy = mod.controller.container.get('policy');
      var subscriberType = mod.controller.container.get(
        'subscriberType');
      var editSubscriber = mod.controller.container.get(
        'editSubscriber');
      this.listenTo(subscriberType, 'change:subscriber', function () {
        policy.set('subscriber', subscriberType.get('subscriber'));
        policy.trigger('commit');
        if (subscriberType.get('subscriber') ===
          'Personne physique') {
          editSubscriber.set('modelName', 'person');
        }
        else {
          editSubscriber.set('modelName', 'company');
        }
        editSubscriber.trigger('commit');
      });
      this.listenTo(policy, 'change:subscriber', function () {
        if (policy.wasSubscriberPerson()) {
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
  mod.PolicyValidView = app.common.CustForm.extend({
    template: _.template($('#loan-policy-valid-view')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      if (this.model.get('isValid')) {
        this.$('[data-actions="validateContract"]')
          .removeClass('btn-danger');
        this.$('[data-actions="validateContract"]')
          .addClass('btn-success');
      }
    },
    validateContract: function () {
      var policy = mod.controller.container.get('policy');
      app.request('loan:contract:validate', {
          policy: policy
        })
        .done(function (data) {
          policy.get('receiptDoc')
            .fromRequest(data.receiptDoc);
          policy.get('attestationDoc')
            .fromRequest(data.attestationDoc);
          policy.set('validated', true);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="validateContract"]': 'validateContract'
    }
  });
  mod.PolicyValidAction = Marionette.Layout.extend({
    template: '#loan-policy-valid-actions',
    regions: {
      validationLocks: '.tkf-validation-locks',
      valicationActions: '.tkf-validation-action'
    },
    onRender: function () {
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      this.validationLocks.show(new mod.PolicyValidLocks({
        collection: validationLocks
      }));
      this.valicationActions.show(new mod.PolicyValidView({
        model: this.model
      }));
    }
  });
  mod.PolicyValidLock = app.common.CustForm.extend({
    template: _.template($('#loan-policy-valid-lock-row')
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
        this.$('[data-actions="lockValidation"]')
          .addClass('disabled');
      }
      else if (this.model.get('validated') === false) {
        this.$('[data-actions="unlockValidation"]')
          .addClass('disabled');
      }
    },
    lockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var currValid = this.model;
      var self = this;
      app.request('loan:admin:lockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function () {
          self.$('[data-actions="lockValidation"]')
            .addClass('disabled');
          self.$('[data-actions="unlockValidation"]')
            .removeClass('disabled');
        })
        .fail(app.fail);
    },
    unlockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var currValid = this.model;
      var self = this;
      app.request('loan:admin:unlockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function () {
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
  mod.PolicyValidLocks = Marionette.CompositeView.extend({
    template: '#loan-policy-valid-locks',
    itemView: mod.PolicyValidLock,
    itemViewContainer: 'tbody'
  });
  mod.EditView = Marionette.Layout.extend({
    template: '#loan-validat-layout',
    editModView: function () {
      var modelName = this.model.get('modelName');
      var selectedModel = mod.controller.container.get(modelName);
      selectedModel.set('lockcontrols', false);
      if (selectedModel.get('medicalSelection')) {
        _.each(selectedModel.get('medicalSelection')
          .models,
          function (item) {
            item.set('lockcontrols', false);
          });
      }
      if (modelName === 'person' || modelName === 'company') {
        var subscriberType = mod.controller.container.get(
          'subscriberType');
        subscriberType.set('lockcontrols', false);
        var insuredSubscriber = mod.controller.container.get(
          'insuredSubscriber');
        insuredSubscriber.set('lockcontrols', false);
      }
      this.$('[data-actions="saveModView"]')
        .removeClass('disabled');
      this.$('[data-actions="editModView"]')
        .addClass('disabled');
    },
    saveModView: function () {
      var self = this;
      var modelName = this.model.get('modelName');
      var selectedModel = mod.controller.container.get(modelName);
      var policy = mod.controller.container.get('policy');
      var updatedFields = mod.controller.container.get(
        'updatedFields');
      updatedFields.clear();
      var prevAtt = selectedModel.previousAttributes();
      var subscriberType = mod.controller.container.get(
        'subscriberType');
      var insuredSubscriber = mod.controller.container.get(
        'insuredSubscriber');
      selectedModel.trigger('commit');
      if (selectedModel.validationError) {
        return;
      }
      var actuAtt = selectedModel.attributes;
      var dataToSend = {};
      var actuVal;
      if (_.size(prevAtt) > 1) {
        for (var key in prevAtt) {
          if (key !== 'lockcontrols') {
            if (prevAtt.hasOwnProperty(key)) {
              var prevVal = prevAtt[key];
              if (actuAtt.hasOwnProperty(key)) {
                actuVal = actuAtt[key];
                if (prevVal !== actuVal) {
                  dataToSend[key] = actuVal;
                }
              }
            }
          }
        }
      }
      else {
        for (var actkey in actuAtt) {
          actuVal = actuAtt[actkey];
          if (actuVal !== null) {
            dataToSend[actkey] = actuVal;
          }
        }
      }
      updatedFields.set(dataToSend);
      var extraToSend;
      var sExtra;
      if (selectedModel.get('medicalSelection')) {
        extraToSend = [];
        _.each(selectedModel.get('medicalSelection')
          .models,
          function (item) {
            item.trigger('commit');
            if (item.validationError) {
              return;
            }
            sExtra = {};
            sExtra.id = item.get('id');
            sExtra.answerYes = item.get('answerYes');
            sExtra.answerDetails = item.get('answerDetails');
            extraToSend.push(sExtra);
            item.set('lockcontrols', true);
          });
      }
      if (modelName === 'person') {
        policy.set('subscriber', 'Personne physique');
        policy.set('updateAdmin', true);
        policy.set('subscriberType', subscriberType);
        policy.set('insuredType', insuredSubscriber.get('insuredType'));
        app.request('loan:subscriber:check', {
            quote: policy,
            subscriber: mod.controller.container.get('person')
          })
          .done(function (data) {
            if (data.forUpdate) {
              var dialog = new app.common.DiagView({
                el: '#modal'
              });
              var diagMod = new Backbone.Model();
              var msgBody = 'D\'autres données existent pour';
              msgBody += ' ce souscripteur. Continuer?';
              diagMod.set('dialogBody', msgBody);
              var upSubs = new app.common.DialogBody({
                model: diagMod
              });
              var msgtitle = 'Demande de confirmation !';
              dialog.setTitle(msgtitle);
              var diagbut = {};
              diagbut = {};
              diagbut.yes = {};
              diagbut.yes.label = 'Oui';
              diagbut.yes.className = 'col-sm-3 btn-success';
              diagbut.yes.className += ' pull-left';
              diagbut.yes.callback = function () {
                policy.set('fupdateSubs', true);
                app.request('loan:subscriber:set', {
                    quote: policy,
                    subscriber: mod.controller.container.get(
                      'person')
                  })
                  .done(function () {
                    selectedModel.set('lockcontrols', true);
                    subscriberType.set('lockcontrols', true);
                    insuredSubscriber.set('lockcontrols', true);
                    self.$('[data-actions="saveModView"]')
                      .addClass('disabled');
                    self.$('[data-actions="editModView"]')
                      .removeClass('disabled');
                  })
                  .fail(app.fail);
              };
              diagbut.no = {};
              diagbut.no.label = 'Non';
              diagbut.no.className = 'col-sm-3 btn-warning';
              diagbut.no.className += ' pull-right';
              diagbut.no.callback = function () {
                policy.set('fupdateSubs', false);
              };
              upSubs.closeButton = false;
              upSubs.buttons = diagbut;
              dialog.show(upSubs);
            }
            else {
              app.request('loan:subscriber:set', {
                  quote: policy,
                  subscriber: mod.controller.container.get(
                    'person')
                })
                .done(function () {
                  selectedModel.set('lockcontrols', true);
                  subscriberType.set('lockcontrols', true);
                  insuredSubscriber.set('lockcontrols', true);
                  self.$('[data-actions="saveModView"]')
                    .addClass('disabled');
                  self.$('[data-actions="editModView"]')
                    .removeClass('disabled');
                })
                .fail(app.fail);
            }
          })
          .fail(app.fail);
      }
      else if (modelName === 'company') {
        policy.set('subscriber', 'Personne morale');
        policy.set('updateAdmin', true);
        policy.set('subscriberType', subscriberType);
        policy.set('insuredType', insuredSubscriber.get('insuredType'));
        app.request('loan:subscriber:check', {
            quote: policy,
            subscriber: mod.controller.container.get('company')
          })
          .done(function (data) {
            if (data.forUpdate) {
              var dialog = new app.common.DiagView({
                el: '#modal'
              });
              var diagMod = new Backbone.Model();
              var msgBody = 'D\'autres données existent pour';
              msgBody += ' ce souscripteur. Continuer?';
              diagMod.set('dialogBody', msgBody);
              var upSubs = new app.common.DialogBody({
                model: diagMod
              });
              var msgtitle = 'Demande de confirmation !';
              dialog.setTitle(msgtitle);
              var diagbut = {};
              diagbut = {};
              diagbut.yes = {};
              diagbut.yes.label = 'Oui';
              diagbut.yes.className = 'col-sm-3 btn-success';
              diagbut.yes.className += ' pull-left';
              diagbut.yes.callback = function () {
                policy.set('fupdateSubs', true);
                app.request('loan:subscriber:set', {
                    quote: policy,
                    subscriber: mod.controller.container.get(
                      'company')
                  })
                  .done(function () {
                    selectedModel.set('lockcontrols', true);
                    subscriberType.set('lockcontrols', true);
                    insuredSubscriber.set('lockcontrols', true);
                    self.$('[data-actions="saveModView"]')
                      .addClass('disabled');
                    self.$('[data-actions="editModView"]')
                      .removeClass('disabled');
                  })
                  .fail(app.fail);
              };
              diagbut.no = {};
              diagbut.no.label = 'Non';
              diagbut.no.className = 'col-sm-3 btn-warning';
              diagbut.no.className += ' pull-right';
              diagbut.no.callback = function () {
                policy.set('fupdateSubs', false);
              };
              upSubs.closeButton = false;
              upSubs.buttons = diagbut;
              dialog.show(upSubs);
            }
            else {
              app.request('loan:subscriber:set', {
                  quote: policy,
                  subscriber: mod.controller.container.get(
                    'company')
                })
                .done(function () {
                  selectedModel.set('lockcontrols', true);
                  subscriberType.set('lockcontrols', true);
                  insuredSubscriber.set('lockcontrols', true);
                  self.$('[data-actions="saveModView"]')
                    .addClass('disabled');
                  self.$('[data-actions="editModView"]')
                    .removeClass('disabled');
                })
                .fail(app.fail);
            }
          })
          .fail(app.fail);
      }
      else {
        selectedModel.set('lockcontrols', true);
        this.$('[data-actions="saveModView"]')
          .addClass('disabled');
        this.$('[data-actions="editModView"]')
          .removeClass('disabled');
        app.request('loan:admin:edit', {
            policy: policy,
            editedmodel: modelName,
            newdata: updatedFields,
            extradata: extraToSend
          })
          .done()
          .fail(app.fail);
      }
    },
    displayInsured: function () {
      var vis = window.$('.tkf-insured-comp.hidden');
      if (vis.length >= 1) {
        vis.removeClass('hidden');
        this.$('[data-actions="displayInsured"]')
          .text('Fermer');
      }
      else {
        this.$('[data-actions="displayInsured"]')
          .text('Autres informations');
        vis = window.$('.tkf-insured-comp');
        vis.addClass('hidden');
      }
    },
    onRender: function () {
      this.$('[data-actions="saveModView"]')
        .addClass('disabled');
      if (this.model.get('modelName') === 'insured') {
        this.$('[data-actions="displayInsured"]')
          .removeClass('hidden');
      }
    },
    events: {
      'click a[data-actions="editModView"]': 'editModView',
      'click a[data-actions="saveModView"]': 'saveModView',
      'click a[data-actions="displayInsured"]': 'displayInsured'
    }
  });
});
