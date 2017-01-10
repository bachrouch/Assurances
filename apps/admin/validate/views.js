main.module('admin.validate', function (mod, app, Backbone, Marionette, $, _) {
  mod.MainLayout = Marionette.Layout.extend({
    template: '#admin-search-main',
    regions: {
      content: '.tkf-content',
      error: '.tkf-error'
    },
    onRender: function () {
      this.content.show(new mod.stepReceiptSearchView());
    }
  });
  // Formulaire de recherche des quittances
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#admin-receipt-search-criteria')
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
        title: 'Limite au',
        type: 'CustDate'
      },
      endDate: {
        title: 'Effet au',
        type: 'CustDate'
      },
      nature: {
        title: 'Nature:CT, TR,..',
        type: 'CustText'
      },
      pos: {
        title: 'Intermédiaire',
        type: 'CustSelect',
        data: 'common:posList'
      },
      includeCancelled: {
        title: 'includeCancelled',
        type: 'CustCheckbox'
      },
      nonZeroDue: {
        title: 'nonZeroDue',
        type: 'CustCheckbox'
      }
    },
    search: function () {
      var error = this.commit();
      var self = this;
      if (!error) {
        app.request('admin:receiptSearch', this.model, null, true)
          .done(function (data) {
            mod.controller.receipts.reset();
            mod.controller.receiptsSummary.summarizeReceipts(data);
            data = _.first(data, 50);
            mod.controller.receipts.fromRequest(data);
            _.each(data, function (receipt, index) {
              var payments = receipt.payments;
              mod.controller.receipts.at(index)
                .set('payments', payments);
            });
            self.$('[data-actions="exportResult"]')
              .removeClass('disabled')
              .addClass('btn-success');
            var url = self.model.buildURL();
            url = 'csv/exportAdminReceiptResult?' + url;
            self.$('[data-actions="exportResult"]')
              .attr('href', url);
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  mod.ResultFormRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-receipt-search-result-row',
    onRender: function () {
      var nature = this.model.get('nature');
      switch (nature) {
      case 'RT':
        this.$el.addClass('danger');
        break;
      case 'RC':
        this.$el.addClass('danger');
        break;
      }
    }
  });
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#admin-receipt-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  // Ecran Recherche des quittances
  mod.stepReceiptSearchView = Marionette.Layout.extend({
    template: '#admin-receipt-search-view',
    regions: {
      criteria: '.tkf-criteria',
      receiptsSummary: '.tkf-receiptsSummary',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.receiptCriteria,
        parent: this
      }));
      this.receiptsSummary.show(new app.finance.payment.ReceiptsSummaryView({
        model: mod.controller.receiptsSummary
      }));
      this.results.show(new mod.SearchResults({
        collection: mod.controller.receipts
      }));
    }
  });
  // Critères de recherche de feuilles de caisse
  mod.PaymentSearchCriteria = app.common.CustForm.extend({
    template: _.template($('#admin-payment-search-criteria')
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
      },
      includeDraft: {
        title: 'includeDraft',
        type: 'CustCheckbox'
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
      var self = this;
      if (!error) {
        app.request('admin:paymentSearch', this.model, null)
          .done(function (data) {
            var col = new app.finance.payment.Payments();
            data = _.first(data, 50);
            col.fromRequest(data);
            col.each(function (payment, index) {
              payment.get('premium')
                .set('paid', data[index].premium.paid);
              payment.get('pos')
                .set('code', data[index].pos.code);
            });
            mod.controller.payments.reset(col.models);
            self.$('[data-actions="exportResult"]')
              .removeClass('disabled')
              .addClass('btn-success');
            var url = self.model.buildURL();
            url = 'csv/paymentExport?' + url;
            self.$('[data-actions="exportResult"]')
              .attr('href', url);
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
    template: '#admin-payment-search-result-row',
    templateHelpers: {
      updateStatus: function () {
        return _.updateStatus(this.status);
      },
      paid: function () {
        return this.premium.get('paid');
      },
      getPos: function () {
        return this.pos.get('code');
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
        '/validate', {
          replace: false,
          trigger: true
        });
    },
    exemptPayment: function () {
      mod.router.navigate('payment/' + this.model.get('reference') +
        '/validate', {
          replace: false,
          trigger: true
        });
    },
    events: {
      'click a[data-actions="consultPayment"]': 'consultPayment',
      'click a[data-actions="exemptPayment"]': 'exemptPayment',
    }
  });
  // Tableau de résultats de recherche des feuilles de caisse
  mod.PaymentSearchResults = Marionette.CompositeView.extend({
    template: '#admin-payment-search-result-table',
    itemView: mod.PaymentResultRow,
    itemViewContainer: 'tbody'
  });
  // Ecran de recherche des feuilles de caisse
  mod.PaymentSearchView = Marionette.Layout.extend({
    template: '#admin-payment-search',
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
  // Ecran de consultation de feuille de caisse
  mod.SummaryPaymentView = Marionette.ItemView.extend({
    template: '#admin-payment-fields-view',
    templateHelpers: {
      updateStatus: function () {
        return _.updateStatus(this.status);
      },
      commission: function () {
        //return mod.controller.commission(this);
        return this.premium.get('commission');
      },
      ras: function () {
        // return mod.controller.ras(this);
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
      },
      getPos: function () {
        return this.pos.get('code');
      }
    }
  });
  // Bouton de rejet de feuille de caisse
  mod.RejectionButton = app.common.CustForm.extend({
    template: _.template($('#admin-rejection-button')
      .html()),
    schema: {
      comments: {
        title: 'Commentaires',
        type: 'CustText'
      }
    },
    onValidate: function () {
      this.commit();
      app.request('admin:validate', this.model)
        .done(function () {
          mod.router.navigate('payment', {
            replace: false,
            trigger: true
          });
        })
        .fail(app.fail);
    },
    onReject: function () {
      this.commit();
      app.request('admin:reject', this.model)
        .done(function () {
          mod.router.navigate('payment', {
            replace: false,
            trigger: true
          });
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="validate"]': 'onValidate',
      'click a[data-actions="reject"]': 'onReject'
    }
  });
  // Boutons controler
  mod.ControleButton = app.common.CustForm.extend({
    template: _.template($('#admin-controle-button')
      .html()),
    schema: {
      newLockDate: {
        title: 'Nouvelle date de blocage',
        type: 'CustDate'
      }
    },
    unlockSubscription: function () {
      this.commit();
      var myNewLockDate = moment(this.model.get('newLockDate'))
        .format('YYYY-MM-DD');
      if (moment()
        .isAfter(myNewLockDate) || !moment(myNewLockDate)
        .isValid()) {
        app.alert('Veuillez choisir une date future!');
      }
      else {
        app.request('admin:unlockSubscription', this.model)
          .done(function () {
            app.alert('Déblocage effectué avec succès!');
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="unlockSubscription"]': 'unlockSubscription'
    }
  });
  // Boutons valider , différer et Rejeter
  mod.ValidationButtons = app.common.CustForm.extend({
    template: _.template($('#admin-validation-buttons')
      .html()),
    schema: {
      comments: {
        title: 'Commentaires',
        type: 'CustText'
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="save"]')
        .addClass('disabled');
      this.listenTo(this.model, 'change', function () {
        this.$('[data-actions="save"]')
          .removeClass('disabled');
        this.$('[data-actions="validate"]')
          .addClass('disabled');
        this.$('[data-actions="reject"]')
          .addClass('disabled');
        this.$('[data-actions="delay"]')
          .addClass('disabled');
      });
    },
    onValidate: function () {
      this.commit();
      app.request('admin:validate', this.model)
        .done(function () {
          mod.router.navigate('payment', {
            replace: false,
            trigger: true
          });
        })
        .fail(app.fail);
    },
    onDelay: function () {
      this.commit();
      app.request('admin:delay', this.model)
        .done(function () {
          mod.router.navigate('payment', {
            replace: false,
            trigger: true
          });
        })
        .fail(app.fail);
    },
    onReject: function () {
      this.commit();
      app.request('admin:reject', this.model)
        .done(function () {
          mod.router.navigate('payment', {
            replace: false,
            trigger: true
          });
        })
        .fail(app.fail);
    },
    onSave: function () {
      this.model.manageBalance();
      var self = this;
      app.request('payment:save', this.model)
        .done(function () {
          self.$('[data-actions="save"]')
            .addClass('disabled');
          self.$('[data-actions="validate"]')
            .removeClass('disabled');
          self.$('[data-actions="reject"]')
            .removeClass('disabled');
          self.$('[data-actions="delay"]')
            .removeClass('disabled');
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="validate"]': 'onValidate',
      'click a[data-actions="delay"]': 'onDelay',
      'click a[data-actions="reject"]': 'onReject',
      'click a[data-actions="save"]': 'onSave'
    }
  });
  //Bouton de clôture
  mod.FinalizeButton = app.common.CustForm.extend({
    template: _.template($('#admin-finalize-button')
      .html()),
    schema: {
      comments: {
        title: 'Commentaires',
        type: 'CustText'
      }
    },
    finalize: function () {
      this.commit();
      app.request('admin:finalize', this.model)
        .done(function () {
          mod.router.navigate('payment', {
            replace: false,
            trigger: true
          });
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="finalize"]': 'finalize'
    }
  });
  //Bouton de'annulation de validation
  mod.ReverseValidationButton = app.common.CustForm.extend({
    template: _.template($('#admin-reverse-validation-button')
      .html()),
    schema: {
      comments: {
        title: 'Commentaires',
        type: 'CustText'
      }
    },
    reverseValidation: function () {
      this.commit();
      app.request('admin:reverseValidation', this.model)
        .done(function () {
          mod.router.navigate('payment', {
            replace: false,
            trigger: true
          });
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="reverseValidation"]': 'reverseValidation'
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
  // Ecran de consultation de feuille de caisse
  mod.SummaryPaymentConsultView = Marionette.ItemView.extend({
    template: '#admin-payment-fields-view',
    templateHelpers: {
      updateStatus: function () {
        return _.updateStatus(this.status);
      }
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    }
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
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
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
        paid = -paid;
        return paid;
      }
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    }
  });
  // Zone des feuilles de remboursement
  mod.PartRowView = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-payment-part-row'
  });
  mod.PartsListView = Marionette.CompositeView.extend({
    template: '#admin-payment-parts-table',
    itemView: mod.PartRowView,
    itemViewContainer: 'tbody'
  });
  //Liste des quittances de la feuille de caisse
  mod.ReceiptRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-payment-receipt-delete-row',
    deleteRec: function () {
      var payment = mod.controller.payment;
      var pos = payment.get('pos');
      var receipts = payment.get('receipts');
      var splittedSettlements = payment.get('splittedSettlements');
      var receiptsToDelete = payment.get('receiptsToDelete');
      if (splittedSettlements) {
        receipts.remove(this.model);
        receiptsToDelete.push(this.model.get('reference'));
        this.model.manageReceipt(pos.get('deductedCommission'), pos.get(
          'proratedCommission'));
        payment.updatePayment(this.model.get('reference'));
      }
      else {
        var msg = new app.common.DiagView({
          el: '#modal'
        });
        msg.setTitle('Avertissement');
        var warning = new Backbone.Model();
        warning.validationError =
          'Cette action n\'est pas possible sur cette feuille de caisse';
        var alt = new app.common.ErrorView({
          model: warning
        });
        msg.show(alt);
      }
    },
    events: {
      'click a[data-actions="deleteRec"]': 'deleteRec'
    }
  });
  // TAble des quittances de la feuille de caisse
  mod.ListOfReceiptsConsultView = Marionette.CompositeView.extend({
    template: '#finance-payment-consult-receipts-table',
    itemView: mod.ReceiptRow,
    itemViewContainer: 'tbody'
  });
  // Ecran de validation de feuille de caisse
  mod.PaymentValidateView = Marionette.Layout.extend({
    template: '#admin-payment-validate-view',
    regions: {
      summaryPaymentConsult: '.tkf-summary-payment',
      summaryPaymentAmounts: '.tkf-payment-amounts',
      paymentReservedUse: '.tkf-payment-reserved',
      listReceipts: '.tkf-listReceipts',
      totalReceipts: '.tkf-totalReceipts',
      settlementsList: '.tkf-settlementsList',
      partsList: '.tkf-parts',
      buttons: '.tkf-actions'
    },
    templateHelpers: {
      paymentReference: function () {
        return mod.controller.payment.get('reference');
      }
    },
    onRender: function () {
      var status = mod.controller.payment.get('status');
      this.summaryPaymentConsult.show(new mod.SummaryPaymentConsultView({
        model: mod.controller.payment
      }));
      this.summaryPaymentAmounts.show(new mod.SummaryPaymentAmounts({
        model: mod.controller.payment
      }));
      this.paymentReservedUse.show(new mod.PaymentReservedUse({
        model: mod.controller.payment
      }));
      if (status === 1) {
        this.listReceipts.show(new mod.ListOfReceiptsConsultView({
          collection: mod.controller.payment.get('receipts')
        }));
      }
      else {
        this.listReceipts.show(new app.finance.payment.ListReceiptsConsultView({
          collection: mod.controller.payment.get('receipts')
        }));
      }
      this.settlementsList.show(new mod.SettlementsTableView({
        collection: mod.controller.payment.get('settlements')
      }));
      this.partsList.show(new mod.PartsListView({
        collection: mod.controller.payment.get('parts')
      }));
      this.totalReceipts.show(new app.finance.payment.TotalReceipts({
        model: mod.controller.payment
      }));
      if (status === 0) {
        this.buttons.show(new mod.FinalizeButton({
          model: mod.controller.payment
        }));
      }
      else if (status === 1) {
        this.buttons.show(new mod.ValidationButtons({
          model: mod.controller.payment
        }));
      }
      else if (status === 2) {
        this.buttons.show(new mod.ReverseValidationButton({
          model: mod.controller.payment
        }));
      }
      else if (status === 3) {
        this.buttons.show(new mod.RejectionButton({
          model: mod.controller.payment
        }));
      }
    }
  });
  mod.PaymentReceiptRow = app.common.CustForm.extend({
    template: _.template($('#admin-payment-receipt-row')
      .html()),
    schema: {
      effectiveDate: {
        title: 'Nouvelle date',
        type: 'CustDate'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      //  return this;
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    postpone: function () {
      this.commit();
      var receipts = mod.controller.payment.get('receipts');
      var reference = mod.controller.payment.get('reference');
      var postponedTo = moment(this.model.attributes.postponedTo)
        .format('YYYY-MM-DD');
      if (moment()
        .isAfter(postponedTo) || !moment(postponedTo)
        .isValid()) {
        app.alert('Veuillez choisir une future date');
        return;
      }
      else {
        receipts.remove(this.model);
        app.request('admin:postpone', this.model, reference)
          .done(function () {
            app.alert('Quittance reportée avec succés!');
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="postpone"]': 'postpone'
    }
  });
  // Table des quittances de la feuille de caisse
  mod.ListReceiptsConsultView = Marionette.CompositeView.extend({
    template: '#admin-payment-receipts-table',
    itemView: mod.PaymentReceiptRow,
    itemViewContainer: 'tbody'
  });
  // Ecran de Controle de feuille de caisse
  mod.PaymentControleView = Marionette.Layout.extend({
    template: '#admin-payment-controle-view',
    regions: {
      summaryPaymentConsult: '.tkf-summary-payment',
      summaryPaymentAmounts: '.tkf-payment-amounts',
      paymentReservedUse: '.tkf-payment-reserved',
      listReceipts: '.tkf-listReceipts',
      totalReceipts: '.tkf-totalReceipts',
      settlementsList: '.tkf-settlementsList',
      partsList: '.tkf-parts',
      buttons: '.tkf-actions'
    },
    templateHelpers: {
      paymentReference: function () {
        return mod.controller.payment.get('reference');
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
      if (mod.controller.payment.get('status') !== 0) {
        this.listReceipts.show(new mod.app.finance.payment.ListReceiptsConsultView({
          collection: mod.controller.payment.get('receipts')
        }));
        this.totalReceipts.show(new app.finance.payment.TotalReceipts({
          model: mod.controller.payment
        }));
      }
      else {
        this.listReceipts.show(new mod.ListReceiptsConsultView({
          collection: mod.controller.payment.get('receipts')
        }));
      }
      this.settlementsList.show(new mod.SettlementsTableView({
        collection: mod.controller.payment.get('settlements')
      }));
      this.partsList.show(new mod.PartsListView({
        collection: mod.controller.payment.get('parts')
      }));
      this.buttons.show(new mod.ControleButton({
        model: mod.controller.payment
      }));
    }
  });
});
