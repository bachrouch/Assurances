main.module('assistance', function (mod, app, Backbone, Marionette, $, _) {
  mod.IndexView = Marionette.ItemView.extend({
    template: '#assistance-index'
  });
  mod.ErrorView = Marionette.ItemView.extend({
    template: '#assistance-error'
  });
  mod.TravelForm = app.common.CustForm.extend({
    template: _.template($('#assistance-travel-form')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    schema: {
      country: {
        title: 'Pays de destination',
        type: 'CustSelect',
        validators: ['required'],
        multiple: true,
        request: 'assistance:travel:countries'
      },
      type: {
        title: 'Nature du voyage',
        type: 'CustSelect',
        data: 'common:travelTypes',
        validators: ['required']
      },
      personsNumber: {
        title: 'Nombre de voyageurs',
        type: 'CustNumber',
        validators: ['required']
      }
    },
    initEvents: function () {
      this.on('country:set', function () {
        var country = this.getValue('country');
        if (country.length === 0) {
          this.model.set('zone', null);
          return;
        }
        var checkZone;
        _.each(country, function (item) {
          if (mod.zones[item] === 2) {
            checkZone = 2;
          }
        });
        if (checkZone === 2) {
          this.model.set({
            'country': country,
            'zone': 2
          });
        }
        else {
          this.model.set({
            'country': country,
            'zone': 1
          });
        }
      });
      this.on('type:set', function () {
        var type = this.getValue('type');
        var typeDes = this.$('[data-fields="type"]')
          .text();
        typeDes = typeDes.replace(/(\r\n|\n|\r)/gm, '')
          .trim();
        if (type === this.model.getIndividualTypeValue()) {
          this.setValue('personsNumber', 1);
          this.model.set({
            'type': type,
            'typeDes': typeDes,
            'personsNumber': 1
          });
          this.disable('personsNumber', true);
        }
        else if (type === this.model.getCoupleTypeValue()) {
          this.setValue('personsNumber', 2);
          this.model.set({
            'type': type,
            'typeDes': typeDes,
            'personsNumber': 2
          });
          this.disable('personsNumber', true);
        }
        else {
          this.setValue('personsNumber', null);
          this.model.set({
            'type': type,
            'typeDes': typeDes,
            'personsNumber': null
          });
          this.disable('personsNumber', false);
        }
      });
      this.on('personsNumber:set', function () {
        this.model.set('personsNumber', this.getValue(
          'personsNumber'));
      });
      this.listenTo(this.model, 'change', function () {
        var zone = this.model.get('zone');
        var personsNumber = this.model.get('personsNumber');
        var type = this.model.get('type');
        var pricings = app.assistance.subscribe.controller.container
          .get('pricings');
        if (zone && personsNumber && type) {
          if (zone !== null && personsNumber !== null && type !==
            null) {
            app.request('assistance:pricings:get', {
                data: this.model
              })
              .done(function (data) {
                pricings.fromRequest(data.pricings);
              })
              .fail(app.fail);
          }
          else {
            pricings.reset();
          }
        }
        else {
          pricings.reset();
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.initEvents();
      this.disable('personsNumber', this.model.getNumberDisabled());
    }
  });
  mod.PricingsRow = Marionette.ItemView.extend({
    template: '#assistance-pricings-row',
    tagName: 'tr',
    selectPricing: function () {
      var pricings = app.assistance.subscribe.controller.container.get(
        'pricings');
      var quote = app.assistance.subscribe.controller.container.get(
        'quote');
      var travel = app.assistance.subscribe.controller.container.get(
        'travel');
      app.assistance.subscribe.controller.container.set('pricing',
        this.model);
      _.each(pricings.models, function (item) {
        item.set('selected', false);
      });
      this.model.set('selected', true);
      app.request('assistance:pricings:set', {
          quote: quote,
          travel: travel,
          pricing: this.model
        })
        .done(function (data) {
          quote.fromRequest(data.quote);
        })
        .fail(app.fail);
    },
    initialize: function () {
      var selected = this.model.get('selected');
      if (selected) {
        var currentRow = this.$el.closest('tr');
        currentRow.addClass('bg-success');
      }
      this.listenTo(this.model, 'change', function () {
        var currentRow = this.$el.closest('tr');
        var selected = this.model.get('selected');
        if (selected) {
          currentRow.addClass('bg-success');
        }
        else {
          currentRow.removeClass('bg-success');
        }
      });
    },
    events: {
      'click a[data-actions="selectPricing"]': 'selectPricing'
    }
  });
  mod.PricingsView = Marionette.CompositeView.extend({
    template: '#assistance-pricings-view',
    itemView: mod.PricingsRow,
    itemViewContainer: 'tbody'
  });
  mod.QuoteForm = app.common.CustForm.extend({
    template: _.template($('#assistance-quote-form')
      .html()),
    schema: {
      kind: {
        title: 'Nature du contrat',
        type: 'CustSelect',
        data: 'assistance:contract:kinds',
        commitOnSet: true,
        validators: ['required']
      },
      effectiveDate: {
        title: 'Date d\'effet',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          value: moment()
            .startOf('day')
            .add(1, 'd')
            .toDate()
        }]
      },
      endDate: {
        title: 'Date de fin',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          field: 'effectiveDate'
        }, {
          type: 'max',
          field: 'maxEndDate'
        }]
      }
    },
    initEvents: function () {
      this.on('effectiveDate:set', function () {
        var error = this.commit();
        if (!error) {
          var maxPeriod = this.model.get('maxPeriod');
          var tabMax = maxPeriod.split('~');
          var newEndate = moment(this.model.get('effectiveDate'))
            .add(tabMax[0], tabMax[1]);
          newEndate = moment(newEndate)
            .add(-1, 'days')
            .toDate();
          this.setValue('endDate', newEndate);
          this.model.set('endDate', newEndate);
          this.model.set('maxEndDate', newEndate);
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.disable('kind', true);
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.QuoteConsultHeader = Marionette.ItemView.extend({
    template: '#assistance-quote-consult-header',
  });
  mod.QuoteConsultTravel = Marionette.ItemView.extend({
    template: '#assistance-quote-consult-travel',
    templateHelpers: {
      typeName: function () {
        var type = this.type;
        var name;
        _.each(main.common.enums.travelTypes, function (item) {
          if (item.id === type) {
            name = item.text;
          }
        });
        return name;
      },
      countriesDisplay: function () {
        var retCode = '<ul class="summary-list">';
        _.each(this.country, function (item) {
          retCode += '<li>' + item + '</li>';
        });
        retCode += '</ul>';
        return retCode;
      }
    }
  });
  mod.CoverageConsultRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#assistance-coverage-consult-row'
  });
  mod.CoverageConsultTable = Marionette.CompositeView.extend({
    template: '#assistance-coverage-consult-table',
    itemView: mod.CoverageConsultRow,
    itemViewContainer: 'tbody'
  });
  mod.QuoteConsultPremium = Marionette.ItemView.extend({
    template: '#assistance-quote-consult-premium',
    templateHelpers: {
      totalPremium: function () {
        return this.premium + this.fees + this.taxes + this.stampFGA;
      }
    }
  });
  mod.QuoteConsultMessage = Marionette.ItemView.extend({
    template: '#assistance-quote-consult-message'
  });
  mod.QuoteSave = app.common.CustForm.extend({
    template: _.template($('#assistance-quote-save')
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
        data: 'assistance:subscriber:types',
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
        app.request('assistance:print:quote', {
            quote: this.model
          })
          .done(function (data) {
            var doc = self.model.get('quoteDoc');
            doc.unset('error');
            doc.fromRequest(data.doc);
          })
          .fail(function (q, status, error) {
            self.model.get('quoteDoc')
              .set('error', error);
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
  mod.TravelerFormRow = app.common.CustForm.extend({
    template: _.template($('#assistance-traveler-form-row')
      .html()),
    schema: {
      firstName: {
        title: 'Prénom',
        type: 'CustText',
        validators: ['required']
      },
      lastName: {
        title: 'Nom',
        type: 'CustText',
        validators: ['required']
      },
      birthDate: {
        title: 'Date de naissance',
        type: 'CustDate',
        validators: ['required']
      },
      passportId: {
        title: 'N° de Passport',
        type: 'CustText',
        validators: ['required']
      },
      phone: {
        title: 'Téléphone mobile',
        type: 'CustText',
        dataType: 'tel',
        validators: ['required']
      }
    }
  });
  mod.TravelerFormTable = Marionette.CompositeView.extend({
    template: '#assistance-traveler-form-table',
    itemView: mod.TravelerFormRow,
    itemViewContainer: 'tbody',
    commit: function () {
      delete this.collection.validationError;
      var error;
      var err;
      _.each(this.children._views, function (child) {
        err = child.commit();
        if (err) {
          error = err;
        }
      });
      if (error) {
        this.collection.validationError = 'Item Error: ' + error;
      }
      return error;
    },
    initialize: function () {
      Marionette.CompositeView.prototype.initialize.apply(this,
        arguments);
      this.listenTo(this.collection, 'commit', function () {
        this.commit();
      });
    }
  });
  mod.ThirdPartyPersonForm = app.common.CustForm.extend({
    template: _.template($('#assistance-third-party-person-form')
      .html()),
    schema: {
      name: {
        title: 'Nom',
        type: 'CustText'
      },
      phone: {
        title: 'Téléphone mobile',
        type: 'CustText',
        dataType: 'tel'
      },
      address: {
        title: 'Adresse',
        type: 'CustText'
      }
    }
  });
  mod.QuoteFormSubscriber = app.common.CustForm.extend({
    template: _.template($('#assistance-quote-form-subscriber')
      .html()),
    schema: {
      subscriber: {
        title: 'Type du souscripteur',
        type: 'CustSelect',
        data: 'assistance:subscriber:types',
        validators: ['required'],
        commitOnSet: true
      }
    }
  });
  mod.ContractConsultMessage = Marionette.ItemView.extend({
    template: '#assistance-contract-consult-message'
  });
  mod.ContractSave = Marionette.Layout.extend({
    template: '#assistance-contract-save',
    regions: {
      cp: '.tkf-print-cp',
      receipt: '.tkf-print-receipt'
    },
    onRender: function () {
      this.cp.show(new app.common.DocView({
        model: this.model.get('cpDoc')
      }));
      this.receipt.show(new app.common.DocView({
        model: this.model.get('receiptDoc')
      }));
    },
    save: function () {
      var self = this;
      var docs = {};
      app.request('assistance:contract:create', {
          quote: this.model
        })
        .done(function (data) {
          self.model.fromRequest(data.quote);
          docs = data.docs;
          var doccp = self.model.get('cpDoc');
          doccp.unset('error');
          doccp.fromRequest(docs.cpdoc);
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(docs.rcdoc);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="save"]': 'save'
    }
  });
});
