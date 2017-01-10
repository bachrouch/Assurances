main.module('finance.receipt', function (mod, app, Backbone, Marionette, $, _) {
  mod.ReceiptConsultView = Marionette.Layout.extend({
    template: '#finance-receipt-consult-view',
    regions: {
      header: '.tkf-header',
      actions: '.tkf-actions',
      receipt: '.tkf-receipt',
      payments: '.tkf-payments',
      parts: '.tkf-parts',
      summary: '.tkf-summary'
    },
    onRender: function () {
      var receipt = mod.controller.container.get('receipt');
      var parts = mod.controller.container.get('parts');
      var summary = mod.controller.container.get('summary');
      var payments = mod.controller.container.get('payments');
      this.header.show(new mod.ReceiptConsultHeader({
        model: receipt
      }));
      this.actions.show(new mod.PrintButton({
        model: receipt
      }));
      this.receipt.show(new mod.ReceiptConsult({
        model: receipt
      }));
      this.summary.show(new mod.ReceiptConsultSummary({
        model: summary
      }));
      this.payments.show(new mod.ReceiptConsultPaymentTable({
        collection: payments
      }));
      this.parts.show(new mod.ReceiptConsultPartsTable({
        collection: parts
      }));
    }
  });
  mod.ReceiptConsultHeader = Marionette.ItemView.extend({
    template: '#finance-receipt-consult-header'
  });
  //Bouton d'impression
  mod.PrintButton = Marionette.ItemView.extend({
    template: '#finance-receipt-print-button'
  });
  mod.ReceiptConsult = Marionette.ItemView.extend({
    template: '#finance-receipt-consult'
  });
  mod.ReceiptConsultSummary = Marionette.ItemView.extend({
    template: '#finance-receipt-consult-summary',
    templateHelpers: {
      getStamps: function () {
        var stamps = this.stamps;
        var result = '';
        stamps.each(function (stamp) {
          if (result === '') {
            result = stamp.get('code') + ' : ' + _.beautifyAmount(
              stamp.get('amount'));
          }
          else {
            result = result + '<br/>' + stamp.get('code') + ' : ' +
              _.beautifyAmount(stamp.get('amount'));
          }
        });
        return result;
      },
      getTaxes: function () {
        var taxes = this.taxes;
        var result = '';
        taxes.each(function (taxe) {
          if (result === '') {
            result = taxe.get('code') + ' : ' + _.beautifyAmount(
              taxe.get('amount'));
          }
          else {
            result = result + '<br/>' + taxe.get('code') + ' : ' +
              _.beautifyAmount(taxe.get('amount'));
          }
        });
        return result;
      }
    },
  });
  mod.ReceiptConsultPaymentRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#finance-receipt-consult-payment-row',
    templateHelpers: {
      updatePaymentMode: function () {
        return _.updateSettlementMode(this.mode);
      }
    }
  });
  mod.ReceiptConsultPaymentTable = Marionette.CompositeView.extend({
    template: '#finance-receipt-consult-payment-table',
    itemView: mod.ReceiptConsultPaymentRow,
    itemViewContainer: 'tbody'
  });
  mod.ReceiptConsultPartsRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#finance-receipt-consult-parts-row'
  });
  mod.ReceiptConsultPartsTable = Marionette.CompositeView.extend({
    template: '#finance-receipt-consult-parts-table',
    itemView: mod.ReceiptConsultPartsRow,
    itemViewContainer: 'tbody'
  });
  // Formulaire de recherche des quittances
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#finance-receipt-export-search-criteria')
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
        app.request('receipt:search', this.model, null, true)
          .done(function (data) {
            mod.controller.receipts.reset();
            mod.controller.receiptsSummary.summarizeReceipts(data);
            var result = _.first(data, 50);
            mod.controller.receipts.fromRequest(result);
            _.each(result, function (receipt, index) {
              var payments = receipt.payments;
              mod.controller.receipts.at(index)
                .set('payments', payments);
            });
            self.$('[data-actions="exportResult"]')
              .removeClass('disabled')
              .addClass('btn-success');
            var url = self.model.buildURL();
            url = 'csv?' + url;
            self.$('[data-actions="exportResult"]')
              .attr('href', url);
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search'
    }
  });
  // Liste des quittances, résultat de recherche
  mod.ResultReceiptRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#finance-receipt-search-result-global-row',
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
    },
    consult: function () {
      mod.router.navigate('receipt/' + this.model.get('reference') +
        '/consult', {
          replace: false,
          trigger: true
        });
    },
    events: {
      'click a[data-actions="consult"]': 'consult',
    }
  });
  // Table de résultats de recherche des quittances
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#finance-receipt-global-search-table',
    itemView: mod.ResultReceiptRow,
    itemViewContainer: 'tbody'
  });
  // message Informatif
  mod.InformationView = Marionette.ItemView.extend({
    template: '#finance-receipt-information',
    templateHelpers: {
      moreThan50: function () {
        if (mod.controller.receiptsSummary.get('totalReceipts') > 50) {
          return ('(<b>50</b> premiers enregistrements)');
        }
      }
    },
    initialize: function () {
      this.listenTo(mod.controller.receipts, 'change', this.render);
    }
  });
  // Ecran de recherche des quittances
  mod.SearchLayout = Marionette.Layout.extend({
    template: '#finance-receipt-global-search-view',
    regions: {
      criteria: '.tkf-criteria',
      receiptsSummary: '.tkf-receiptsSummary',
      information: '.tkf-info',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.criteria,
        parent: this
      }));
      this.receiptsSummary.show(new app.finance.payment.ReceiptsSummaryView({
        model: mod.controller.receiptsSummary
      }));
      this.information.show(new mod.InformationView({
        model: mod.controller.receiptsSummary
      }));
      this.results.show(new mod.SearchResults({
        collection: mod.controller.receipts
      }));
    },
  });
});
