/*jslint browser:true */
main.module('auto.valid', function (mod, app, Backbone, Marionette, $, _) {
  mod.PolicyValidateView = Marionette.Layout.extend({
    template: '#auto-validate',
    regions: {
      policy: '.tkf-policy',
      contribution: '.tkf-contribution',
      validatePolicy: '.tkf-validate-policy',
      reports: '.tkf-reports'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      this.policy.show(new mod.FleetPolicyView({
        model: policy
      }));
      this.contribution.show(new mod.FleetContributionView({
        model: policy
      }));
      if (policy.get('userAdmin')) {
        this.validatePolicy.show(new mod.FleetValidateView({
          model: policy
        }));
      }
      else {
        this.validatePolicy.show(new mod.FleetValidateActionView({
          model: policy
        }));
      }
      this.reports.show(new mod.FleetVehicleValidate({
        collection: mod.controller.container.get('vehicles')
      }));
    }
  });
  mod.FleetPolicyView = Marionette.ItemView.extend({
    template: '#auto-fleet-policy-view'
  });
  mod.FleetContributionView = Marionette.ItemView.extend({
    template: '#auto-fleet-contribution-view',
    initialize: function () {
      var self = this;
      this.listenTo(this.model, 'change', function () {
        self.render();
      });
    }
  });
  mod.FleetValidateActionView = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-validate-action')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
    },
    validateFleet: function () {
      var policy = this.model;
      app.request('auto:fleet:validate', {
          policy: policy
        })
        .done(function (data) {
          policy.get('receiptDoc')
            .fromRequest(data.receiptDoc);
          policy.set('validated', true);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="validateFleet"]': 'validateFleet'
    }
  });
  mod.FleetVehicleValidateRow = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-vehicle-validate-row')
      .html()),
    schema: {
      attestationNumber: {
        title: 'N° d\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list',
        requestParam: 'reference'
      },
      bonus: {
        title: 'Classe BM',
        type: 'CustNumber'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      var policy = mod.controller.container.get('policy');
      if (policy.get('userAdmin')) {
        this.$('[data-fields="bonus"]')
          .removeClass('hidden');
        this.$('[data-actions="saveBonus"]')
          .removeClass('hidden');
      }
      else {
        this.$('[data-fields="bonus"]')
          .addClass('hidden');
        this.$('[data-actions="saveBonus"]')
          .addClass('hidden');
      }
    },
    details: function () {
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Détails du véhicule');
      var vehicleview = new mod.VehiculeModalView({
        model: this.model
      });
      dialog.show(vehicleview);
    },
    printAtt: function () {
      var vehicle = this.model;
      var policy = mod.controller.container.get('policy');
      var self = this;
      if (this.getValue('attestationNumber') !== '') {
        app.request('auto:fleet:printAttestation', {
            vehicle: vehicle,
            attestation: this.getValue('attestationNumber'),
            policy: policy
          })
          .done(function (data) {
            self.disable('attestationNumber', true);
            var pdfname = data.doc.docname;
            var doc = data.doc.pdfid;
            var lob = data.doc.lob;
            var link = document.createElement('a');
            link.download = pdfname;
            link.href = 'doc?doc=' + pdfname + '&lob=' + lob +
              '&id=' + doc;
            link.click();
          })
          .fail(app.fail);
      }
    },
    printVehicle: function () {
      var vehicle = this.model;
      var policy = mod.controller.container.get('policy');
      app.request('auto:fleet:printvehicle', {
          vehicle: vehicle,
          policy: policy
        })
        .done(function (data) {
          var pdfname = data.doc.docname;
          var doc = data.doc.pdfid;
          var lob = data.doc.lob;
          var link = document.createElement('a');
          link.download = pdfname;
          link.href = 'doc?doc=' + pdfname + '&lob=' + lob + '&id=' +
            doc;
          link.click();
        })
        .fail(app.fail);
    },
    saveBonus: function () {
      if (!_.isNumber(this.getValue('bonus'))) {
        return;
      }
      this.model.set('bonus', this.getValue('bonus'));
      var vehicle = this.model;
      var policy = mod.controller.container.get('policy');
      app.request('auto:admin:saveBonus', {
          policy: policy,
          vehicle: vehicle
        })
        .done(function (data) {
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="details"]': 'details',
      'click a[data-actions="printAtt"]': 'printAtt',
      'click a[data-actions="printVehicle"]': 'printVehicle',
      'click a[data-actions="saveBonus"]': 'saveBonus'
    }
  });
  mod.FleetVehicleValidate = Marionette.CompositeView.extend({
    template: '#auto-fleet-vehicle-validate-table',
    itemView: mod.FleetVehicleValidateRow,
    itemViewContainer: 'tbody'
  });
  mod.FleetConsultVehicle = Marionette.ItemView.extend({
    template: '#auto-fleet-consult-vehicle'
  });
  mod.VehiculeModalView = Marionette.Layout.extend({
    template: '#auto-vehicle-modal-view',
    regions: {
      vehicle: '.tkf-vehicle',
      coverages: '.tkf-coverages'
    },
    onRender: function () {
      this.vehicle.show(new mod.FleetConsultVehicle({
        model: this.model
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: this.model.get('coverages')
      }));
    }
  });
  mod.FleetValidLock = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-valid-lock-row')
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
        this.$('[data-actions="unlockValidation"]')
          .addClass('disabled');
      }
      else if (this.model.get('validated') === false) {
        this.$('[data-actions="lockValidation"]')
          .addClass('disabled');
      }
    },
    lockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:lockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function (data) {
          validationLocks.fromRequest(data.validationLocks);
          self.$('[data-actions="lockValidation"]')
            .addClass('disabled');
          self.$('[data-actions="unlockValidation"]')
            .removeClass('disabled');
        })
        .fail(app.fail);
    },
    unlockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:unlockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function (data) {
          validationLocks.fromRequest(data.validationLocks);
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
  mod.FleetValidationLocks = Marionette.CompositeView.extend({
    template: '#auto-fleet-valid-locks',
    itemView: mod.FleetValidLock,
    itemViewContainer: 'tbody'
  });
  mod.FleetDisc = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-discount-manage')
      .html()),
    schema: {
      usage: {
        title: 'Usage',
        type: 'CustSelect',
        request: 'auto:fleet:usages',
        validators: ['required'],
        requestParam: 'reference'
      },
      cover: {
        title: 'Garantie',
        type: 'CustSelect',
        request: 'auto:fleet:covers',
        validators: ['required'],
        requestParam: 'reference'
      },
      discount: {
        title: 'Réduction',
        type: 'CustNumber',
        validators: ['required'],
        unit: '%'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      var policy = mod.controller.container.get('policy');
      this.model.set('reference', policy.get('reference'));
    },
    saveDiscount: function () {
      var currUs = this.getValue('usage');
      var currCv = this.getValue('cover');
      var currDc = this.getValue('discount');
      if (currUs === null || currCv === null || currDc === null) {
        return false;
      }
      var policy = mod.controller.container.get('policy');
      var usage = this.$('[data-fields="usage"]')
        .text();
      usage = usage.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      var cover = this.$('[data-fields="cover"]')
        .text();
      cover = cover.replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      this.model.set('usageDesc', usage);
      this.model.set('coverDesc', cover);
      this.model.set('usage', this.getValue('usage'));
      this.model.set('cover', this.getValue('cover'));
      this.model.set('discount', this.getValue('discount'));
      this.model.set('reference', policy.get('reference'));
      var discounts = mod.controller.container.get('discounts');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:saveDiscount', {
          discount: currValid
        })
        .done(function (data) {
          discounts.add(self.model);
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
          self.model = new mod.Discount();
          self.setValue('usage', null);
          self.setValue('cover', null);
          self.setValue('discount', null);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="saveDiscount"]': 'saveDiscount'
    }
  });
  mod.FleetDiscountRow = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-discounts-row')
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
    cancelDiscount: function () {
      var discounts = mod.controller.container.get('discounts');
      var currValid = this.model;
      var self = this;
      app.request('auto:admin:cancelDiscount', {
          discount: currValid
        })
        .done(function (data) {
          discounts.remove(self.model);
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="cancelDiscount"]': 'cancelDiscount'
    }
  });
  mod.FleetDiscounts = Marionette.CompositeView.extend({
    template: '#auto-fleet-discounts',
    itemView: mod.FleetDiscountRow,
    itemViewContainer: 'tbody'
  });
  mod.FleetApplyBonus = app.common.CustForm.extend({
    template: _.template($('#auto-fleet-apply-bonus')
      .html()),
    schema: {
      customBonus: {
        title: 'Nouvelles classes BM',
        type: 'CustNumber'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="applyBonus"]')
        .removeClass('disabled');
      this.$('[data-actions="revertBonus"]')
        .addClass('disabled');
    },
    applyBonus: function () {
      this.trigger('commit');
      if (!_.isNumber(this.getValue('customBonus'))) {
        return;
      }
      var policy = mod.controller.container.get('policy');
      var currBonus = this.model;
      currBonus.set('customBonus', this.getValue('customBonus'));
      var self = this;
      app.request('auto:admin:applyBonus', {
          policy: policy,
          bonus: currBonus
        })
        .done(function (data) {
          self.$('[data-actions="applyBonus"]')
            .addClass('disabled');
          self.$('[data-actions="revertBonus"]')
            .removeClass('disabled');
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    revertBonus: function () {
      var policy = mod.controller.container.get('policy');
      var self = this;
      app.request('auto:admin:revertBonus', {
          policy: policy
        })
        .done(function (data) {
          self.setValue('customBonus', null);
          self.$('[data-actions="applyBonus"]')
            .removeClass('disabled');
          self.$('[data-actions="revertBonus"]')
            .addClass('disabled');
          var policy = mod.controller.container.get('policy');
          var vehicles = mod.controller.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="applyBonus"]': 'applyBonus',
      'click a[data-actions="revertBonus"]': 'revertBonus'
    }
  });
  mod.FleetValidateView = Marionette.Layout.extend({
    template: '#auto-fleet-validate-view',
    regions: {
      validateLocks: '.tkf-validate-locks',
      validateUpdateBonus: '.tkf-validate-bonus',
      validateDiscountAction: '.tkf-validate-discount-action',
      validateDiscount: '.tkf-validate-discount',
      validateActions: '.tkf-validate-actions'
    },
    onRender: function () {
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      var policy = mod.controller.container.get('policy');
      var discounts = mod.controller.container.get('discounts');
      var singleDisc = new mod.Discount();
      this.validateLocks.show(new mod.FleetValidationLocks({
        collection: validationLocks
      }));
      this.validateUpdateBonus.show(new mod.FleetApplyBonus({
        model: policy
      }));
      this.validateDiscountAction.show(new mod.FleetDisc({
        model: singleDisc
      }));
      this.validateDiscount.show(new mod.FleetDiscounts({
        collection: discounts
      }));
      this.validateActions.show(new mod.FleetValidateActionView({
        model: this.model
      }));
    }
  });
});
