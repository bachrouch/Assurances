main.module('assistance', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('assistance:ui:index');
        },
        index: function () {
          app.execute('assistance:ui:index');
        },
        error: function () {
          app.execute('assistance:ui:error');
        }
      }
    });
  });
});

main.module('assistance', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('assistance:ui:index', function () {
      app.assistance.current = 'index';
      app.mainRegion.show(new mod.IndexView());
    });
    app.commands.setHandler('assistance:ui:error', function () {
      app.assistance.current = 'error';
      app.mainRegion.show(new mod.ErrorView());
    });
    app.commands.setHandler('assistance:contract:kinds', function (cb) {
      cb([{
        id: 'Annuelle',
        text: 'Annuelle'
      }, {
        id: 'Temporaire',
        text: 'Temporaire'
      }]);
    });
    app.commands.setHandler('assistance:subscriber:types', function (cb) {
      cb([{
        id: 'Personne physique',
        text: 'Personne physique'
      }, {
        id: 'Personne morale',
        text: 'Personne morale'
      }]);
    });
  });
});







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

main.module('assistance', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    mod.zones = {};
    app.reqres.setHandler('assistance:travel:countries', function (
      criterium) {
      return app.common.post('/svc/assistance/travel/country', {
          criterium: criterium
        })
        .done(function (data) {
          var keys = _.pluck(data, 'id');
          var values = _.pluck(data, 'zone');
          var obj = _.object(keys, values);
          _.extend(mod.zones, obj);
        });
    });
    app.reqres.setHandler('assistance:travel:create', function (data) {
      return app.common.post('/svc/assistance/travel/create', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        countries: data.travel.get('country')
      });
    });
    app.reqres.setHandler('assistance:travel:update', function (data) {
      return app.common.post('/svc/assistance/travel/update', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        countries: data.travel.get('country')
      });
    });
    app.reqres.setHandler('assistance:traveler:set', function (data) {
      return app.common.post('/svc/assistance/traveler/set', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        travelers: data.travelers.toRequest()
      });
    });
    app.reqres.setHandler('assistance:personToPrevent:set', function (
      data) {
      return app.common.post('/svc/assistance/personToPrevent/set', {
        quote: data.quote.toRequest(),
        personToPrevent: data.personToPrevent.toRequest()
      });
    });
    app.reqres.setHandler('assistance:doctor:set', function (data) {
      return app.common.post('/svc/assistance/doctor/set', {
        quote: data.quote.toRequest(),
        doctor: data.doctor.toRequest()
      });
    });
    app.reqres.setHandler('assistance:subscriber:set', function (data) {
      return app.common.post('/svc/assistance/subscriber/set', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:quote', function (data) {
      return app.common.post('/svc/assistance/print/quote', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:contract:create', function (data) {
      return app.common.post('/svc/assistance/contract/create', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:cp', function (data) {
      return app.common.post('/svc/assistance/print/cp', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:attestation', function (
      data) {
      return app.common.post('/svc/assistance/print/attestation', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:receipt', function (data) {
      return app.common.post('/svc/assistance/print/receipt', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:policy:get', function (data) {
      return app.common.post('/svc/assistance/policy/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('assistance:traveler:get', function (
      criterium) {
      return app.common.post('/svc/assistance/traveler/get', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('assistance:pricings:get', function (data) {
      return app.common.post('/svc/assistance/pricings/get', data);
    });
    app.reqres.setHandler('assistance:pricings:set', function (data) {
      return app.common.post('/svc/assistance/pricings/set', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        pricing: data.pricing.toRequest()
      });
    });
  });
});

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

main.module('assistance.consult', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    var routes = {
      'consult/id/:id': function (id) {
        app.execute('assistance:consult', id);
      }
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('assistance.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('assistance:consult', function (id) {
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});

main.module('assistance.consult', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    launch: function (id) {
      var self = this;
      app.request('assistance:policy:get', {
          id: id
        })
        .done(function (data) {
          self.container = new mod.Container();
          var policy = self.container.get('policy');
          policy.fromRequest(data.policy);
          self.container.get('travel')
            .fromRequest(data.travel);
          self.container.get('coverages')
            .fromRequest(data.coverages);
          if (data.person) {
            self.container.get('person')
              .fromRequest(data.person);
          }
          if (data.company) {
            self.container.get('company')
              .fromRequest(data.company);
          }
          self.layout = new mod.PolicyConsultView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    }
  });
});





main.module('assistance.consult', function (mod, app, Backbone) {
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.assistance.Quote(),
        travel: new app.assistance.Travel(),
        coverages: new app.assistance.Coverages(),
        person: new app.actors.Person(),
        company: new app.actors.Company()
      };
    }
  });
});

main.module('assistance.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('consult:consult', function (id) {
      return app.common.post('/svc/consult/consult', {
        id: parseInt(id, 10)
      });
    });
  });
});

main.module('assistance.consult', function (mod, app, Backbone, Marionette) {
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#assistance-consult',
    regions: {
      title: '.tkf-title',
      header: '.tkf-header',
      travel: '.tkf-travel',
      coverages: '.tkf-coverages',
      premium: '.tkf-premium',
      subscriber: '.tkf-subscriber'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var travel = mod.controller.container.get('travel');
      var coverages = mod.controller.container.get('coverages');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      this.title.show(new mod.ConsultTitle({
        model: policy
      }));
      this.header.show(new app.assistance.QuoteConsultHeader({
        model: policy
      }));
      this.travel.show(new app.assistance.QuoteConsultTravel({
        model: travel
      }));
      this.coverages.show(new app.assistance.CoverageConsultTable({
        collection: coverages
      }));
      this.premium.show(new app.assistance.QuoteConsultPremium({
        model: policy
      }));
      if (person.id) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: person
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: company
        }));
      }
    }
  });
  mod.ConsultTitle = Marionette.ItemView.extend({
    template: '#assistance-consult-title'
  });
});

main.module('assistance.search', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  mod.addInitializer(function () {
    var routes = {};
    routes.search = function () {
      app.execute('assistance:search');
    };
    new Backbone.Router({
      routes: routes
    });
  });
});

main.module('assistance.search', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('assistance:search', function () {
      if (app.assistance.current !== 'search') {
        app.assistance.current = 'search';
        mod.controller = new mod.Controller();
        app.mainRegion.show(mod.controller.layout);
      }
    });
  });
});

main.module('assistance.search', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.policies = new mod.Policies();
      this.layout = new mod.Layout();
    }
  });
});





main.module('assistance.search', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['subsDateFrom', 'subsDateTo', 'effcDateFrom',
      'effcDateTo'
    ],
    defaults: {
      reference: null,
      country: null,
      clientname: null,
      clientid: null
    }
  });
  mod.PolicySummary = Backbone.Model.extend({
    /*
    numero: Contract or Quote Reference
    country; Pays
    effectiveDate: Contract or Quote effective date
    cliName: Client Name
    premium: Premium Raised Equal to 0 for Quote
    details: Link to Consultation Process page
    */
    dateAttributes: ['effectiveDate'],
    defaults: function () {
      return {
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    }
  });
  mod.Policies = Backbone.Collection.extend({
    model: mod.PolicySummary
  });
});

main.module('assistance.search', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('assistance:search:getData', function (data) {
      return app.common.post('/svc/assistance/search/getData', {
        searchcriteria: data.searchcriteria.toRequest()
      });
    });
  });
});

main.module('assistance.search', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#assistance-search',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.SearchView());
    }
  });
  mod.SearchView = Marionette.Layout.extend({
    template: '#assistance-search-view',
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
    template: _.template($('#assistance-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      country: {
        title: 'Pays',
        type: 'CustText'
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
        app.request('assistance:search:getData', {
            searchcriteria: this.model
          })
          .done(function (data) {
            mod.controller.policies.reset();
            _.each(data, function (item) {
              var policy = new mod.PolicySummary();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.policies.add(policy);
            });
          })
          .fail(app.fail);
      }
      else {
        app.alert(error);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#assistance-search-result-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.consultLink = new app.common.LinkView({
        model: this.model.get('consultlink')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="consult"]')
        .append(this.consultLink.render()
          .el);
    }
  });
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#assistance-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
});

main.module('assistance.subscribe', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        subscribe: function () {
          app.execute('assistance:subscribe:new');
        },
        'subscribe/id/:id': function (id) {
          app.execute('assistance:subscribe:existing', id);
        },
        'subscribe/step/:step': function (step) {
          app.execute('assistance:subscribe:step', parseInt(step));
        }
      }
    });
  });
});

main.module('assistance.subscribe', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('assistance:subscribe:new', function () {
      app.assistance.current = 'subscribe';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
      mod.router.navigate('subscribe/step/1', {
        trigger: true,
        replace: false
      });
    });
    app.commands.setHandler('assistance:subscribe:existing', function (
      id) {
      app.assistance.current = 'subscribe';
      mod.controller = new mod.Controller();
      mod.controller.container.reset();
      mod.controller.launch(id);
    });
    app.commands.setHandler('assistance:subscribe:step', function (rank) {
      if (app.assistance.current === 'subscribe') {
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

main.module('assistance.subscribe', function (mod, app, Backbone, Marionette, $,
  _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.container = new mod.Container();
      this.initSteps();
      this.layout = new mod.Layout();
    },
    launch: function (id) {
      var self = this;
      app.request('assistance:policy:get', {
          id: id
        })
        .done(function (data) {
          self.container.get('quote')
            .fromRequest(data.policy);
          self.container.get('travel')
            .fromRequest(data.travel);
          self.container.get('coverages')
            .fromRequest(data.coverages);
          if (data.person) {
            self.container.get('person')
              .fromRequest(data.person);
          }
          if (data.company) {
            self.container.get('company')
              .fromRequest(data.company);
          }
          if (data.traveler) {
            self.container.get('traveler')
              .fromRequest(data.traveler);
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
        label: 'Voyage et tarifs'
      });
      steps[0].on('check', function () {
        var travel = self.container.get('travel');
        travel.trigger('commit');
        if (!this.validationError && travel.validationError) {
          this.validationError = 'Voyage: ' + travel.validationError;
          return false;
        }
        var pricings = self.container.get('pricings');
        if (pricings.models.length === 0) {
          this.validationError =
            'Tarif: Veuillez selectionner un tarif';
          return false;
        }
        var pricingSelected = false;
        _.each(pricings.models, function (item) {
          if (item.get('selected')) {
            pricingSelected = true;
          }
        });
        if (!pricingSelected) {
          this.validationError =
            'Tarif: Veuillez selectionner un tarif';
          return false;
        }
      });
      steps[0].after = function (done, fail) {
        var quote = self.container.get('quote');
        var travel = self.container.get('travel');
        var travelers = self.container.get('travelers');
        var req;
        if (!quote.get('reference')) {
          req = 'assistance:travel:create';
        }
        else {
          req = 'assistance:travel:update';
        }
        app.request(req, {
            quote: quote,
            travel: travel
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            if (travelers.length !== travel.get('personsNumber')) {
              mod.controller.container.get('travelers')
                .reset(_.map(_.range(travel.get('personsNumber')),
                  function () {
                    return new app.assistance.Traveler();
                  }));
            }
            done();
          })
          .fail(fail);
      };
      steps[1] = new mod.Step({
        rank: 2,
        active: false,
        label: 'Dates et résumé'
      });
      steps[1].on('check', function () {
        var quote = self.container.get('quote');
        quote.trigger('commit');
        var validError = 'Certains champs ne sont pas valides';
        if (!this.validationError && quote.validationError) {
          this.validationError = validError;
          return false;
        }
      });
      steps[1].after = function (done, fail) {
        var quote = self.container.get('quote');
        var travel = self.container.get('travel');
        app.request('assistance:travel:update', {
            quote: quote,
            travel: travel
          })
          .done(done)
          .fail(fail);
      };
      steps[2] = new mod.Step({
        rank: 3,
        active: false,
        label: 'Voyageurs'
      });
      steps[2].on('check', function () {
        var quote = self.container.get('quote');
        var subscriber;
        var doctor = self.container.get('doctor');
        var personToPrevent = self.container.get(
          'personToPrevent');
        var travelers = self.container.get('travelers');
        var validError = 'Certains champs ne sont pas valides';
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else if (quote.isSubscriberCompany()) {
          subscriber = self.container.get('company');
        }
        if (subscriber) {
          subscriber.trigger('commit');
          if (!this.validationError && subscriber.validationError) {
            this.validationError = validError;
          }
        }
        if (doctor) {
          doctor.trigger('commit');
          if (!this.validationError && doctor.validationError) {
            this.validationError = validError;
          }
        }
        if (personToPrevent) {
          personToPrevent.trigger('commit');
          if (!this.validationError && personToPrevent.validationError) {
            this.validationError = validError;
          }
        }
        if (travelers) {
          travelers.trigger('commit');
          if (!this.validationError && travelers.validationError) {
            this.validationError = validError;
          }
        }
      });
      steps[2].after = function (done, fail) {
        var quote = self.container.get('quote');
        var subscriber;
        var doctor = self.container.get('doctor');
        var personToPrevent = self.container.get('personToPrevent');
        var travelers = self.container.get('travelers');
        var travel = self.container.get('travel');
        if (quote.isSubscriberPerson()) {
          subscriber = self.container.get('person');
        }
        else if (quote.isSubscriberCompany()) {
          subscriber = self.container.get('company');
        }
        var promises = [];
        if (subscriber) {
          promises.push(app.request('assistance:subscriber:set', {
            quote: quote,
            subscriber: subscriber
          }));
        }
        if (doctor) {
          promises.push(app.request('assistance:doctor:set', {
            quote: quote,
            doctor: doctor
          }));
        }
        if (personToPrevent) {
          promises.push(app.request(
            'assistance:personToPrevent:set', {
              quote: quote,
              personToPrevent: personToPrevent
            }));
        }
        $.when.apply(null, promises)
          .done(function () {
            app.request('assistance:traveler:set', {
                quote: quote,
                travel: travel,
                travelers: travelers
              })
              .done(function (data) {
                quote.fromRequest(data.quote);
                done();
              })
              .fail(fail);
          })
          .fail(fail);
      };
      steps[3] = new mod.Step({
        rank: 4,
        active: false,
        label: 'Police'
      });
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



main.module('assistance.subscribe', function (mod, app, Backbone, Marionette, $,
  _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#assistance-subscribe',
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
    template: '#assistance-subscribe-summary',
    regions: {
      travel: '.tkf-summary-travel',
      contract: '.tkf-summary-contract',
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
    renderContract: function () {
      this.renderItem('contract');
    },
    renderTravel: function () {
      this.renderItem('travel');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderContract();
      this.renderTravel();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:contract': 'renderContract',
      'change:travel': 'renderTravel',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.Step1View = app.common.StepView.extend({
    template: '#assistance-subscribe-step1',
    regions: {
      travel: '.tkf-travel',
      pricings: '.tkf-pricingList'
    },
    onRender: function () {
      this.travel.show(new app.assistance.TravelForm({
        model: mod.controller.container.get('travel')
      }));
      this.pricings.show(new app.assistance.PricingsView({
        collection: mod.controller.container.get('pricings')
      }));
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#assistance-subscribe-step2',
    regions: {
      quote: '.tkf-quote-form',
      travel: '.tkf-quote-travel',
      premium: '.tkf-quote-premium'
    },
    onRender: function () {
      this.quote.show(new app.assistance.QuoteForm({
        model: mod.controller.container.get('quote')
      }));
      this.travel.show(new app.assistance.QuoteConsultTravel({
        model: mod.controller.container.get('travel')
      }));
      this.premium.show(new app.assistance.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    }
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#assistance-subscribe-step3',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      subscriber: '.tkf-subscriber',
      travelers: '.tkf-travelers',
      personToPrevent: '.tkf-person-to-prevent',
      doctor: '.tkf-doctor'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.assistance.QuoteFormSubscriber({
        model: mod.controller.container.get('quote')
      }));
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
    renderTravelers: function () {
      this.travelers.show(new app.assistance.TravelerFormTable({
        collection: mod.controller.container.get('travelers')
      }));
    },
    renderPersonToprevent: function () {
      this.personToPrevent.show(new app.assistance.ThirdPartyPersonForm({
        model: mod.controller.container.get('personToPrevent')
      }));
    },
    renderDoctor: function () {
      this.doctor.show(new app.assistance.ThirdPartyPersonForm({
        model: mod.controller.container.get('doctor')
      }));
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
      this.renderTravelers();
      this.renderPersonToprevent();
      this.renderDoctor();
    },
    initialize: function () {
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:subscriber', function () {
        if (quote.wasSubscriberPerson()) {
          mod.controller.container.get('person')
            .trigger('flush');
        }
        else if (quote.wasSubscriberCompany()) {
          mod.controller.container.get('company')
            .trigger('flush');
        }
        this.renderSubscriber();
      });
    }
  });
  mod.Step4View = app.common.StepView.extend({
    template: '#assistance-subscribe-step4',
    regions: {
      subscriber: '.tkf-step5-subscriber',
      premium: '.tkf-step5-premium',
      message: '.tkf-step5-message',
      header: '.tkf-quote-header',
      travel: '.tkf-quote-travel',
      save: '.tkf-step5-save'
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
      this.premium.show(new app.assistance.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderMessage: function () {
      this.message.show(new app.assistance.ContractConsultMessage({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new app.assistance.ContractSave({
        model: mod.controller.container.get('quote')
      }));
    },
    renderHeader: function () {
      this.header.show(new app.assistance.QuoteConsultHeader({
        model: mod.controller.container.get('quote')
      }));
    },
    renderTravel: function () {
      this.travel.show(new app.assistance.QuoteConsultTravel({
        model: mod.controller.container.get('travel')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderMessage();
      this.renderSave();
      this.renderHeader();
      this.renderTravel();
    }
  });
});
