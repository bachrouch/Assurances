main.module('admin.payback', function (mod, app, Backbone, Marionette, $, _) {
  mod.MainLayout = Marionette.Layout.extend({
    template: '#admin-payback-main',
    regions: {
      titlePayback: '.tkf-title',
      paybackPos: '.tkf-pos',
      nav: '.tkf-nav',
      content: '.tkf-content',
      summary: '.tkf-summary',
      error: '.tkf-error'
    },
    onRender: function () {
      this.titlePayback.show(new mod.TitlePayback({
        model: mod.controller.payback
      }));
      this.paybackPos.show(new mod.PaybackPos({
        model: mod.controller.payback
      }));
      this.nav.show(new mod.NavView());
      this.listenTo(mod.controller.steps, 'step', function (step) {
        this.content.show(new mod['step' + step + 'View']());
      });
      this.listenTo(mod.controller.payback, 'change', this.refreshError);
      this.summary.show(new mod.SummaryPaybackView({
        model: mod.controller.payback
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
      if (mod.controller.payback.get('error')) {
        this.error.show(new mod.ErrorView({
          model: mod.controller.payback
        }));
      }
      else if (mod.controller.payback.get('warning')) {
        this.error.show(new mod.WarningView({
          model: mod.controller.payback
        }));
      }
      else {
        this.error.close();
      }
    }
  });
  // Titre Feuille de remboursement + référence
  mod.TitlePayback = Marionette.ItemView.extend({
    template: '#admin-payback-title'
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
  // Zone de choix de l'intermédiaire
  mod.PaybackPos = app.common.CustForm.extend({
    template: _.template($('#admin-payback-pos')
      .html()),
    schema: {
      pos: {
        title: 'Intermédiaire',
        type: 'CustSelect',
        data: 'common:posList'
      }
    },
    initEvents: function () {
      if (this.model.get('pos') !== null) {
        this.disable('pos', true);
      }
      this.on('pos:change', function () {
        this.commit();
        this.disable('pos', true);
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
      }, this), 0);
      return this;
    },
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
  // Synthèse de la feuille de remboursement
  mod.SummaryPaybackView = Marionette.ItemView.extend({
    template: '#admin-payback-summary',
    templateHelpers: {
      comToPay: function () {
        return this.premium.get('commissionToPay');
      },
      ras: function () {
        return this.premium.get('ras');
      },
      toPay: function () {
        return this.premium.get('toPay');
      },
      paid: function () {
        return this.premium.get('paid');
      },
      total: function () {
        return this.premium.get('total');
      }
    },
    initialize: function () {
      var premium = this.model.get('premium');
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(premium, 'set', this.render);
    },
    save: function () {
      var self = this;
      this.model.unset('error');
      this.model.unset('warning');
      app.request('payback:save', this.model)
        .done(function (data) {
          if (data === false) {
            self.model.set('error',
              'Impossible de sauvegarder la feuille de remboursement. Veuillez vérifier que les feuilles de caisse ne sont pas liquidées!'
            );
          }
          else {
            app.alert(
              'Votre feuille de remboursement est enregistrée avec succès'
            );
          }
        })
        .fail(app.fail);
    },
    finalize: function () {
      var payback = this.model;
      payback.unset('error');
      var checkSettlementData = payback.checkSettlementData();
      if (checkSettlementData) {
        var checkPaybackSettlements = payback.checkPaybackSettlements();
        if (checkPaybackSettlements) {
          //
          var self = this;
          app.request('payback:paybackFinalize', this.model)
            .done(function (data) {
              if (data === false) {
                self.model.set('error',
                  'Impossible de clôturer la feuille de remboursement. Veuillez vérifier que les feuilles de caisse ne sont pas liquidées!'
                );
              }
              else if (data === true) {
                mod.router.navigate('payback/search', {
                  replace: false,
                  trigger: true
                });
              }
            });
        }
      }
    },
    events: {
      'click a[data-actions="save"]': 'save',
      'click a[data-actions="finalize"]': 'finalize'
    }
  });
  // Critères de recherche de feuille de caisse
  mod.PaymentSearchCriteria = app.common.CustForm.extend({
    template: _.template($('#admin-payback-payment-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustNumber',
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
      },
    },
    search: function () {
      var error = this.commit();
      var cWarning =
        'Avertissement! Veuillez choisir un intermédiaire!';
      if (!error) {
        var payback = mod.controller.payback;
        var paybackPos = payback.get('pos');
        if (paybackPos !== null) {
          mod.controller.payback.unset('warning');
          this.model.set('pos', paybackPos);
          this.model.set('status', 2);
          app.request('admin:paymentSearch', this.model, payback)
            .done(function (data) {
              var col = new app.finance.payment.Payments();
              data = _.first(data, 50);
              col.fromRequest(data);
              col.each(function (payment, index) {
                payment.get('premium')
                  .set('paid', data[index].premium.paid);
                payment.get('premium')
                  .set('commissionToPay', data[index].premium.commissionToPay);
                payment.get('pos')
                  .set('code', data[index].pos.code);
                payment.get('pos')
                  .set('deductedCommission', data[index].pos.deductedCommission);
                payment.get('pos')
                  .set('proratedCommission', data[index].pos.proratedCommission);
                payment.get('pos')
                  .set('ras', data[index].pos.ras);
              });
              mod.controller.payments.reset(col.models);
            })
            .fail(app.fail);
        }
        else {
          mod.controller.payback.set('warning', cWarning);
        }
      }
    },
    events: {
      'click a[data-actions="search"]': 'search'
    }
  });
  // Résultat de rechereche de feuille de caisse
  mod.PaybackPaymentResultRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-payback-payment-result-row',
    templateHelpers: {
      paid: function () {
        return this.premium.get('paid');
      },
      commissionToPay: function () {
        return this.premium.get('commissionToPay');
      }
    },
    add: function () {
      var thePayments = mod.controller.payments;
      var payback = mod.controller.payback;
      var paybackPayments = payback.get('payments');
      paybackPayments.add(this.model, {
        at: 0
      });
      thePayments.remove(this.model);
      payback.updatePayment(this.model);
      payback.updatePayback();
    },
    events: {
      'click a[data-actions="add"]': 'add'
    }
  });
  // Tableau de résultats de recherche des feuilles de caisse
  mod.PaymentResults = Marionette.CompositeView.extend({
    template: '#admin-payback-payment-result-table',
    itemView: mod.PaybackPaymentResultRow,
    itemViewContainer: 'tbody'
  });
  //Ecran de recherche des feuilles de caisse
  mod.stepMainView = Marionette.Layout.extend({
    template: '#admin-payback-search-payment',
    regions: {
      criteria: '.tkf-criteria',
      paymentResults: '.tkf-paymentResults'
    },
    onRender: function () {
      this.criteria.show(new mod.PaymentSearchCriteria({
        model: mod.controller.paymentCriteria,
      }));
      this.paymentResults.show(new mod.PaymentResults({
        collection: mod.controller.payments
      }));
    }
  });
  //Ligne de feuille de caisse
  mod.PaybackPaymenttRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-payback-payment-row',
    templateHelpers: {
      paid: function () {
        return this.premium.get('paid');
      },
      commissionToPay: function () {
        return this.premium.get('commissionToPay');
      }
    },
    erase: function () {
      var payback = mod.controller.payback;
      var payments = payback.get('payments');
      payments.remove(this.model);
      payback.updatePayback();
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  //Tableau des fuilles de caisse
  mod.ListPaymentsView = Marionette.CompositeView.extend({
    template: '#admin-payback-payment-result-table',
    itemView: mod.PaybackPaymenttRow,
    itemViewContainer: 'tbody'
  });
  //Ecran de la liste des feuilles de caisse
  mod.stepPaymentView = Marionette.Layout.extend({
    template: '#admin-payback-payments-list',
    regions: {
      listPayments: '.tkf-listPayments'
    },
    onRender: function () {
      this.listPayments.show(new mod.ListPaymentsView({
        collection: mod.controller.payback.get('payments')
      }));
    }
  });
  mod.SettlementAdd = app.common.CustForm.extend({
    template: _.template($('#admin-settlement-data')
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
      payments: {
        title: 'Feuille de caisse',
        type: 'CustSelect',
        data: 'payback:payments'
      }
    },
    disableFields: function (disable) {
      this.disable('bank', disable);
      this.disable('date', disable);
    },
    onModeChange: function () {
      var mode = this.getValue('mode');
      mode = parseInt(mode);
      this.setValue('mode', mode);
      if ((mode === 1) || (mode === null)) {
        this.disableFields(true);
      }
      else if ((mode === 0) || (mode === 2) || (mode === 3)) {
        this.disableFields(false);
      }
    },
    onPaymentsChange: function () {
      var paymentId = this.getValue('payments');
      var payments = mod.controller.payback.get('payments')
        .models;
      var toAffect = 0;
      var filtredPayment = payments.filter(function (payment) {
        var reference = payment.get('reference');
        paymentId = parseInt(paymentId, 10);
        return reference === paymentId;
      });
      if (filtredPayment.length > 0) {
        toAffect = filtredPayment[0].get('premium')
          .get('toPay');
      }
      else {
        var premium = mod.controller.payback.get('premium');
        toAffect = premium.get('paid') - Math.abs(premium.get('total'));
      }
      toAffect = Math.abs(toAffect);
      this.setValue('amount', _.fixNumber(toAffect, 3));
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
      this.on('payments:change', function () {
        this.onPaymentsChange();
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.onModeChange();
        this.onPaymentsChange();
        this.initEvents();
      }, this), 0);
      return this;
    },
    addSettlement: function () {
      this.commit();
      var payback = mod.controller.payback;
      payback.unset('error');
      // Afficher les champs obligatoires
      var self = this;
      payback.on('errorMode', function (msg) {
        self.setError('mode', msg);
      });
      payback.on('errorReference', function (msg) {
        self.setError('reference', msg);
      });
      payback.on('errorBank', function (msg) {
        self.setError('bank', msg);
      });
      payback.on('errorDate', function (msg) {
        self.setError('date', msg);
      });
      payback.on('errorAmount', function (msg) {
        self.setError('amount', msg);
      });
      //
      if (payback.checkSettlement(this.model)) {
        payback.addSettlement(this.model);
      }
      payback.updatePayback();
      this.clearValues();
      this.setValue('payments', null);
      this.setValue('amount', null);
      this.setValue('mode', null);
      this.disableFields(true);
      this.onPaymentsChange();
    },
    events: {
      'click a[data-actions="addSettlement"]': 'addSettlement'
    }
  });
  // Ecran règlement
  mod.SettlementRow = Marionette.ItemView.extend({
    template: '#admin-settlement-consult-row',
    tagName: 'tr',
    templateHelpers: {
      updateSettlementMode: function () {
        return _.updateSettlementMode(this.mode);
      },
      getPayments: function () {
        var payments = this.payments;
        var result = '';
        _.each(payments, function (payment) {
          if (result === '') {
            result = payment;
          }
          else {
            result = result + '<br/>' + payment;
          }
        });
        return result;
      }
    },
    ui: {
      amount: '[data-values="amount"]',
      payments: '[data-values="payments"]'
    },
    modelEvents: {
      'change:amount': function () {
        this.ui.amount.text(_.beautifyAmount(this.model.get('amount')));
      },
      'change:payments': function () {
        var payments = this.model.get('payments');
        var result = '';
        _.each(payments, function (payment) {
          if (result === '') {
            result = payment;
          }
          else {
            result = result + '<br>' + payment;
          }
        });
        var html = result;
        this.ui.payments.html(html);
      }
    },
    eraseSettlement: function () {
      var payback = mod.controller.payback;
      var settlements = payback.get('settlements');
      settlements.remove(this.model);
      payback.updatePayback();
    },
    events: {
      'click a[data-actions="eraseSettlement"]': 'eraseSettlement'
    }
  });
  // Liste des règlements dans l'écran Règelements
  mod.SettlementListView = Marionette.CompositeView.extend({
    template: '#admin-settlement-consult-table',
    itemView: mod.SettlementRow,
    itemViewContainer: 'tbody'
  });
  // Ecran des règlements
  mod.stepSettlementView = Marionette.Layout.extend({
    template: '#admin-settlement-view',
    regions: {
      settlementForm: '.tkf-settlement',
      settlementsList: '.tkf-settlementsList'
    },
    onRender: function () {
      this.settlementForm.show(new mod.SettlementAdd({
        model: mod.controller.settlement
      }));
      this.settlementsList.show(new mod.SettlementListView({
        collection: mod.controller.payback.get('settlements')
      }));
    }
  });
  // Critères de recherche de feuilles de remboursement
  mod.PaybackSearchCriteria = app.common.CustForm.extend({
    template: _.template($('#admin-payback-search-criteria')
      .html()),
    schema: {
      pos: {
        title: 'Intermédiaire',
        type: 'CustSelect',
        data: 'common:posList'
      },
      reference: {
        title: 'Référence',
        type: 'CustNumber'
      },
      status: {
        title: 'Statut',
        type: 'CustSelect',
        data: 'common:paybackStatus'
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
      },
      nonZeroBalance: {
        title: 'nonZeroBalance',
        type: 'CustCheckbox'
      },
      settlementReference: {
        title: 'Référence règlement',
        type: 'CustText'
      }
    },
    search: function () {
      var error = this.commit();
      if (!error) {
        app.request('payback:search', this.model)
          .done(function (data) {
            var col = new mod.Paybacks();
            data = _.first(data, 50);
            col.fromRequest(data);
            col.each(function (payback, index) {
              var paid = data[index].premium.paid;
              paid = _.fixNumber(paid, 3);
              payback.get('premium')
                .set('paid', paid);
            });
            mod.controller.paybacks.reset(col.models);
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  // résultat de rechereche de feuille de remboursement
  mod.PaybackResultRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-payback-search-result-row',
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
      default:
        this.$el.addClass('default');
      }
    },
    consultPayback: function () {
      mod.router.navigate('payback/' + this.model.get('reference') +
        '/consult', {
          replace: false,
          trigger: true
        });
    },
    events: {
      'click a[data-actions="consultPayback"]': 'consultPayback',
    }
  });
  // Tableau de résultats de recherche des feuilles de remboursement
  mod.PaybackSearchResults = Marionette.CompositeView.extend({
    template: '#admin-payment-search-result-table',
    itemView: mod.PaybackResultRow,
    itemViewContainer: 'tbody'
  });
  // Ecran de recherche des feuilles de remboursement
  mod.SearchLayout = Marionette.Layout.extend({
    template: '#admin-payback-search',
    regions: {
      paybackCriteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.paybackCriteria.show(new mod.PaybackSearchCriteria({
        model: mod.controller.paybackCriteria
      }));
      this.results.show(new mod.PaybackSearchResults({
        collection: mod.controller.paybacks
      }));
    }
  });
  mod.GenerateButton = Marionette.ItemView.extend({
    template: '#admin-payback-generate-button',
    generate: function () {
      var self = this;
      var payback = this.model.toJSON();
      delete(payback._id);
      app.request('payback:print', payback)
        .done(function (data) {
          self.model.set('pdfId', data.id);
          mod.controller.doc.set('id', data.id);
          mod.controller.doc.set('doc', 'payback');
        })
        .fail(app.fail);
    },
    onRender: function () {
      var pdfId = this.model.get('pdfId');
      if (pdfId) {
        mod.controller.doc.set('doc', 'payback');
      }
    },
    events: {
      'click a[data-actions="generate"]': 'generate',
    }
  });
  //Boutons d'impression
  mod.PrintButtons = Marionette.Layout.extend({
    template: '#admin-payback-print-buttons',
    regions: {
      generateButton: '.tkf-generate',
      printButton: '.tkf-print'
    },
    onRender: function () {
      this.generateButton.show(new mod.GenerateButton({
        model: mod.controller.payback
      }));
      this.printButton.show(new app.common.DocView({
        model: mod.controller.doc
      }));
    }
  });
  // Zone résumé de feuille de remboursement
  mod.SummaryPaybackConsultView = Marionette.ItemView.extend({
    template: '#admin-payback-consult-fields-view',
    templateHelpers: {
      updateStatus: function () {
        return _.updateStatus(this.status);
      }
    }
  });
  // Zone des montants de la feuille de remboursement
  mod.SummaryPaybackAmounts = Marionette.ItemView.extend({
    template: '#admin-payback-amounts',
    templateHelpers: {
      commissionToPay: function () {
        return this.premium.get('commissionToPay');
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
      }
    }
  });
  // Liste des quittances de la feuille de caisse
  mod.PaybackPaymentRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-payback-consult-payment-row',
    templateHelpers: {
      commissionToPay: function () {
        return this.premium.get('commissionToPay');
      },
      commission: function () {
        return this.premium.get('commission');
      },
      paid: function () {
        return this.premium.get('paid');
      }
    }
  });
  // Table des feuilles de caisse du remboursement
  mod.ListPaymentsConsultView = Marionette.CompositeView.extend({
    template: '#admin-payback-consult-payments-table',
    itemView: mod.PaybackPaymentRow,
    itemViewContainer: 'tbody'
  });
  // résumé des totaux des quittances de la feuille de caisse
  mod.TotalPayments = Marionette.ItemView.extend({
    template: '#admin-payback-total-payments',
    templateHelpers: {
      commissionToPay: function () {
        return this.premium.get('commissionToPay');
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
  // Règlement de la feuille de remboursement
  mod.SettlementRowView = Marionette.ItemView.extend({
    template: '#admin-settlement-row',
    tagName: 'tr',
    templateHelpers: {
      updateSettlementMode: function () {
        return _.updateSettlementMode(this.mode);
      },
      getPayments: function () {
        var payments = this.payments;
        var result = '';
        _.each(payments, function (payment) {
          if (result === '') {
            result = payment;
          }
          else {
            result = result + '<br/>' + payment;
          }
        });
        return result;
      }
    },
  });
  //Zone balance
  mod.SummaryPaybackBalance = Marionette.ItemView.extend({
    template: '#admin-payback-balance',
    templateHelpers: {
      total: function () {
        return this.premium.get('total');
      },
      paid: function () {
        return this.premium.get('paid');
      }
    }
  });
  // Table des règlements de la feuille de remboursement
  mod.SettlementsTableView = Marionette.CompositeView.extend({
    template: '#admin-settlement-table',
    itemView: mod.SettlementRowView,
    itemViewContainer: 'tbody'
  });
  //Ecran de consultation de feuille de remboursement
  mod.PaybacktConsultView = Marionette.Layout.extend({
    template: '#admin-payback-consult-view',
    regions: {
      summaryPaybackConsult: '.tkf-summary-payback',
      summaryPaybackAmounts: '.tkf-payback-amounts',
      summaryPaybackBalance: '.tkf-payback-balance',
      listPayments: '.tkf-listPayments',
      totalPayments: '.tkf-totalPayments',
      settlementsList: '.tkf-settlementsList',
      actions: '.tkf-actions'
    },
    templateHelpers: {
      paybackReference: function () {
        return mod.controller.payback.get('reference');
      }
    },
    onRender: function () {
      this.summaryPaybackConsult.show(new mod.SummaryPaybackConsultView({
        model: mod.controller.payback
      }));
      this.summaryPaybackAmounts.show(new mod.SummaryPaybackAmounts({
        model: mod.controller.payback
      }));
      this.summaryPaybackBalance.show(new mod.SummaryPaybackBalance({
        model: mod.controller.payback
      }));
      this.listPayments.show(new mod.ListPaymentsConsultView({
        collection: mod.controller.payback.get('payments')
      }));
      this.totalPayments.show(new mod.TotalPayments({
        model: mod.controller.payback
      }));
      this.settlementsList.show(new mod.SettlementsTableView({
        collection: mod.controller.payback.get('settlements')
      }));
      this.actions.show(new mod.PrintButtons({
        model: mod.controller.payback
      }));
    }
  });
});
