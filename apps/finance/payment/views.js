main.module('finance.payment', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#finance-payment-edit',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content',
      summary: '.tkf-summary',
      error: '.tkf-error'
    },
    templateHelpers: {
      paymentReference: function () {
        return mod.controller.payment.get('reference');
      },
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.listenTo(mod.controller.steps, 'step', function (step) {
        this.content.show(new mod['step' + step + 'View']());
      });
      this.listenTo(mod.controller.payment, 'change', this.refreshError);
      this.summary.show(new mod.SummaryPaymentView({
        model: mod.controller.payment
      }));
      mod.controller.steps.setActive(0);
    },
    constructor: function () {
      Marionette.Layout.prototype.constructor.apply(this, arguments);
      this.addRegions({
        error: '.tkf-error'
      });
      this.on('render', function () {
        this.refreshError();
      });
    },
    refreshError: function () {
      if (mod.controller.payment.get('error')) {
        this.error.show(new mod.ErrorView({
          model: mod.controller.payment
        }));
      }
      else if (mod.controller.payment.get('warning')) {
        this.error.show(new mod.WarningView({
          model: mod.controller.payment
        }));
      }
      else {
        this.error.close();
      }
    }
  });
  // bouton Nav-tabs de navigation
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
  // Liste des boutons de navigation Nav-tabs
  mod.NavView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-tabs',
    itemView: mod.NavItemView,
    initialize: function () {
      this.collection = mod.controller.steps;
    }
  });
  // Formulaire de recherche des quittances
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#finance-receipt-search-criteria')
      .html()),
    schema: {
      policyReference: {
        title: 'Contrat',
        type: 'CustText'
      },
      subscriberName: {
        title: 'Client',
        type: 'CustText'
      },
      receiptReference: {
        title: 'Référence',
        type: 'CustNumber'
      },
      fromDate: {
        title: 'Emise du',
        type: 'CustDate'
      },
      toDate: {
        title: 'Emise au',
        type: 'CustDate'
      },
      effectiveDate: {
        title: 'Effective du',
        type: 'CustDate'
      },
      endDate: {
        title: 'Effective au',
        type: 'CustDate'
      },
      insuranceCertificate: {
        title: 'Pièce assurance',
        type: 'CustText'
      }
    },
    filterReceipts: function (data) {
      var result = [];
      var receipts = mod.controller.payment.get('receipts');
      receipts = receipts.toJSON();
      var existings = _.pluck(receipts, 'reference');
      _.each(data, function (receipt) {
        if (receipt !== null) {
          if (!_.contains(existings, receipt.reference)) {
            result.push(receipt);
          }
        }
      });
      return result;
    },
    search: function () {
      var self = this;
      var error = this.commit();
      if (!error) {
        var payment;
        payment = mod.controller.payment;
        app.request('receipt:search', this.model, payment, false)
          .done(function (data) {
            mod.controller.receipts.reset();
            var result = self.filterReceipts(data);
            mod.controller.receiptsSummary.summarizeReceipts(result);
            result = _.first(result, 50);
            mod.controller.receipts.fromRequest(result);
            _.each(result, function (receipt, index) {
              var payments = receipt.payments;
              mod.controller.receipts.at(index)
                .set('payments', payments);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  // Liste des quittances, résultat de recherche
  mod.ResultFormRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#finance-receipt-search-result-row',
    add: function () {
      var thereceipts = mod.controller.receipts;
      var payment = mod.controller.payment;
      var pos = payment.get('pos');
      var receipts = payment.get('receipts');
      var due = this.model.get('due');
      this.model.set('toAffect', _.fixNumber(due, 3));
      receipts.add(this.model, {
        at: 0
      });
      thereceipts.remove(this.model);
      this.model.manageReceipt(pos.get('deductedCommission'), pos.get(
        'proratedCommission'));
      payment.updatePayment();
    },
    events: {
      'click a[data-actions="add"]': 'add'
    }
  });
  // Table de résultats de recherche des quittances
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#finance-receipt-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  //Quittance à payer , Montant prime à payer à saisir
  mod.ReceiptFormRow = app.common.CustForm.extend({
    template: _.template($('#finance-payment-receipt-row')
      .html()),
    schema: {
      toAffect: {
        title: 'Prime à payer',
        type: 'CustNumber',
        unit: ''
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initEvents: function () {
      this.on('toAffect:set', function () {
        this.commit();
        var due = this.model.get('due');
        var self = this;
        if (due !== this.model.get('toAffect')) {
          var paymentRules = mod.controller.getPaymentConfigUtils(
            main.common.appRules);
          var authData = mod.controller.verifyPartialAmount(this.model,
            paymentRules);
          if (!authData.authorized) {
            var msg = new app.common.DiagView({
              el: '#modal'
            });
            msg.setTitle('Attention!');
            var warning = new Backbone.Model();
            warning.validationError = authData.message;
            var alt = new app.common.ErrorView({
              model: warning
            });
            msg.show(alt);
            var toAffect = parseFloat(due.toFixed(3));
            self.setValue('toAffect', toAffect);
            self.model.set('toAffect', toAffect);
          }
          else {
            var pos = mod.controller.pos;
            var deductedCommission = pos.get('deductedCommission');
            var proratedCommission = pos.get('proratedCommission');
            self.model.manageReceipt(deductedCommission,
              proratedCommission);
            mod.controller.payment.updatePayment();
          }
        }
      });
    },
    initListeners: function () {
      // receipt commission affected
      this.listenTo(this.model, 'change:commissionAffected', function () {
        this.$('[data-values="commissionAffected"]')
          .text(_.beautifyAmount(this.model.get(
            'commissionAffected'), true));
      });
      // receipt to pay
      this.listenTo(this.model, 'change:toPay', function () {
        this.$('[data-values="toPay"]')
          .text(_.beautifyAmount(this.model.get('toPay'), true));
      });
      // receipt due
      this.listenTo(this.model, 'change:due', function () {
        this.$('[data-values="due"]')
          .text(_.beautifyAmount(this.model.get('due'), true));
      });
      // Init colour of the field if error
      var toAffect = this.model.get('toAffect');
      var total = this.model.get('total');
      if (toAffect > total) {
        this.$('[name="toAffect"]')
          .css('background-color', '#d9534a');
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
        this.initListeners();
      }, this), 0);
      return this;
    },
    erase: function () {
      var payment = mod.controller.payment;
      var pos = payment.get('pos');
      var receipts = payment.get('receipts');
      if (this.model.get('isNotDeletable') && this.model.get('nature') !==
        'RT') {
        app.alert('Vous ne pouvez pas supprimer cette quittance!');
      }
      else {
        receipts.remove(this.model);
        this.model.manageReceipt(pos.get('deductedCommission'), pos.get(
          'proratedCommission'));
        payment.updatePayment();
      }
    },
    autoPostpone: function () {
      var payment = mod.controller.payment;
      var pos = payment.get('pos');
      var receipts = payment.get('receipts');
      var recId = this.model.get('reference');
      var self = this;
      app.request('payment:verifyPostPone', recId)
        .done(function (isPostponed) {
          if (isPostponed) {
            app.alert(
              'Vous ne pouvez reporter cette quittance qu\'une seule fois!'
            );
          }
          else {
            mod.controller.postponedReceipts.push(recId);
            receipts.remove(self.model);
            self.model.manageReceipt(pos.get('deductedCommission'),
              pos.get('proratedCommission'));
            payment.updatePayment();
          }
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="erase"]': 'erase',
      'click a[data-actions="autoPostpone"]': 'autoPostpone'
    }
  });
  // Liste des quittances à payer
  mod.ListReceiptsView = Marionette.CompositeView.extend({
    template: '#finance-payment-receipts-table',
    itemView: mod.ReceiptFormRow,
    itemViewContainer: 'tbody',
  });
  // Résumé des quittances recherchées : nombre, total TTC, total impayés
  mod.ReceiptsSummaryView = Marionette.ItemView.extend({
    template: '#finance-receipts-summary-view',
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    }
  });
  // Ecran Recherche
  mod.stepPickerView = Marionette.Layout.extend({
    template: '#finance-receipt-search-view',
    regions: {
      criteria: '.tkf-criteria',
      receiptsSummary: '.tkf-receiptsSummary',
      results: '.tkf-results'
    },
    templateHelpers: {
      moreThan50: function () {
        if (mod.controller.receiptsSummary.get('totalReceipts') > 50) {
          return ('( <b> 50 </b> premiers enregistrements)');
        }
      }
    },
    initialize: function () {
      this.listenTo(mod.controller.receiptsSummary, 'change', this.render);
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.criteria,
        parent: this
      }));
      this.receiptsSummary.show(new mod.ReceiptsSummaryView({
        model: mod.controller.receiptsSummary
      }));
      this.results.show(new mod.SearchResults({
        collection: mod.controller.receipts
      }));
    }
  });
  // Ecran Quittances
  mod.stepMainView = Marionette.Layout.extend({
    template: '#finance-payment-summary-view',
    regions: {
      listReceipts: '.tkf-listReceipts'
    },
    onRender: function () {
      this.listReceipts.show(new mod.ListReceiptsView({
        collection: mod.controller.payment.get('receipts')
      }));
    }
  });
  // Formulaire d'ajout d'un règlement
  mod.SettlementForm = app.common.CustForm.extend({
    template: _.template($('#finance-settlement-data')
      .html()),
    schema: {
      mode: {
        title: 'Mode',
        type: 'CustSelect',
        data: 'common:settlementMode'
      },
      amount: {
        title: 'Montant',
        type: 'CustNumber',
        unit: ''
      },
      date: {
        title: 'Date chèque',
        type: 'CustDate'
      },
      reference: {
        title: 'N° Chèque/Vir.',
        type: 'CustText'
      },
      bank: {
        title: 'Banque',
        type: 'CustSelect',
        data: 'common:banklist'
      },
      receipts: {
        title: 'Quittances',
        type: 'CustSelect',
        data: 'payment:receipts'
      }
    },
    disableFields: function (disable) {
      this.disable('bank', disable);
      this.disable('date', disable);
      this.disable('reference', disable);
    },
    onModeChange: function () {
      var mode = this.getValue('mode');
      mode = parseInt(mode);
      this.setValue('mode', mode);
      if (mode === 0) {
        this.disable('bank', false);
        this.disable('date', true);
        this.disable('reference', false);
      }
      else if ((mode === 1) || (mode === null) || (mode === 5) || (
          mode === 6)) {
        this.disableFields(true);
      }
      else if ((mode === 2) || (mode === 3)) {
        this.disableFields(false);
      }
    },
    onReceiptsChange: function () {
      var receiptId = this.getValue('receipts');
      var receipts = mod.controller.payment.get('receipts')
        .models;
      var toAffect = 0;
      var filtredReceipt = receipts.filter(function (receipt) {
        var reference = receipt.get('reference');
        receiptId = parseInt(receiptId, 10);
        return reference === receiptId;
      });
      if (filtredReceipt.length > 0) {
        toAffect = filtredReceipt[0].get('toPay');
      }
      else {
        var premium = mod.controller.payment.get('premium');
        toAffect = Math.abs(premium.get('toPay')) - Math.abs(premium.get(
          'paid'));
      }
      toAffect = Math.abs(toAffect);
      this.setValue('amount', toAffect.toFixed(3));
    },
    clearValues: function () {
      this.model.clear();
      this.setValue('reference', null);
      this.setValue('bank', null);
    },
    initEvents: function () {
      this.model.trigger('error');
      this.on('mode:set', function () {
        this.clearValues();
        this.onModeChange();
      });
      this.on('receipts:change', function () {
        this.onReceiptsChange();
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.onModeChange();
        this.onReceiptsChange();
        this.initEvents();
      }, this), 0);
      return this;
    },
    addSettlement: function () {
      this.commit();
      var payment = mod.controller.payment;
      payment.unset('error');
      // Afficher les champs obligatoires
      var self = this;
      payment.on('errorMode', function (msg) {
        self.setError('mode', msg);
      });
      payment.on('errorReference', function (msg) {
        self.setError('reference', msg);
      });
      payment.on('errorBank', function (msg) {
        self.setError('bank', msg);
      });
      payment.on('errorDate', function (msg) {
        self.setError('date', msg);
      });
      payment.on('errorReceipts', function (msg) {
        self.setError('receipts', msg);
      });
      payment.on('errorAmount', function (msg) {
        self.setError('amount', msg);
      });
      //
      if (payment.checkSettlement(this.model)) {
        var checkLastSettlement = payment.checkLastSettlement();
        if (checkLastSettlement) {
          mod.controller.addSettlement(payment, this.model);
        }
      }
      payment.updatePayment();
      this.clearValues();
      this.setValue('receipts', null);
      this.setValue('amount', null);
      this.setValue('mode', null);
      this.disableFields(true);
      this.onReceiptsChange();
    },
    events: {
      'click a[data-actions="addSettlement"]': 'addSettlement'
    }
  });
  // Ecran règlement
  mod.SettlementRow = Marionette.ItemView.extend({
    template: '#finance-settlement-consult-row',
    tagName: 'tr',
    templateHelpers: {
      updateSettlementMode: function () {
        return _.updateSettlementMode(this.mode);
      },
      getReceipts: function () {
        var receipts = this.receipts;
        var result = '';
        _.each(receipts, function (receipt) {
          if (result === '') {
            result = receipt;
          }
          else {
            result = result + '<br/>' + receipt;
          }
        });
        return result;
      }
    },
    ui: {
      amount: '[data-values="amount"]',
      receipts: '[data-values="receipts"]'
    },
    modelEvents: {
      'change:amount': function () {
        this.ui.amount.text(_.beautifyAmount(this.model.get('amount')));
      },
      'change:receipts': function () {
        var receipts = this.model.get('receipts');
        var result = '';
        _.each(receipts, function (receipt) {
          if (result === '') {
            result = receipt;
          }
          else {
            result = result + '<br>' + receipt;
          }
        });
        var html = result;
        this.ui.receipts.html(html);
      }
    },
    erase: function () {
      var payment = mod.controller.payment;
      var settlements = payment.get('settlements');
      settlements.remove(this.model);
      payment.updatePayment();
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  // Liste des règlements dans l'écran Règelements
  mod.SettlementListView = Marionette.CompositeView.extend({
    template: '#finance-settlement-consult-table',
    itemView: mod.SettlementRow,
    itemViewContainer: 'tbody'
  });
  // Ecran Règlements
  mod.stepSettlementView = Marionette.Layout.extend({
    template: '#finance-settlement-view',
    regions: {
      settlementForm: '.tkf-settlement',
      settlementsList: '.tkf-settlementsList'
    },
    onRender: function () {
      this.settlementsList.show(new mod.SettlementListView({
        collection: mod.controller.payment.get('settlements')
      }));
      this.settlementForm.show(new mod.SettlementForm({
        model: mod.controller.settlement
      }));
    }
  });
  // Ecran Erreur
  mod.ErrorView = Marionette.ItemView.extend({
    template: '#common-error',
    className: 'alert alert-danger',
    templateHelpers: function () {
      return {
        validationError: this.model.get('error')
      };
    }
  });
  // Ecran Avertissement
  mod.WarningView = Marionette.ItemView.extend({
    template: '#common-error',
    className: 'alert alert-warning',
    templateHelpers: function () {
      return {
        validationError: this.model.get('warning')
      };
    }
  });
  // Résumé de la feuille de caisse
  mod.SummaryPaymentView = Marionette.ItemView.extend({
    template: '#finance-payment-summary-fields-view',
    templateHelpers: {
      commission: function () {
        return this.premium.get('commission');
      },
      ras: function () {
        return this.premium.get('ras');
      },
      affected: function () {
        return this.premium.get('affected');
      },
      toPay: function () {
        return this.premium.get('toPay');
      },
      paid: function () {
        return this.premium.get('paid');
      }
    },
    initialize: function () {
      var premium = this.model.get('premium');
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(premium, 'set', this.render);
    },
    save: function () {
      this.model.manageBalance();
      app.request('payment:save', this.model, null, mod.controller.postponedReceipts)
        .done(function () {
          app.alert(
            'Votre feuille de caisse est enregistrée avec succès'
          );
        })
        .fail(app.fail);
    },
    finalize: function () {
      var payment = this.model;
      payment.unset('_id');
      payment.unset('error');
      var checkRT = this.model.checkRT();
      if (!checkRT) {
        var checkUnmixed = this.model.checkUnmixed();
        if (checkUnmixed) {
          var checkReceiptsAmount = this.model.checkReceiptsAmount();
          if (checkReceiptsAmount) {
            var checkSettlementData = this.model.checkSettlementData();
            if (checkSettlementData) {
              var checkPaymentSettlements = this.model.checkPaymentSettlements();
              if (checkPaymentSettlements) {
                this.model.manageBalance();
                app.request('payment:finalize', this.model)
                  .done(function () {
                    mod.router.navigate('payment/search', {
                      replace: false,
                      trigger: true
                    });
                  })
                  .fail(app.fail);
              }
            }
          }
        }
      }
    },
    paymentRequest: function () {
      mod.router.navigate('payment/' + this.model.get('reference') +
        '/paymentRequest', {
          replace: false,
          trigger: true
        });
    },
    events: {
      'click a[data-actions="save"]': 'save',
      'click a[data-actions="finalize"]': 'finalize',
      'click a[data-actions="paymentRequest"]': 'paymentRequest'
    }
  });
  // Ecran de recherche des feuilles de caisse
  mod.SearchLayout = Marionette.Layout.extend({
    template: '#finance-payment-search',
    regions: {
      paymentCriteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.paymentCriteria.show(new mod.PaymentSearchCriteria({
        model: mod.controller.paymentCriteria
      }));
      this.results.show(new mod.PaymentSearchResults({
        collection: mod.controller.payments
      }));
    }
  });
  // Critères de recherche de feuilles de caisse
  mod.PaymentSearchCriteria = app.common.CustForm.extend({
    template: _.template($('#finance-payment-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustNumber'
      },
      status: {
        title: 'Statut',
        type: 'CustSelect',
        data: 'common:paymentStatus'
      },
      fromCreationDate: {
        title: 'De',
        type: 'CustDate'
      },
      toCreationDate: {
        title: 'A',
        type: 'CustDate'
      },
      fromClosingDate: {
        title: 'De',
        type: 'CustDate'
      },
      toClosingDate: {
        title: 'A',
        type: 'CustDate'
      }
    },
    search: function () {
      var error = this.commit();
      if (!error) {
        app.request('payment:search', this.model)
          .done(function (data) {
            var col = new mod.Payments();
            data = _.first(data, 50);
            col.fromRequest(data);
            col.each(function (payment, index) {
              var paid = data[index].premium.paid;
              paid = _.fixNumber(paid, 3);
              payment.get('premium')
                .set('paid', paid);
            });
            mod.controller.payments.reset(col.models);
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  // résultat de rechereche de feuille de caisse
  mod.PaymentResultRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#finance-payment-search-result-row',
    templateHelpers: {
      updateStatus: function () {
        return _.updateStatus(this.status);
      },
      paid: function () {
        return this.premium.get('paid');
      }
    },
    onRender: function () {
      var status = this.model.get('status');
      switch (status) {
      case 0:
        this.$el.addClass('primary');
        break;
      case 1:
        this.$el.addClass('info');
        break;
      case 2:
        this.$el.addClass('success');
        break;
      case 3:
        this.$el.addClass('warning');
        break;
      case 4:
        this.$el.addClass('danger');
        break;
      case 6:
        this.$el.addClass('valid');
        break;
      default:
        this.$el.addClass('default');
      }
    },
    consultPayment: function () {
      mod.router.navigate('payment/' + this.model.get('reference') +
        '/consult', {
          replace: false,
          trigger: true
        });
    },
    events: {
      'click a[data-actions="consultPayment"]': 'consultPayment',
    }
  });
  // Tableau de résultats de recherche des feuilles de caisse
  mod.PaymentSearchResults = Marionette.CompositeView.extend({
    template: '#finance-payment-search-result-table',
    itemView: mod.PaymentResultRow,
    itemViewContainer: 'tbody'
  });
  // résumé de feuille de caisse dans l'écran de consultation de feuille de caisse
  mod.SummaryFields = Marionette.ItemView.extend({
    template: '#finance-payment-consult-fields-view',
    templateHelpers: {
      updateStatus: function () {
        return _.updateStatus(this.status);
      }
    },
    generate: function () {
      var self = this;
      var payment = this.model.toJSON();
      delete(payment._id);
      app.request('payment:print', payment)
        .done(function (data) {
          self.model.set('pdfId', data.id);
          mod.controller.doc.set('id', data.id);
          mod.controller.doc.set('doc', 'payment');
        })
        .fail(app.fail);
    },
    onRender: function () {
      var pdfId = this.model.get('pdfId');
      if (pdfId) {
        mod.controller.doc.set('doc', 'payment');
      }
    },
    events: {
      'click a[data-actions="generate"]': 'generate',
    }
  });
  // Ecran de consultation de feuille de caisse
  mod.SummaryPaymentConsultView = Marionette.Layout.extend({
    template: '#finance-payment-fields-view',
    regions: {
      summaryFields: '.tkf-summary-fields',
      printButton: '.tkf-print'
    },
    onRender: function () {
      this.summaryFields.show(new mod.SummaryFields({
        model: mod.controller.payment
      }));
      this.printButton.show(new app.common.DocView({
        model: mod.controller.doc
      }));
    }
  });
  // Liste des quittances de la feuille de caisse
  mod.PaymentReceiptRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#finance-payment-consult-receipt-row'
  });
  // TAble des quittances de la feuille de caisse
  mod.ListReceiptsConsultView = Marionette.CompositeView.extend({
    template: '#finance-payment-consult-receipts-table',
    itemView: mod.PaymentReceiptRow,
    itemViewContainer: 'tbody'
  });
  // résumé des totaux des quittances de la feuille de caisse
  mod.TotalReceipts = Marionette.ItemView.extend({
    template: '#finance-payment-total-receipts',
    templateHelpers: {
      affected: function () {
        return this.premium.get('affected');
      },
      commission: function () {
        return this.premium.get('commission');
      },
      ras: function () {
        return this.premium.get('ras');
      },
      toPay: function () {
        return this.premium.get('toPay');
      },
    }
  });
  // Règlement de la feuille de caisse
  mod.SettlementRowView = Marionette.ItemView.extend({
    template: '#finance-settlement-row',
    tagName: 'tr',
    templateHelpers: {
      updateSettlementMode: function () {
        return _.updateSettlementMode(this.mode);
      },
      getReceipts: function () {
        var receipts = this.receipts;
        var result = '';
        _.each(receipts, function (receipt) {
          if (result === '') {
            result = receipt;
          }
          else {
            result = result + '<br/>' + receipt;
          }
        });
        return result;
      }
    },
  });
  // Table des règlements de la feuille de caisse
  mod.SettlementsTableView = Marionette.CompositeView.extend({
    template: '#finance-settlement-table',
    itemView: mod.SettlementRowView,
    itemViewContainer: 'tbody'
  });
  // Zone des montants de la feuille de caisse
  mod.SummaryPaymentAmounts = Marionette.ItemView.extend({
    template: '#finance-payment-amounts',
    templateHelpers: {
      commission: function () {
        //return mod.controller.commission(this);
        return this.premium.get('commission');
      },
      ras: function () {
        // return mod.controller.ras(this);
        return this.premium.get('ras');
      },
      toPay: function () {
        return this.premium.get('toPay');
      },
      paid: function () {
        return this.premium.get('paid');
      },
      affected: function () {
        return this.premium.get('affected');
      }
    }
  });
  //Zone des montants réservés
  mod.PaymentReservedUse = Marionette.ItemView.extend({
    template: '#finance-payment-reserved-use',
    templateHelpers: {
      commissionToPay: function () {
        return this.premium.get('commissionToPay');
      },
      totalToPay: function () {
        var totalToPay = this.premium.get('toPay') + this.premium.get(
          'ras');
        totalToPay = _.fixNumber(totalToPay, 3);
        return (totalToPay);
      },
      totalPaid: function () {
        var paid = this.premium.get('paid');
        var totalToPay = this.premium.get('toPay') + this.premium.get(
          'ras');
        if (totalToPay > 0) {
          paid = -paid;
        }
        return paid;
      }
    }
  });
  mod.GenerateButton = Marionette.ItemView.extend({
    template: '#finance-payment-generate-button',
    generate: function () {
      var self = this;
      var payment = this.model.toJSON();
      delete(payment._id);
      app.request('payment:print', payment)
        .done(function (data) {
          self.model.set('pdfId', data.id);
          mod.controller.doc.set('id', data.id);
          mod.controller.doc.set('doc', 'payment');
        })
        .fail(app.fail);
    },
    onRender: function () {
      var pdfId = this.model.get('pdfId');
      if (pdfId) {
        mod.controller.doc.set('doc', 'payment');
      }
    },
    events: {
      'click a[data-actions="generate"]': 'generate',
    }
  });
  //Boutons d'impression
  mod.PrintButtons = Marionette.Layout.extend({
    template: '#finance-payment-print-buttons',
    regions: {
      generateButton: '.tkf-generate',
      printButton: '.tkf-print'
    },
    onRender: function () {
      this.generateButton.show(new mod.GenerateButton({
        model: mod.controller.payment
      }));
      this.printButton.show(new app.common.DocView({
        model: mod.controller.doc
      }));
    }
  });
  //Ecran de consultation de feuille de caisse
  mod.PaymentConsultView = Marionette.Layout.extend({
    template: '#finance-payment-consult-view',
    regions: {
      summaryPaymentConsult: '.tkf-summary-payment',
      summaryPaymentAmounts: '.tkf-payment-amounts',
      paymentReservedUse: '.tkf-payment-reserved',
      listReceipts: '.tkf-listReceipts',
      totalReceipts: '.tkf-totalReceipts',
      settlementsList: '.tkf-settlementsList',
      actions: '.tkf-actions'
    },
    templateHelpers: {
      paymentReference: function () {
        return mod.controller.payment.get('reference');
      },
      paymentComments: function () {
        return mod.controller.payment.get('comments');
      }
    },
    onRender: function () {
      this.summaryPaymentConsult.show(new mod.SummaryPaymentConsultView({
        model: mod.controller.payment
      }));
      this.summaryPaymentAmounts.show(new mod.SummaryPaymentAmounts({
        model: mod.controller.payment
      }));
      this.paymentReservedUse.show(new mod.PaymentReservedUse({
        model: mod.controller.payment
      }));
      this.listReceipts.show(new mod.ListReceiptsConsultView({
        collection: mod.controller.payment.get('receipts')
      }));
      this.settlementsList.show(new mod.SettlementsTableView({
        collection: mod.controller.payment.get('settlements')
      }));
      this.totalReceipts.show(new mod.TotalReceipts({
        model: mod.controller.payment
      }));
      this.actions.show(new mod.PrintButtons({
        model: mod.controller.payment
      }));
    }
  });
  mod.ReceiptToAddRow = Marionette.ItemView.extend({
    template: '#finance-exemption-receipt-to-report-consult-row',
    tagName: 'tr',
    initialize: function () {
      this.listenTo(mod.controller.sendExep, 'change', function () {
        this.$('a[data-actions="erase"]')
          .addClass('disabled');
      });
    },
    erase: function () {
      var receiptsList = mod.controller.receiptsList;
      receiptsList.remove(this.model);
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  // Liste des Quittances à reporter
  mod.ReceiptsToReport = Marionette.CompositeView.extend({
    template: '#finance-exemption-receipts-to-report-table',
    itemView: mod.ReceiptToAddRow,
    itemViewContainer: 'tbody'
  });
  // vue partielle de l'ecran de dérogation de la feuille de caisse
  mod.ExemptionForm = app.common.CustForm.extend({
    template: _.template($('#finance-payment-form-request')
      .html()),
    schema: {
      msg: {
        title: 'Contenu de la derogation',
        type: 'TextArea'
      },
      receiptsLst: {
        title: 'Liste des quittances',
        type: 'CustSelect',
        data: 'payment:receipts'
      },
      reviewDate: {
        title: 'Nouvelle date proposée',
        type: 'CustDate'
      }
    },
    disableFields: function (disable) {
      this.disable('receiptsLst', disable);
      this.disable('reviewDate', disable);
    },
    addReceipt: function () {
      this.commit();
      var reviewDate = this.getValue('reviewDate');
      var receiptsLst = this.getValue('receiptsLst');
      if ((reviewDate !== null) && (receiptsLst === '')) {
        app.alert('Veuillez saisir la quittance à reporter !');
      }
      else {
        mod.controller.addReceipt(this.model);
      }
      this.setValue('reviewDate', null);
      this.setValue('receiptsLst', null);
    },
    sendExemption: function () {
      this.commit();
      var msg = this.$('textarea[data-fields="msg"]')
        .val();
      var receiptsList = mod.controller.receiptsList;
      if (msg === '') {
        app.alert(
          'Vous ne pouvez pas envoyer une dérogation sans avoir spécifié le descriptif !'
        );
      }
      else {
        mod.controller.sendExep.set('status', 'true');
        this.$('a[data-actions="sendExemption"]')
          .addClass('disabled');
        this.$('a[data-actions="addReceipt"]')
          .addClass('disabled');
        this.$('textarea[data-fields="msg"]')
          .attr('disabled', 'disabled');
        this.disableFields(true);
        app.request('payment:sendExemption', mod.controller.payment,
            msg, receiptsList, mod.controller.payment.get('reference')
          )
          .done(function (data) {
            app.alert('Votre demande de dérogation\t' + data.reference +
              '\ta été envoyée avec succès');
            mod.router.navigate('payment/' + mod.controller.payment
              .get('reference') + '/edit', {
                replace: false,
                trigger: true
              });
          })
          .fail(function () {
            this.$('a[data-actions="sendExemption"]')
              .removeClass('disabled');
            this.disableFields(false);
            this.$('textarea[data-fields="msg"]')
              .attr('disabled', false);
            app.fail();
          });
      }
    },
    events: {
      'click a[data-actions="sendExemption"]': 'sendExemption',
      'click a[data-actions="addReceipt"]': 'addReceipt'
    }
  });
  //Ecran de dérogation de la feuille de caisse
  mod.PaymentRequestView = Marionette.Layout.extend({
    template: '#finance-payment-request',
    regions: {
      exemptionForm: '.tkf-exemption-form',
      receiptsToReport: '.tkf-exemption-receiptsToReport'
    },
    templateHelpers: {
      paymentReference: function () {
        return mod.controller.payment.get('reference');
      },
    },
    onRender: function () {
      this.exemptionForm.show(new mod.ExemptionForm({
        model: mod.controller.payment
      }));
      this.receiptsToReport.show(new mod.ReceiptsToReport({
        collection: mod.controller.receiptsList
      }));
    }
  });
});
