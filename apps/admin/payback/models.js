main.module('admin.payback', function (mod, app, Backbone, Marionette, $, _) {
  mod.Payback = Backbone.Model.extend({
    /*
     * reference : 0 (reference de la feuille de remboursement)
     * creationDate : date (date de création de la feuille de remboursement)
     * closingDate : date (date de clôture de la feuille de remboursement)
     * pos : string (pos de la feuille de remboursement)
     * status : number (0 : préparé, 1 : soumis, 2 : validé, 3 : annulé)
     * payments : (liste des feuilles de caisse)
     * settlement : table des données de règlements
     */
    dateAttributes: ['creationDate', 'closingDate'],
    defaults: function () {
      return {
        reference: 0,
        creationDate: null,
        closingDate: null,
        pos: null,
        status: 0,
        paymentBalance: 0,
        balance: 0,
        premium: new app.finance.payment.Premium(),
        payments: new app.finance.payment.Payments(),
        settlements: new app.finance.payment.Settlements()
      };
    },
    updatePayback: function () {
      var payments = this.get('payments');
      var settlements = this.get('settlements');
      var premium = this.get('premium');
      var comToPay = 0;
      var paidCom = 0;
      var paymentBalance = 0;
      var ras = 0;
      var toPay = 0;
      var total = 0;
      var balance = 0;
      payments.each(function (payment) {
        comToPay += payment.get('premium')
          .get('commissionToPay');
        paymentBalance += payment.get('balance');
        ras += -payment.get('premium')
          .get('ras');
      });
      settlements.each(function (settlement) {
        paidCom += settlement.get('amount');
      });
      toPay = comToPay + ras;
      paymentBalance = _.fixNumber(paymentBalance, 3);
      toPay = _.fixNumber(toPay, 3);
      total = toPay + paymentBalance;
      total = _.fixNumber(total, 3);
      ras = _.fixNumber(ras, 3);
      comToPay = _.fixNumber(comToPay, 3);
      paidCom = _.fixNumber(paidCom, 3);
      balance = paidCom + total;
      balance = _.fixNumber(balance, 3);
      this.set('paymentBalance', paymentBalance);
      this.set('balance', balance);
      premium.set('commissionToPay', comToPay);
      premium.set('paid', paidCom);
      premium.set('toPay', toPay);
      premium.set('ras', ras);
      premium.set('total', total);
      premium.trigger('set', 'on');
    },
    updatePayment: function (payment) {
      var premium = payment.get('premium');
      var comToPay = premium.get('commissionToPay');
      var posRas = payment.get('pos')
        .get('ras');
      var ras = comToPay * posRas;
      var toPay = comToPay - ras;
      toPay = _.fixNumber(toPay, 3);
      ras = _.fixNumber(ras, 3);
      premium.set('ras', ras);
      premium.set('toPay', toPay);
    },
    checkPaybackSettlements: function () {
      var settlements = this.get('settlements');
      var absTotal = 0;
      var result = true;
      var error =
        'Erreur! Le montant à régler doit correspondre à la commission nette de la retenue à la source en considérant le solde des feuilles de caisse.';
      var warning =
        'Avertissement! Le montant payé est supérieur au montant demandé.';
      var total = this.get('premium')
        .get('total');
      if (total <= 0) {
        absTotal = Math.abs(total);
        var settlementToPay = 0;
        settlements.each(function (settlement) {
          settlementToPay += settlement.get('amount');
        });
        if (settlementToPay > absTotal) {
          var warningPayment = this.get('warning');
          if (!warningPayment) {
            this.set('warning', warning);
            result = false;
          }
          else {
            result = true;
          }
        }
        else if (!_.isEqualAmounts(settlementToPay, absTotal)) {
          this.set('error', error);
          result = false;
        }
      }
      else {
        result = true;
      }
      return result;
    },
    checkSettlementData: function () {
      var settlements = this.get('settlements');
      var result = true;
      var error =
        'Erreur! Veuillez vérifier les données du règlement.';
      var self = this;
      settlements.each(function (settlement) {
        if ((settlement.get('amount') === null) || (settlement.get(
            'payments') === []) || (settlement.get('payments') ===
            '')) {
          self.set('error', error);
          result = false;
        }
        if (settlement.get('mode') !== 1 && settlement.get('mode') !==
          6) {
          if ((settlement.get('reference') === null) || (
              settlement.get('bank') === '')) {
            self.set('error', error);
            result = false;
          }
          if ((settlement.get('mode') === 2) || (settlement.get(
              'mode') === 3)) {
            if (settlement.get('date') === null) {
              self.set('error', error);
              result = false;
            }
          }
        }
      });
      return result;
    },
    checkSettlement: function (settlement) {
      var result = true;
      var error =
        'Erreur! Veuillez vérifier les données du règlement.';
      var mode = settlement.get('mode');
      if (mode !== '') {
        settlement.set('mode', parseInt(mode));
      }
      if (settlement.get('amount') === null) {
        this.trigger('errorAmount', 'Le montant est obligatoire');
        this.set('error', error);
        result = false;
      }
      if (mode === '') {
        this.trigger('errorMode', 'Le mode est obligatoire');
        this.set('error', error);
        result = false;
      }
      if (settlement.get('mode') !== 1 && settlement.get('mode') !==
        6) {
        if ((settlement.get('reference') === '') || (settlement.get(
            'bank') === '')) {
          if (settlement.get('reference') === '') {
            this.trigger('errorReference', 'N° est obligatoire');
          }
          if (settlement.get('bank') === '') {
            this.trigger('errorBank', 'La banque est obligatoire');
          }
          this.trigger('erre', 'ttt');
          this.set('error', error);
          result = false;
        }
        if ((settlement.get('mode') === 2) || (settlement.get('mode') ===
            3)) {
          if (settlement.get('date') === null) {
            this.set('error', error);
            this.trigger('errorDate', 'Date chèque est obligatoire');
            result = false;
          }
        }
      }
      return result;
    },
    addSettlement: function (settlementToAdd) {
      var mode = settlementToAdd.get('mode');
      settlementToAdd.set('mode', parseInt(mode));
      var listSettlements = this.get('settlements');
      var payments = settlementToAdd.get('payments');
      var added = false;
      listSettlements.each(function (settlement) {
        var amount = settlement.get('amount');
        var reference = settlement.get('reference');
        var mode = settlement.get('mode');
        var bank = settlement.get('bank');
        if ((reference === settlementToAdd.get('reference')) && (
            mode === settlementToAdd.get('mode')) && (bank ===
            settlementToAdd.get('bank'))) {
          var amountToAdd = settlementToAdd.get('amount') +
            amount;
          settlement.set('amount', amountToAdd);
          if (!(_.contains(settlement.get('payments'), payments)) &&
            (payments !== '')) {
            var clonedPayments = _.clone(settlement.get(
              'payments'));
            clonedPayments.push(payments);
            settlement.set('payments', clonedPayments);
          }
          added = true;
        }
      });
      if (!added) {
        var settlement = new app.finance.payment.Settlement();
        settlement.set('mode', settlementToAdd.get('mode'));
        var settlementAmount = settlementToAdd.get('amount');
        settlementAmount = _.fixNumber(settlementAmount, 3);
        settlement.set('amount', settlementAmount);
        settlement.set('date', settlementToAdd.get('date'));
        settlement.set('reference', settlementToAdd.get('reference'));
        settlement.set('bank', settlementToAdd.get('bank'));
        if (payments !== '') {
          settlement.get('payments')
            .push(payments);
        }
        listSettlements.add(settlement);
      }
      this.set('settlements', listSettlements);
      listSettlements.trigger('set', 'on');
      return listSettlements;
    }
  });
  mod.Paybacks = Backbone.Collection.extend({
    model: mod.Payback
  });
  mod.PaybackCriteria = Backbone.Model.extend({
    dateAttributes: ['fromCreationDate', 'toCreationDate',
      'fromClosingDate', 'toClosingDate'
    ],
    defaults: {
      pos: null,
      reference: null,
      status: null,
      nonZeroBalance: false,
      fromCreationDate: null,
      toCreationDate: null,
      fromClosingDate: null,
      toClosingDate: null,
      settlementReference: null
    }
  });
});
