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
