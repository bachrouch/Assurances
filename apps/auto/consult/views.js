main.module('auto.consult', function (mod, app, Backbone, Marionette, $, _) {
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#auto-consult',
    regions: {
      header: '.tkf-header',
      vehicle: '.tkf-vehicle',
      coverages: '.tkf-coverages',
      premium: '.tkf-premium',
      subscriber: '.tkf-subscriber',
      payment: '.tkf-payment',
      paymentList: '.tkf-payment-list',
      actionsQuote: '.tkf-actions-quote',
      actionsPolicy: '.tkf-actions-policy',
      message: '.tkf-message'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var vehicle = mod.controller.container.get('vehicle');
      var coverages = mod.controller.container.get('coverages');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      var settlement = mod.controller.container.get('settlement');
      var settlements = mod.controller.container.get('settlements');
      var ref = policy.get('reference');
      policy.set('remainingAmont', policy.get('totalContribution'));
      this.listenTo(policy, 'change:validated', function () {
        var pol = mod.controller.container.get('policy');
        if (pol.get('validated')) {
          this.$('.tkf-payment')
            .addClass('hidden');
          this.$('[data-actions="erase"]')
            .addClass('hidden');
        }
      });
      this.header.show(new app.auto.QuoteConsultHeader({
        model: policy
      }));
      this.vehicle.show(new app.auto.QuoteConsultVehicle({
        model: vehicle
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: new app.auto.Coverages(coverages.filter(
          function (c) {
            return c.get('subscribed');
          }))
      }));
      this.premium.show(new app.auto.QuoteConsultPremium({
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
      if (policy.get('isquote')) {
        this.$('.page-header.tkf-consult-title h3')
          .append(' Devis N° ' + ref);
        this.actionsQuote.show(new mod.ActionsQuoteConsult({
          model: policy
        }));
        this.$('.list-group-item.tkf-actions-policy')
          .addClass('hidden');
        this.$('.tkf-payment')
          .addClass('hidden');
        this.$('.list-group-item.tkf-payment-list')
          .addClass('hidden');
      }
      else {
        this.$('.list-group-item.tkf-actions-quote')
          .addClass('hidden');
        this.$('.page-header.tkf-consult-title h3')
          .append(' Police N° ' + ref);
        if (policy.get('validated')) {
          this.actionsPolicy.show(new mod.ActionsPolicyConsult({
            model: policy
          }));
          if (settlements.length !== 0) {
            this.paymentList.show(new mod.Payments({
              collection: settlements
            }));
          }
          else {
            this.$('.list-group-item.tkf-payment-list')
              .addClass('hidden');
          }
        }
        else {
          this.actionsPolicy.show(new mod.ActionsValidate({
            model: policy
          }));
          this.payment.show(new mod.Payment({
            model: settlement
          }));
          this.paymentList.show(new mod.Payments({
            collection: settlements
          }));
        }
      }
    }
  });
  mod.ActionsQuoteConsult = app.common.CustForm.extend({
    template: _.template($('#auto-consult-actions-quote')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.quoteDoc = new app.common.DocView({
        model: this.model.get('quoteDoc')
      });
      this.subscribeLink = new app.common.LinkView({
        model: this.model.get('subscribeLink')
      });
    },
    remove: function () {
      this.quoteDoc.remove();
      this.subscribeLink.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="print"]')
        .append(this.quoteDoc.render()
          .el);
      this.$('[data-actions="subscribe"]')
        .append(this.subscribeLink.render()
          .el);
    }
  });
  mod.ActionsPolicyConsult = app.common.CustForm.extend({
    template: _.template($('#auto-consult-actions-policy')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.cpDoc = new app.common.DocView({
        model: this.model.get('cpDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.cpDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="cpPrint"]')
        .append(this.cpDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      var doccp = this.model.get('cpDoc');
      var docat = this.model.get('attestationDoc');
      var docrc = this.model.get('receiptDoc');
      if (doccp.hasURL() && docrc.hasURL() && docat.hasURL()) {
        this.$('.row.tkf-regenerate')
          .addClass('hidden');
      }
      else {
        this.$('.row.tkf-regenerate')
          .removeClass('hidden');
      }
    },
    regenerate: function () {
      var self = this;
      var docs = {};
      var policy = mod.controller.container.get('policy');
      app.request('auto:contract:regenerate', {
          policy: policy
        })
        .done(function (data) {
          docs = data.docs;
          var doccp = self.model.get('cpDoc');
          doccp.unset('error');
          doccp.fromRequest(docs.cpdoc);
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(docs.rcdoc);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="regenerate"]': 'regenerate',
    }
  });
  mod.ActionsValidate = app.common.CustForm.extend({
    template: _.template($('#auto-consult-validate-policy')
      .html()),
    schema: {
      attestationNumber: {
        title: 'Numéro de l\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list',
        requestParam: 'reference'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.cpDoc = new app.common.DocView({
        model: this.model.get('cpDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.cpDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="cpPrint"]')
        .append(this.cpDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      this.$('.tkf-message-text')
        .addClass('hidden');
    },
    validateContract: function () {
      this.commit();
      this.$('.tkf-message-text')
        .addClass('hidden');
      var self = this;
      var docs = {};
      var settlements = mod.controller.container.get('settlements');
      var attestationNumber = this.model.get('attestationNumber');
      var policy = mod.controller.container.get('policy');
      app.request('auto:contract:validate', {
          policy: policy,
          settlements: settlements,
          attestationNumber: attestationNumber
        })
        .done(function (data) {
          policy.set('validated', true);
          docs = data.docs;
          var doccp = self.model.get('cpDoc');
          doccp.unset('error');
          doccp.fromRequest(docs.cpdoc);
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(docs.rcdoc);
          self.$('[data-actions="validate"]')
            .addClass('disabled');
          self.disable('attestationNumber', true);
          self.$('[data-actions="validate"]')
            .addClass('disabled');
        })
        .fail(function (data) {
          self.$('.tkf-message-text')
            .removeClass('hidden');
          self.$('.tkf-message-text')
            .text(data.responseText);
        });
    },
    events: {
      'click a[data-actions="validate"]': 'validateContract',
    }
  });
  mod.Payment = app.common.CustForm.extend({
    template: _.template($('#auto-payment-form')
      .html()),
    schema: {
      mode: {
        title: 'Mode',
        type: 'CustSelect',
        data: 'common:settlementMode'
      },
      amount: {
        title: 'Montant',
        type: 'CustNumber'
      },
      date: {
        title: 'Date',
        type: 'CustDate'
      },
      num: {
        title: 'Référence',
        type: 'CustText'
      },
      bank: {
        title: 'Banque',
        type: 'CustSelect',
        data: 'common:banklist'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    disableFields: function (disable) {
      this.disable('num', disable);
      this.disable('bank', disable);
      this.disable('date', disable);
    },
    onModeChange: function () {
      var mode = this.getValue('mode');
      if (mode === '1') {
        this.disableFields(true);
      }
      else if (mode === '0' || mode === '2' || mode === '3') {
        this.disableFields(false);
      }
    },
    clearValues: function () {
      this.model.clear();
      this.setValue('num', null);
      this.setValue('bank', null);
      this.setValue('date', null);
    },
    initEvents: function () {
      this.on('mode:set', function () {
        this.clearValues();
        this.onModeChange();
      });
      var policy = mod.controller.container.get('policy');
      this.listenTo(policy, 'change:remainingAmont', function () {
        var pol = mod.controller.container.get('policy');
        var remaining = pol.get('remainingAmont');
        this.setValue('amount', remaining.toFixed(3));
      });
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      var policy = mod.controller.container.get('policy');
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.onModeChange();
        this.initEvents();
        this.setValue('amount', policy.get('totalContribution')
          .toFixed(3));
      }, this), 0);
      return this;
    },
    addPayment: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont')
        .toFixed(3);
      var amount = this.getValue('amount')
        .toFixed(3);
      var remaining = remainingAmont - amount;
      if (remaining < 0) {
        return false;
      }
      this.commit();
      if (this.validatePayment()) {
        settlements.add(this.model);
        this.model = new mod.Settlement();
        this.clearValues();
        this.setValue('mode', null);
        this.setValue('date', null);
        this.disableFields(true);
        policy.set('remainingAmont', remaining);
      }
    },
    validatePayment: function () {
      var mode = this.model.get('mode');
      var amount = this.model.get('amount');
      var date = this.model.get('date');
      var num = this.model.get('num');
      var bank = this.model.get('bank');
      if (mode === '') {
        return false;
      }
      if (amount === null) {
        return false;
      }
      if (mode === '0' || mode === '2') {
        if (date === null || num === '' || bank === '') {
          return false;
        }
      }
      return true;
    },
    events: {
      'click [data-actions="addPayment"]': 'addPayment',
    }
  });
  mod.PaymentRow = Marionette.ItemView.extend({
    template: '#auto-payment-consult-row',
    tagName: 'tr',
    templateHelpers: {
      updateSettlementMode: function () {
        var mode = this.mode;
        if (mode === '0') {
          return 'Virement';
        }
        else if (mode === '1') {
          return 'Espèces/Versement';
        }
        else if (mode === '2') {
          return 'Chèque';
        }
        else if (mode === '3') {
          return 'Traite';
        }
      }
    },
    erase: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont');
      policy.set('remainingAmont', remainingAmont + this.model.get(
        'amount'));
      settlements.remove(this.model);
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  mod.Payments = Marionette.CompositeView.extend({
    template: '#auto-payment-consult-table',
    itemView: mod.PaymentRow,
    itemViewContainer: 'tbody'
  });
});
