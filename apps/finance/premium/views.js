/*jslint browser:true */
main.module('finance.premium', function (mod, app, Backbone, Marionette, $, _) {
  mod.ReceiptConsultView = Marionette.Layout.extend({
    template: '#finance-premium-consult-view',
    regions: {
      header: '.tkf-header',
      premium: '.tkf-premium',
      summary: '.tkf-summary',
      details: '.tkf-details',
      payment: '.tkf-payment',
      paymentList: '.tkf-payment-list',
      premiumActions: '.tkf-premium-actions'
    },
    onRender: function () {
      var premium = mod.controller.container.get('premium');
      var settlement = mod.controller.container.get('settlement');
      var settlements = mod.controller.container.get('settlements');
      var premiumGenerate = mod.controller.container.get(
        'premiumgenerate');
      var coverages = mod.controller.container.get('coverages');
      this.header.show(new mod.PremiumConsultHeader({
        model: premium
      }));
      this.premium.show(new mod.PremiumConsult({
        model: premium
      }));
      this.summary.show(new mod.PremiumConsultSummary({
        model: premium
      }));
      this.details.show(new mod.PremiumCoveragesList({
        collection: coverages
      }));
      this.payment.show(new mod.PremiumSettlement({
        model: settlement
      }));
      this.paymentList.show(new mod.PremiumSettlementList({
        collection: settlements
      }));
      this.premiumActions.show(new mod.PremiumActions({
        model: premiumGenerate
      }));
    }
  });
  mod.PremiumConsultHeader = Marionette.ItemView.extend({
    template: '#finance-premium-consult-header'
  });
  mod.PremiumConsult = Marionette.ItemView.extend({
    template: '#finance-premium-consult'
  });
  mod.PremiumConsultSummary = Marionette.ItemView.extend({
    template: '#finance-premium-consult-summary',
    templateHelpers: {
      getStamps: function () {
        var stamps = this.stamps;
        var result = '';
        _.each(stamps, function (stamp) {
          if (result === '') {
            result = stamp.code + ' : ' + _.beautifyAmount(stamp.amount);
          }
          else {
            result = result + '<br/>' + stamp.code + ' : ' + _.beautifyAmount(
              stamp.amount);
          }
        });
        return result;
      },
      getTaxes: function () {
        var taxes = this.taxes;
        var result = '';
        _.each(taxes, function (taxe) {
          if (result === '') {
            result = taxe.code + ' : ' + _.beautifyAmount(taxe.amount);
          }
          else {
            result = result + '<br/>' + taxe.code + ' : ' + _.beautifyAmount(
              taxe.amount);
          }
        });
        return result;
      }
    }
  });
  //COVERAGES
  mod.PremiumCoveragesRow = Marionette.ItemView.extend({
    template: '#finance-premium-coverages-row',
    tagName: 'tr'
  });
  mod.PremiumCoveragesList = Marionette.CompositeView.extend({
    template: '#finance-premium-coverages-table',
    templateHelpers: {
      getTotals: function (field) {
        var coverages = mod.controller.container.get('coverages');
        var result = 0;
        if (field === 'amount') {
          coverages.each(function (item) {
            result += item.get('amount');
          });
        }
        if (field === 'tua') {
          coverages.each(function (item) {
            result += item.get('tua');
          });
        }
        if (field === 'fg') {
          coverages.each(function (item) {
            result += item.get('fg');
          });
        }
        if (field === 'commission') {
          coverages.each(function (item) {
            result += item.get('commission');
          });
        }
        return result;
      }
    },
    itemView: mod.PremiumCoveragesRow,
    itemViewContainer: 'tbody'
  });
  mod.PremiumSettlement = app.common.CustForm.extend({
    template: _.template($('#finance-premium-settlement-form')
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
      var premium = mod.controller.container.get('premium');
      this.listenTo(premium, 'change:remainingAmount', function () {
        var prem = mod.controller.container.get('premium');
        var remaining = prem.get('remainingAmount');
        this.setValue('amount', remaining.toFixed(3));
      });
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      var premium = mod.controller.container.get('premium');
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.onModeChange();
        this.initEvents();
        this.setValue('amount', premium.get('total')
          .toFixed(3));
      }, this), 0);
      return this;
    },
    addPayment: function () {
      var settlements = mod.controller.container.get('settlements');
      var premium = mod.controller.container.get('premium');
      var remainingAmont = premium.get('remainingAmount')
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
        premium.set('remainingAmount', remaining);
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
  mod.PremiumSettlementRow = Marionette.ItemView.extend({
    template: '#finance-premium-settlement-row',
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
        else if (mode === '6') {
          return 'Prélevement bancaire';
        }
      }
    },
    erase: function () {
      var settlements = mod.controller.container.get('settlements');
      var premium = mod.controller.container.get('premium');
      var remainingAmount = premium.get('remainingAmount');
      premium.set('remainingAmount', remainingAmount + this.model.get(
        'amount'));
      settlements.remove(this.model);
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  mod.PremiumSettlementList = Marionette.CompositeView.extend({
    template: '#finance-premium-settlement-table',
    itemView: mod.PremiumSettlementRow,
    itemViewContainer: 'tbody'
  });
  // Ecran des actions
  mod.PremiumActions = app.common.CustForm.extend({
    template: _.template($('#finance-premium-generate')
      .html()),
    schema: {
      reportText: {
        title: 'Signaler une anomalie',
        type: 'CustText'
      }
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      this.$('.tkf-message-text')
        .addClass('hidden');
    },
    generateReceipt: function () {
      this.commit();
      var self = this;
      self.$('.tkf-message-text')
        .addClass('hidden');
      var premium = mod.controller.container.get('premium');
      var settlements = mod.controller.container.get('settlements');
      app.request('premium:receipt:generate', {
          premium: premium,
          settlements: settlements
        })
        .done(function (data) {
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(data.rcdoc);
          /*
          var pdfname = data.docname;
          var doc = data.pdfid;
          var lob = '/all/receipt';
          var link = document.createElement('a');
          link.download = pdfname;
          link.href = 'doc?doc=' + pdfname + '&lob=' + lob + '&id=' +
            doc;
          link.click();
          */
        })
        .fail(function (data) {
          self.$('.tkf-message-text')
            .removeClass('bg-success');
          self.$('.tkf-message-text')
            .addClass('bg-danger');
          self.$('.tkf-message-text')
            .removeClass('hidden');
          self.$('.tkf-message-text')
            .text(data.responseText);
        });
    },
    generateMemoir: function () {
      this.commit();
      var self = this;
      self.$('.tkf-message-text')
        .addClass('hidden');
      var premium = mod.controller.container.get('premium');
      app.request('premium:memoir:generate', {
          premium: premium
        })
        .done(function () {})
        .fail(function () {});
    },
    sendError: function () {
      this.commit();
      var self = this;
      self.$('.tkf-message-text')
        .addClass('hidden');
      var reportText = self.model.get('reportText');
      var premium = mod.controller.container.get('premium');
      if (reportText === '') {
        self.$('.tkf-message-text')
          .removeClass('bg-success');
        self.$('.tkf-message-text')
          .addClass('bg-danger');
        self.$('.tkf-message-text')
          .removeClass('hidden');
        self.$('.tkf-message-text')
          .text('Spécifiez un message');
        return false;
      }
      app.request('premium:senderror', {
          premium: premium,
          reportText: reportText
        })
        .done(function () {
          self.$('.tkf-message-text')
            .removeClass('bg-danger');
          self.$('.tkf-message-text')
            .addClass('bg-success');
          self.$('.tkf-message-text')
            .removeClass('hidden');
          self.$('.tkf-message-text')
            .text('Message envoyé');
          self.disable('reportText', true);
          self.$('a[data-actions="sendError"]')
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
      'click a[data-actions="generateReceipt"]': 'generateReceipt',
      'click a[data-actions="sendError"]': 'sendError',
      'click a[data-actions="generateMemoir"]': 'generateMemoir'
    }
  });
  // Formulaire de recherche des contributions
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#finance-premium-search-criteria')
      .html()),
    schema: {
      policyReference: {
        title: 'N° Contrat',
        type: 'CustNumber',
        validators: ['required']
      },
      fromDate: {
        title: 'Création du',
        type: 'CustDate',
        validators: ['required']
      },
      toDate: {
        title: 'Création au',
        type: 'CustDate',
        validators: ['required']
      }
    },
    search: function () {
      var error = this.commit();
      if (!error) {
        app.request('premium:search', this.model)
          .done(function (data) {
            mod.controller.receipts.reset();
            var result = _.first(data, 50);
            mod.controller.receipts.fromRequest(result);
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search'
    }
  });
  // Liste des contributions, résultat de recherche
  mod.ResultReceiptRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#finance-premium-search-result-row',
    onRender: function () {
      var premiumStatus = this.model.get('premiumStatus');
      switch (premiumStatus) {
      case 0:
        this.$el.addClass('success');
        this.$('.btn')
          .addClass('btn-success');
        break;
      case 1:
        this.$el.addClass('danger');
        this.$('.btn')
          .addClass('btn-warning');
        break;
      }
    },
    consult: function () {
      var premiumStatus = this.model.get('premiumStatus');
      var raisedDate = this.model.get('raisedDate');
      var nTimeStamp;
      if (moment(raisedDate)
        .isDST()) {
        nTimeStamp = parseInt(moment(raisedDate)
          .utc()
          .format('X')) + 3600;
      }
      else {
        nTimeStamp = moment(raisedDate)
          .format('X');
      }
      switch (premiumStatus) {
      case 0:
        mod.router.navigate('premium/' + this.model.get('contract') +
          '/' + nTimeStamp + '/consult', {
            replace: false,
            trigger: true
          });
        break;
      case 1:
        mod.router.navigate('receipt/' + this.model.get('reference') +
          '/consult', {
            replace: false,
            trigger: true
          });
        break;
      }
    },
    events: {
      'click a[data-actions="consult"]': 'consult',
    }
  });
  // Table de résultats de recherche des contributions
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#finance-premium-search-result-table',
    itemView: mod.ResultReceiptRow,
    itemViewContainer: 'tbody'
  });
  // Ecran de recherche des contributions
  mod.SearchLayout = Marionette.Layout.extend({
    template: '#finance-premium-search-view',
    regions: {
      criteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.criteria
      }));
      this.results.show(new mod.SearchResults({
        collection: mod.controller.receipts
      }));
    },
  });
});
