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
