main.module('auto.term', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-term',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content'
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.listenTo(mod.controller.steps, 'step', function (step) {
        this.content.show(new mod['step' + step + 'View']());
      });
      app.request('policy:termList')
        .done(function (data) {
          var dueTerms = data.dueTermPolicies;
          var actualTerms = data.termPolicies;
          var futureTerms = data.futureTermPolicies;
          mod.controller.dueTermPolicies.reset();
          _.each(dueTerms, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.dueTermPolicies.add(policy);
          });
          mod.controller.termPolicies.reset();
          _.each(actualTerms, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.termPolicies.add(policy);
          });
          mod.controller.futureTermPolicies.reset();
          _.each(futureTerms, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.futureTermPolicies.add(policy);
          });
        })
        .fail(app.fail);
      mod.controller.steps.setActive(0);
    }
  });
  mod.NavItemView = Marionette.View.extend({
    tagName: 'li',
    template: _.template('<a href="#"><%= label %></a>'),
    initialize: function () {
      Marionette.View.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'change:active', this.updateActive);
    },
    render: function () {
      var html = this.template(this.model.toJSON());
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
    },
    events: {
      'click a': function (event) {
        event.preventDefault();
        mod.controller.steps.setActive(this.model);
      }
    }
  });
  mod.NavView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-tabs',
    itemView: mod.NavItemView,
    initialize: function () {
      this.collection = mod.controller.steps;
    }
  });
  mod.DueTermCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      clientName: {
        title: 'Nom',
        type: 'CustText'
      }
    },
    term: function () {
      var error = this.commit();
      if (!error) {
        app.request('policy:termSearch', this.model, 0)
          .done(function (data) {
            mod.controller.dueTermPolicies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.dueTermPolicies.add(policy);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="term"]': 'term',
    }
  });
  mod.TermCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      clientName: {
        title: 'Nom',
        type: 'CustText'
      }
    },
    term: function () {
      var error = this.commit();
      if (!error) {
        app.request('policy:termSearch', this.model, 1)
          .done(function (data) {
            mod.controller.termPolicies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.termPolicies.add(policy);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="term"]': 'term',
    }
  });
  mod.FutureTermCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      clientName: {
        title: 'Nom',
        type: 'CustText'
      }
    },
    term: function () {
      var error = this.commit();
      if (!error) {
        app.request('policy:termSearch', this.model, 2)
          .done(function (data) {
            mod.controller.futureTermPolicies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.futureTermPolicies.add(policy);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="term"]': 'term',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#auto-policy-term-row')
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
  mod.PolicieTermRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#auto-policy-term-row'
  });
  mod.PolicieTermTable = Marionette.CompositeView.extend({
    template: '#auto-policy-term-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.stepDueTermView = Marionette.Layout.extend({
    template: '#auto-policy-term-view',
    regions: {
      error: '.tkf-error',
      dueTermCriteria: '.tkf-Criteria',
      dueTermPolicies: '.tkf-Policies'
    },
    onRender: function () {
      this.dueTermCriteria.show(new mod.DueTermCriteria({
        model: mod.controller.dueTermCriteria
      }));
      this.dueTermPolicies.show(new mod.PolicieTermTable({
        collection: mod.controller.dueTermPolicies
      }));
    }
  });
  mod.stepTermView = Marionette.Layout.extend({
    template: '#auto-policy-term-view',
    regions: {
      error: '.tkf-error',
      termCriteria: '.tkf-Criteria',
      termPolicies: '.tkf-Policies'
    },
    onRender: function () {
      this.termCriteria.show(new mod.TermCriteria({
        model: mod.controller.termCriteria
      }));
      this.termPolicies.show(new mod.PolicieTermTable({
        collection: mod.controller.termPolicies
      }));
    }
  });
  mod.stepFutureTermView = Marionette.Layout.extend({
    template: '#auto-policy-term-view',
    regions: {
      error: '.tkf-error',
      futureTermCriteria: '.tkf-Criteria',
      futureTermPolicies: '.tkf-Policies'
    },
    onRender: function () {
      this.futureTermCriteria.show(new mod.FutureTermCriteria({
        model: mod.controller.futureTermCriteria
      }));
      this.futureTermPolicies.show(new mod.PolicieTermTable({
        collection: mod.controller.futureTermPolicies
      }));
    }
  });
  //TERM CONSULT VIEWS
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#auto-term-consult',
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
      this.header.show(new mod.TermConsultHeader({
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
  });
  mod.ActionsPolicyConsult = app.common.CustForm.extend({
    template: _.template($('#auto-term-actions-policy')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.aeDoc = new app.common.DocView({
        model: this.model.get('aeDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.aeDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="aePrint"]')
        .append(this.aeDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      var docae = this.model.get('aeDoc');
      var docat = this.model.get('attestationDoc');
      var docrc = this.model.get('receiptDoc');
      if (docae.hasURL() && docrc.hasURL() && docat.hasURL()) {
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
          var docae = self.model.get('aeDoc');
          docae.unset('error');
          docae.fromRequest(docs.aeDoc);
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
    template: _.template($('#auto-term-validate-policy')
      .html()),
    schema: {
      attestationNumber: {
        title: 'Numéro de l\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list',
        requestParams: 'reference'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.aeDoc = new app.common.DocView({
        model: this.model.get('aeDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.aeDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="aePrint"]')
        .append(this.aeDoc.render()
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
      app.request('policy:term:validate', {
          policy: policy,
          settlements: settlements,
          attestationNumber: attestationNumber
        })
        .done(function (data) {
          policy.set('validated', true);
          docs = data.docs;
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
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
      },
      updateBankDescription: function () {
        var bank = this.bank;
        if (bank !== '') {
          return app.common.enums.banks[bank - 1].text;
        }
        else {
          return '';
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
  mod.TermConsultHeader = Marionette.ItemView.extend({
    template: '#auto-term-consult-header',
    ui: {
      billingFrequency: '[data-values="billingFrequency"]',
      effectiveDate: '[data-values="effectiveDate"]',
      termDate: '[data-values="termDate"]',
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
});
