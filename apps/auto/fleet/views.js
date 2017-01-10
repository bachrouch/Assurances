/*jslint browser:true */
main.module('auto.fleet', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-fleet',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content',
      summary: '.tkf-summary'
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.summary.show(new mod.SummaryFleetView({
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
  mod.SummaryFleetItemView = Marionette.View.extend({
    tagName: 'p',
    template: _.template(
      '<% _.each(a, function(e) { %> <%= e %></br> <% }); %>'),
    render: function () {
      var html = this.template(this.model.toJSON());
      this.$el.html(html);
      return this;
    }
  });
  mod.SummaryFleetView = Marionette.Layout.extend({
    template: '#auto-fleet-summary',
    regions: {
      contract: '.tkf-summary-contract',
      premium: '.tkf-summary-premium',
      subscriber: '.tkf-summary-subscriber'
    },
    renderItem: function (item) {
      this[item].show(new mod.SummaryFleetItemView({
        model: new Backbone.Model({
          a: this.model.get(item)
        })
      }));
    },
    renderContract: function () {
      this.renderItem('contract');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderContract();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:contract': 'renderContract',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.Step1View = app.common.StepView.extend({
    template: '#auto-fleet-step1',
    regions: {
      vehicleList: '.tkf-vehicle-list',
      fleetImport: '.tkf-fleet-import',
      newVehicle: '.tkf-new-vehicle',
      vehicleCovers: '.tkf-vehicle-covers'
    },
    onRender: function () {
      this.vehicleList.show(new mod.VehicleListTable({
        collection: mod.controller.container.get('vehicles')
      }));
      this.fleetImport.show(new mod.FleetImportView({
        model: mod.controller.container.get('quote')
      }));
      this.newVehicle.show(new mod.VehicleFleetForm({
        model: new app.auto.Vehicle()
      }));
      this.vehicleCovers.show(new app.auto.CoverageFormTable({
        collection: mod.controller.container.get('coverages')
      }));
    }
  });
  mod.VehicleFleetForm = app.common.CustForm.extend({
    template: _.template($('#auto-new-vehicle-form')
      .html()),
    schema: {
      number: {
        title: 'N°',
        type: 'CustNumber'
      },
      usage: {
        title: 'Usage',
        type: 'CustSelect',
        validators: ['required'],
        minInput: 1,
        request: 'auto:vehicle:usages'
      },
      registrationNumber: {
        title: 'Immat.',
        type: 'CustText',
        validators: ['required']
      },
      vin: {
        title: 'N° Chassis',
        type: 'CustText',
        validators: ['required']
      },
      power: {
        title: 'Puissance',
        type: 'CustNumber',
        validators: ['required']
      },
      placesNumber: {
        title: 'Nb. Places',
        type: 'CustNumber',
        validators: ['required']
      },
      issueDate: {
        title: 'Date PMC',
        type: 'CustDate',
        validators: ['required']
      },
      totalWeight: {
        title: 'PTC',
        type: 'CustNumber',
        unit: 'Tonnes (PTC)'
      },
      payload: {
        title: 'CU',
        type: 'CustNumber',
        unit: 'Tonnes (CU)'
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
      newValue: {
        title: 'Val. à neuf',
        type: 'CustNumber',
        unit: 'DT (Neuf)'
      },
      updatedValue: {
        title: 'Val. Vénale',
        type: 'CustNumber',
        unit: 'DT (Vén)',
        validators: ['required']
      },
      companyName: {
        title: 'Raison sociale',
        type: 'CustSelect',
        request: 'auto:beneficiary:get',
      },
      beneficiaryClause: {
        title: 'Clause bénéficiaire',
        type: 'CustSelect',
        data: 'actors:beneficiary:clauses'
      }
    },
    addNewVehicle: function () {
      var self = this;
      this.$('.tkf-validation-msg')
        .addClass('hidden');
      var error = this.commit();
      var coverages = mod.controller.container.get('coverages');
      var vehicles = mod.controller.container.get('vehicles');
      var quote = mod.controller.container.get('quote');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      var usage = this.$('[data-fields="usage"]')
        .text();
      usage = usage.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      this.model.set('usageDesc', usage);
      var make = this.$('[data-fields="make"]')
        .text();
      var model = this.$('[data-fields="model"]')
        .text();
      make = make.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      model = model.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      make += ' ' + model;
      this.model.set('vehicleMake', make);
      if (!error) {
        app.request('auto:fleet:add', {
            quote: quote,
            vehicles: vehicles
          })
          .done(function (data) {
            vehicles.fromRequest(data.vehicles);
            coverages.reset();
            selVehicle.clear();
            self.$('[data-actions="saveVehicle"]')
              .removeClass('disabled');
            self.$('[data-actions="addNewVehicle"]')
              .addClass('disabled');
            self.disable('usage', false);
            self.setValue('usage', null);
            self.disable('vin', false);
            self.setValue('vin', null);
            self.disable('registrationNumber', false);
            self.setValue('registrationNumber', null);
            self.disable('issueDate', false);
            self.setValue('issueDate', null);
            self.disable('power', false);
            self.setValue('power', null);
            self.disable('placesNumber', false);
            self.setValue('placesNumber', null);
            self.disable('totalWeight', false);
            self.setValue('totalWeight', null);
            self.disable('payload', false);
            self.setValue('payload', null);
            self.disable('newValue', false);
            self.setValue('newValue', null);
            self.disable('updatedValue', false);
            self.setValue('updatedValue', null);
            self.disable('make', false);
            self.setValue('make', null);
            self.disable('model', false);
            self.setValue('model', null);
            self.disable('companyName', false);
            self.setValue('companyName', null);
            self.disable('beneficiaryClause', false);
            self.setValue('beneficiaryClause', null);
            self.setValue('number', null);
          })
          .fail(app.fail);
      }
    },
    saveVehicle: function () {
      var self = this;
      this.$('.tkf-validation-msg')
        .addClass('hidden');
      var error = this.commit();
      var quote = mod.controller.container.get('quote');
      var coverages = mod.controller.container.get('coverages');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      if (!error) {
        app.request('auto:fleet:save', {
            vehicle: this.model,
            quote: quote
          })
          .done(function (data) {
            selVehicle.clear();
            quote.fromRequest(data.quote);
            coverages.fromRequest(data.coverages);
            self.$('[data-actions="saveVehicle"]')
              .addClass('disabled');
            self.$('[data-actions="addNewVehicle"]')
              .removeClass('disabled');
            self.disable('usage', true);
            self.disable('vin', true);
            self.disable('registrationNumber', true);
            self.disable('issueDate', true);
            self.disable('power', true);
            self.disable('placesNumber', true);
            self.disable('totalWeight', true);
            self.disable('payload', true);
            self.disable('newValue', true);
            self.disable('updatedValue', true);
            self.disable('make', true);
            self.disable('model', true);
            self.disable('companyName', true);
            self.disable('beneficiaryClause', true);
          })
          .fail(function (data) {
            self.$('.tkf-validation-msg')
              .text(data.responseText);
            self.$('.tkf-validation-msg')
              .removeClass('hidden');
          });
      }
    },
    initEvents: function () {
      var self = this;
      var quote = mod.controller.container.get('quote');
      var coverages = mod.controller.container.get('coverages');
      this.on('make:change', function () {
        this.setValue('model', null);
      });
      this.$('[data-actions="addNewVehicle"]')
        .addClass('disabled');
      this.$('.tkf-validation-msg')
        .addClass('hidden');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      this.listenTo(selVehicle, 'change', function () {
        this.setValue(selVehicle.attributes);
        this.$('[data-actions="saveVehicle"]')
          .addClass('disabled');
        this.$('[data-actions="addNewVehicle"]')
          .removeClass('disabled');
        selVehicle.clear();
      });
      this.on('usage:change', function () {
        if (this.getValue('number')) {
          var vehicleDialog = mod.controller.container.get(
            'vehicleDialog');
          var diagText = 'Toutes les garanties seront';
          diagText += ' réinitialisées !';
          vehicleDialog.set('dialogText', diagText);
          var dialog = new app.common.DiagView({
            el: '#modal'
          });
          dialog.setTitle('Modifier l\'usage de ce véhicule?');
          var selVeh = new mod.VehicleDialogView({
            model: vehicleDialog
          });
          var diagbut = {};
          diagbut = {};
          diagbut.yes = {};
          diagbut.yes.label = 'Oui';
          diagbut.yes.className = 'col-sm-3 btn-success';
          diagbut.yes.className += ' pull-left';
          diagbut.yes.callback = function () {
            quote.set('resetCovers', true);
            self.commit();
            app.request('auto:fleet:save', {
                vehicle: self.model,
                quote: quote
              })
              .done(function (data) {
                quote.fromRequest(data.quote);
                coverages.fromRequest(data.coverages);
              })
              .fail(app.fail);
          };
          diagbut.no = {};
          diagbut.no.label = 'Non';
          diagbut.no.className = 'col-sm-3 btn-warning';
          diagbut.no.className += ' pull-right';
          diagbut.no.callback = function () {
            self.setValue('usage', self.model.get('usage'));
          };
          selVeh.closeButton = false;
          selVeh.buttons = diagbut;
          dialog.show(selVeh);
        }
      });
      var cSchema = 'registrationNumber:set vin:set issueDate:set';
      cSchema += ' power:set placesNumber:set totalWeight:set';
      cSchema += ' payload:set newValue:set updatedValue:set';
      cSchema += ' make:set model:set companyName:set';
      cSchema += ' beneficiaryClause:set';
      this.on(cSchema, function () {
        if (this.getValue('number')) {
          var inEditMode = quote.get('inEditMode');
          if (_.isUndefined(inEditMode)) {
            inEditMode = 0;
          }
          if (inEditMode === 0) {
            this.commit();
            var coverages = mod.controller.container.get(
              'coverages');
            app.request('auto:fleet:save', {
                vehicle: self.model,
                quote: quote
              })
              .done(function (data) {
                quote.fromRequest(data.quote);
                coverages.fromRequest(data.coverages);
              })
              .fail(app.fail);
          }
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.initEvents();
    },
    events: {
      'click a[data-actions="addNewVehicle"]': 'addNewVehicle',
      'click a[data-actions="saveVehicle"]': 'saveVehicle'
    }
  });
  mod.VehicleListRow = Marionette.ItemView.extend({
    template: '#auto-fleet-vehicle-row',
    tagName: 'tr',
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    editVehicle: function () {
      var quote = mod.controller.container.get('quote');
      var selVehicle = mod.controller.container.get('selectedvehicle');
      quote.set('inEditMode', 1);
      selVehicle.set(this.model.attributes);
      var coverages = mod.controller.container.get('coverages');
      coverages.reset();
      var veh = this.model;
      app.request('auto:fleet:getVehicle', {
          quote: quote,
          vehicle: veh,
          forEdit: true
        })
        .done(function (data) {
          coverages.fromRequest(data.coverages);
          quote.set('inEditMode', 0);
        })
        .fail(app.fail);
    },
    removeVehicle: function () {
      var self = this;
      var coverages = mod.controller.container.get('coverages');
      if (coverages.length !== 0) {
        return false;
      }
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Voulez vous vraiment supprimer ce véhicule?');
      var selVeh = new app.auto.QuoteConsultVehicle({
        model: this.model
      });
      var diagbut = {};
      diagbut = {};
      diagbut.yes = {};
      diagbut.yes.label = 'Oui';
      diagbut.yes.className = 'col-sm-3 btn-success pull-left';
      diagbut.yes.callback = function () {
        var quote = mod.controller.container.get('quote');
        var vehicles = mod.controller.container.get('vehicles');
        app.request('auto:fleet:remove', {
            vehicle: self.model,
            vehicles: vehicles,
            quote: quote
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            vehicles.fromRequest(data.vehicles);
          })
          .fail(app.fail);
      };
      diagbut.no = {};
      diagbut.no.label = 'Non';
      diagbut.no.className = 'col-sm-3 btn-warning pull-right';
      diagbut.no.callback = function () {};
      selVeh.buttons = diagbut;
      selVeh.closeButton = false;
      dialog.show(selVeh);
    },
    coverVehicle: function () {
      var currentRow = this.$el.closest('tr');
      if ($('.tkf-selected-covers')
        .length === 1) {
        $('.tkf-selected-covers')
          .slideUp(function () {
            $('.tkf-selected-covers')
              .parent()
              .remove();
            return false;
          });
      }
      else {
        var newRow = '<tr><td colspan="8" ';
        newRow += 'class="tkf-selected-covers">';
        newRow += '</td></tr>';
        $(newRow)
          .insertAfter(currentRow);
        var quote = mod.controller.container.get('quote');
        var veh = this.model;
        var self = this;
        var mgr = new app.common.TransitionView({
          el: $('.tkf-selected-covers')
        });
        app.request('auto:fleet:getVehicle', {
            quote: quote,
            vehicle: veh,
            forEdit: false
          })
          .done(function (data) {
            veh.get('coverages')
              .fromRequest(data.coverages);
            mgr.show(new app.auto.CoverageConsultTable({
              collection: self.model.get('coverages')
            }));
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="editVehicle"]': 'editVehicle',
      'click a[data-actions="removeVehicle"]': 'removeVehicle',
      'click a[data-actions="coverVehicle"]': 'coverVehicle'
    }
  });
  mod.VehicleListTable = Marionette.CompositeView.extend({
    template: '#auto-fleet-vehicle-table',
    itemView: mod.VehicleListRow,
    itemViewContainer: 'tbody'
  });
  mod.VehicleDialogView = Marionette.ItemView.extend({
    template: '#auto-fleet-vehicle-dialog'
  });
  mod.FleetImportView = Marionette.ItemView.extend({
    template: '#auto-fleet-import',
    importFleet: function () {},
    dowloadModel: function () {
      var link = document.createElement('a');
      link.download = 'modele.csv';
      link.href = 'fleet?doc=modele';
      link.click();
    },
    dowloadExp: function () {
      var link = document.createElement('a');
      link.download = 'flotte-doc.pdf';
      link.href = 'fleet?doc=explain';
      link.click();
    },
    events: {
      'click a[data-actions="importFleet"]': 'importFleet',
      'click a[data-actions="dowloadModel"]': 'dowloadModel',
      'click a[data-actions="dowloadExp"]': 'dowloadExp'
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#auto-fleet-step2',
    regions: {
      quote: '.tkf-quote-form',
      vehicles: '.tkf-vehicles'
    },
    onRender: function () {
      this.quote.show(new mod.FleetQuoteForm({
        model: mod.controller.container.get('quote')
      }));
      this.vehicles.show(new mod.FleetVehicleView({
        collection: mod.controller.container.get('vehicles')
      }));
    }
  });
  mod.FleetQuoteForm = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-quote-form')
      .html()),
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
      fleetTermDate: {
        title: 'Date d\'échéance',
        type: 'CustDate',
        validators: ['required', {
          type: 'min',
          field: 'effectiveDate'
        }]
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
    },
    recalculate: function () {
      var oldEffDate = this.model.get('effectiveDate');
      var oldTerDate = this.model.get('fleetTermDate');
      var error = this.commit();
      var quote = mod.controller.container.get('quote');
      var vehicles = mod.controller.container.get('vehicles');
      var self = this;
      if (!error) {
        app.request('auto:fleet:recalculate', {
            quote: quote,
            vehicles: vehicles
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            vehicles.reset();
            _.each(data.vehicles, function (item) {
              var veh = new app.auto.Vehicle();
              veh.fromRequest(item);
              var cov = veh.get('coverages');
              cov.fromRequest(item.coverages);
              vehicles.add(veh);
            });
          })
          .fail(function (data) {
            self.setValue('effectiveDate', oldEffDate);
            self.setValue('fleetTermDate', oldTerDate);
            app.fail(data);
          });
      }
    },
    exportFleet: function () {
      var error = this.commit();
      var oldEffDate = this.model.get('effectiveDate');
      var oldTerDate = this.model.get('fleetTermDate');
      var quote = mod.controller.container.get('quote');
      var vehicles = mod.controller.container.get('vehicles');
      var self = this;
      if (!error) {
        app.request('auto:fleet:exportFleet', {
            quote: quote,
            vehicles: vehicles
          })
          .done(function (data) {
            quote.fromRequest(data.quote);
            vehicles.reset();
            _.each(data.vehicles, function (item) {
              var veh = new app.auto.Vehicle();
              veh.fromRequest(item);
              var cov = veh.get('coverages');
              cov.fromRequest(item.coverages);
              vehicles.add(veh);
            });
            var pdfname = quote.get('reference');
            var link = document.createElement('a');
            link.download = pdfname;
            link.href = 'fleet?doc=' + pdfname;
            link.click();
          })
          .fail(function (data) {
            self.setValue('effectiveDate', oldEffDate);
            self.setValue('fleetTermDate', oldTerDate);
            app.fail(data);
          });
      }
    },
    events: {
      'click a[data-actions="recalculate"]': 'recalculate',
      'click a[data-actions="exportFleet"]': 'exportFleet'
    }
  });
  mod.FleetVehicleRow = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-view-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
    },
    showCovers: function () {
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Liste des garanties');
      var vehCoverages = new app.auto.CoverageConsultTable({
        collection: this.model.get('coverages')
      });
      dialog.show(vehCoverages);
    },
    events: {
      'click a[data-actions="covers"]': 'showCovers'
    }
  });
  mod.FleetVehicleView = Marionette.CompositeView.extend({
    template: '#auto-fleet-view-table',
    itemView: mod.FleetVehicleRow,
    itemViewContainer: 'tbody'
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#auto-fleet-step3',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      subscriber: '.tkf-subscriber'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.auto.QuoteFormSubscriber({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonForm({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyForm({
          model: mod.controller.container.get('company')
        }));
      }
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
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
  mod.FleetSave = Marionette.Layout.extend({
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
      app.request('auto:fleet:create', {
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
  mod.Step4View = app.common.StepView.extend({
    template: '#auto-subscribe-step5',
    regions: {
      subscriber: '.tkf-step5-subscriber',
      premium: '.tkf-step5-premium',
      message: '.tkf-step5-message',
      save: '.tkf-step5-save'
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderPremium: function ()  {
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new mod.FleetSave({
        model: mod.controller.container.get('quote')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderSave();
    }
  });
});
