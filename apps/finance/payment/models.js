main.module('finance.payment', function (mod, app, Backbone, Marionette, $, _) {
  mod.POS = Backbone.Model.extend({
    defaults: function () {
      return {
        code: 0,
        deductedCommission: 0,
        proratedCommission: 0,
        ras: 0
      };
    }
  });
  mod.ReceiptsSummary = Backbone.Model.extend({
    /*
totalreceipts :number (Nombre total des quittances)
totalAmount : number (Montant total TTC)
totalDue : number (Montant total non payé)

    */
    defaults: function () {
      return {
        totalReceipts: 0,
        totalAmount: 0,
        totalDue: 0
      };
    },
    summarizeReceipts: function (data) {
      var totalReceipts = data.length;
      this.set('totalReceipts', totalReceipts);
      var totalAmount = 0;
      var totalDue = 0;
      var totalCommission = 0;
      _.each(data, function (receipt) {
        totalAmount += receipt.summary.total;
        totalDue += receipt.recovery.due;
        totalCommission += receipt.summary.commission;
      });
      totalAmount = _.fixNumber(totalAmount, 3);
      totalDue = _.fixNumber(totalDue, 3);
      totalDue = _.fixNumber(totalDue, 3);
      this.set('totalAmount', totalAmount);
      this.set('totalDue', totalDue);
      this.set('totalCommission', totalCommission);
    }
  });
  mod.Receipt = Backbone.Model.extend({
    /*
* reference : number (référence de la quittance)
* date : date (date effective de la quittance)
* nature : string (nature de la quittance : comptant, avenant, ...)
* contract : number (référence de la police)
* subscriberName : string (Nom du souscripteur)
* total : number (montant TTC)
* totalCommission : number (montant de la commission)
* due : number (montant restant par rapport au TTC)
* toAffect : number (montant à payer)
* deductedCommission : number (montant de commission déduite)
* ras : number (Retenue à la source)
* toPay : number (Net à payer)

*/
    dateAttributes: ['date', 'fromDate', 'toDate', 'effectiveDate',
      'reviewDate', 'newLockDate'
    ],
    defaults: function () {
      return {
        reference: 0,
        date: null,
        isNotDeletable: false,
        nature: null,
        subscriberName: null,
        contract: 0,
        total: 0,
        totalCommission: 0,
        due: 0,
        toAffect: 0,
        commissionAffected: 0,
        commissionToPay: 0,
        toPay: 0,
        endorsement: 0,
        effectiveDate: null,
        payments: []
      };
    },
    manageReceipt: function (deductedCommission, proratedCommission) {
      var total = this.get('total');
      var totalCommission = this.get('totalCommission');
      var due = this.get('due');
      var toAffect = this.get('toAffect');
      var commissionAffected = this.get('commissionAffected');
      var toPay = this.get('toPay');
      var commissionToPay = this.get('commissionToPay');
      commissionAffected = 0;
      commissionToPay = 0;
      var payCommission = false;
      toPay = 0;
      if (!deductedCommission) {
        toPay = toAffect;
        payCommission = _.isEqualAmounts(due, toAffect);
        if (payCommission) {
          commissionToPay = totalCommission;
        }
      }
      else {
        if (proratedCommission) {
          var percent = toAffect / total;
          commissionAffected = -percent * totalCommission;
        }
        else {
          payCommission = _.isEqualAmounts(due, toAffect);
          if (payCommission) {
            commissionAffected = -totalCommission;
          }
        }
        toPay = toAffect + commissionAffected; //+ ras;
      }
      if (due === 0) {
        due = total;
      }
      commissionAffected = _.fixNumber(commissionAffected, 3);
      toPay = _.fixNumber(toPay, 3);
      commissionToPay = _.fixNumber(-commissionToPay, 3);
      this.set('commissionAffected', commissionAffected);
      this.set('toPay', toPay);
      this.set('commissionToPay', commissionToPay);
      return this;
    }
  });
  mod.Receipts = Backbone.Collection.extend({
    model: mod.Receipt
  });
  mod.Settlement = Backbone.Model.extend({
    /*
     * mode : number (0:virement, 1 : espèces/Versement, 2: chèque, 3: traite)
     * amount : number (montant total du règlement)
     * date : date (date du règlement : date du jour par défaut, modifiable)
     * Num: number (numéro de la pièce de règlement : num de chèque ou référence virement)
     * bank : string (Nom de la banque)
     */
    dateAttributes: ['date'],
    defaults: function () {
      return {
        mode: null,
        amount: null,
        date: null,
        reference: null,
        bank: '',
        receipts: [],
        payments: [],
        isSplitted: true
      };
    }
  });
  mod.Settlements = Backbone.Collection.extend({
    model: mod.Settlement
  });
  mod.Premium = Backbone.Model.extend({
    /*
     * total : number (Montant TTC)
     * commission : number (montant de la commission)
     * due : number (montant restant par rapport au TTC)
     * toAffect : number (montant à payer)
     * deductedCommission : number (montant de commission déduite)
     * ras : number (Retenue à la source)
     * toPay : number (Net à payer)
     * commissionToPay : number (commission à payer à l'intermédiaire)
     */
    defaults: function () {
      return {
        total: 0,
        commission: 0,
        commissionToPay: 0,
        ras: 0,
        affected: 0,
        due: 0,
        toPay: 0,
        paid: 0
      };
    }
  });
  mod.Payment = Backbone.Model.extend({
    /*
     * reference : 0 (reference de la feuille de caisse)
     * date : date (date de création de la feuille de caisse)
     * pos : string (pos de la feuille de caisse)
     * status : number (0 : préparé, 1 : soumis, 2 : validé, 3 : annulé)
     * solde
     * receipts : (liste des quittances)
     * settlement : table des données de règlements
     */
    dateAttributes: ['creationDate', 'closingDate'],
    defaults: function () {
      return {
        reference: 0,
        creationDate: null,
        closingDate: null,
        pos: new mod.POS(),
        status: 0,
        balance: 0,
        comments: '',
        premium: new mod.Premium(),
        receipts: new mod.Receipts(),
        settlements: new mod.Settlements(),
        parts: new app.finance.receipt.Parts()
      };
    },
    updatePayment: function () {
      var rateRas = this.get('pos')
        .get('ras');
      var total = 0;
      var commission = 0;
      var toPay = 0;
      var ras = 0;
      var affected = 0;
      var due = 0;
      var paid = 0;
      var commissionToPay = 0;
      var receipts = this.get('receipts');
      var settlements = this.get('settlements');
      var self = this;
      var premium = self.get('premium');
      receipts.each(function (receipt) {
        total += receipt.get('total');
        commission += receipt.get('commissionAffected');
        //  ras += receipt.get('ras');
        toPay += receipt.get('toPay');
        affected += receipt.get('toAffect');
        due = toPay - affected;
        commissionToPay += receipt.get('commissionToPay');
      });
      settlements.each(function (settlement) {
        paid += settlement.get('amount');
      });
      if (rateRas > 0) {
        ras = -rateRas * commission;
      }
      total = _.fixNumber(total, 3);
      commission = _.fixNumber(commission, 3);
      ras = _.fixNumber(ras, 3);
      toPay = _.fixNumber(toPay, 3);
      affected = _.fixNumber(affected, 3);
      due = _.fixNumber(due, 3);
      paid = _.fixNumber(paid, 3);
      commissionToPay = _.fixNumber(commissionToPay, 3);
      premium.set('total', total);
      premium.set('commission', commission);
      premium.set('ras', ras);
      premium.set('toPay', toPay);
      premium.set('affected', affected);
      premium.set('due', due);
      premium.set('paid', paid);
      premium.set('commissionToPay', commissionToPay);
      premium.trigger('set', 'on');
    },
    checkReceiptsAmount: function () {
      var error =
        'Erreur! Le montant à payer pour chaque quittance ne doit pas dépasser le montant non payé.';
      var result = true;
      var receipts = this.get('receipts');
      var self = this;
      receipts.each(function (receipt) {
        var toAffect = receipt.get('toAffect');
        var due = receipt.get('due');
        if (toAffect > due) {
          self.set('error', error);
          result = false;
        }
      });
      return result;
    },
    checkLastSettlement: function () {
      return true;
      // for the moment return true , no check for the last settlement
      /* var pos = this.get('pos');
      var deducted = pos.get('deductedCommission');
      var result = true;
      if (!deducted) {
        var error =
          'Seul le dernier règlement peut ne pas contenir de quittances!';
        var settlements = this.get('settlements');
        var size = _.size(settlements);
        if (size > 0) {
          var last = settlements.at(size - 1);
          if (_.size(last.get('receipts')) === 0) {
            this.set('error', error);
            result = false;
          }
        }
      }
      return result;*/
    },
    checkPaymentSettlements: function () {
      var settlements = this.get('settlements');
      var result = true;
      var error =
        'Erreur! Le montant à régler doit correspondre au net à payer et à la retenue à la source de la feuille de caisse.';
      var warning =
        'Avertissement! Le montant payé est supérieur au montant demandé.';
      var toPay = this.get('premium')
        .get('toPay') + this.get('premium')
        .get('ras');
      if (toPay >= 0) {
        var settlementToPay = 0;
        settlements.each(function (settlement) {
          settlementToPay += settlement.get('amount');
        });
        settlementToPay = _.fixNumber(settlementToPay, 3);
        toPay = _.fixNumber(toPay, 3);
        if (settlementToPay > toPay) {
          var warningPayment = this.get('warning');
          if (!warningPayment) {
            this.set('warning', warning);
            result = false;
          }
          else {
            result = true;
          }
        }
        else if (!_.isEqualAmounts(settlementToPay, toPay)) {
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
            'receipts') === []) || (settlement.get('receipts') ===
            '')) {
          self.set('error', error);
          result = false;
        }
        if ((settlement.get('mode') !== 1) && (settlement.get(
            'mode') !== 5)) {
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
      var pos = this.get('pos');
      var code = pos.get('code');
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
      if ((parseInt(code.charAt(0)) === 1) && (settlement.get(
          'receipts') === '')) {
        this.trigger('errorReceipts', 'La quittance est obligatoire');
        this.set('error', error);
        result = false;
      }
      if (mode === '') {
        this.trigger('errorMode', 'Le mode est obligatoire');
        this.set('error', error);
        result = false;
      }
      if ((settlement.get('mode') !== 1) && (settlement.get('mode') !==
          6) && (settlement.get('mode') !== 5)) {
        if ((settlement.get('reference') === '') || (settlement.get(
            'bank') === '')) {
          if (settlement.get('reference') === '') {
            this.trigger('errorReference', 'N° est obligatoire');
            result = false;
          }
          if (settlement.get('bank') === '') {
            this.trigger('errorBank', 'La banque est obligatoire');
            result = false;
          }
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
    manageBalance: function () {
      var settlements = this.get('settlements');
      var receipts = this.get('receipts');
      var ras = this.get('premium')
        .get('ras');
      var totalSettled = 0;
      var totalToPay = 0;
      var amount = 0;
      var balance = 0;
      settlements.each(function (settlement) {
        amount = settlement.get('amount');
        amount = _.fixNumber(amount, 3);
        totalSettled += amount;
      });
      receipts.each(function (receipt) {
        amount = receipt.get('toPay');
        amount = _.fixNumber(amount, 3);
        totalToPay = totalToPay + amount;
      });
      if (totalSettled > 0) {
        totalToPay = Math.abs(totalToPay);
      }
      balance = totalToPay + Math.abs(ras) - Math.abs(totalSettled);
      balance = _.fixNumber(balance, 3);
      this.set('balance', balance);
    },
    checkUnmixed: function () {
      var error =
        'Erreur! La feuille de caisse doit comporter des quittances de même signe.';
      var unmixed = false;
      var total = 0;
      var positive = false;
      var negative = false;
      var receipts = this.get('receipts');
      var i = 0;
      while (receipts.models[i] && !(negative && positive)) {
        total = receipts.models[i].get('total');
        if (total >= 0) {
          positive = true;
        }
        else if (total <= 0) {
          negative = true;
        }
        if (negative && positive) {
          unmixed = false;
          this.set('error', error);
          return unmixed;
        }
        else {
          unmixed = true;
        }
        i++;
      }
      return unmixed;
    },
    checkRT: function () {
      var error =
        'La feuille de caisse ne doit pas comporter des quittances de nature RT!';
      var rt = false;
      var receipts = this.get('receipts');
      var i = 0;
      var nature = null;
      while (receipts.models[i]) {
        nature = receipts.models[i].get('nature');
        if (nature === 'RT') {
          rt = true;
          this.set('error', error);
          return rt;
        }
        i++;
      }
      return rt;
    }
  });
  mod.Payments = Backbone.Collection.extend({
    model: mod.Payment
  });
  mod.Criteria = Backbone.Model.extend({
    defaults: {
      receiptReference: null,
      policyReference: null,
      subscriberName: null,
      fromDate: null,
      toDate: null,
      effectiveDate: null,
      endDate: null,
      insuranceCertificate: null,
      nonZeroDue: false
    },
    sep: function (url) {
      if (url === '') {
        return ('');
      }
      else {
        return ('&');
      }
    },
    buildURL: function () {
      var url = '';
      var receiptReference = this.get('receiptReference');
      var policyReference = this.get('policyReference');
      var subscriberName = this.get('subscriberName');
      var fromDate = this.get('fromDate');
      var toDate = this.get('toDate');
      var effectiveDate = this.get('effectiveDate');
      var endDate = this.get('endDate');
      var insuranceCertificate = this.get('insuranceCertificate');
      var nonZeroDue = this.get('nonZeroDue');
      if ((receiptReference !== '') && (receiptReference !== null)) {
        url = url + this.sep(url) + 'receiptReference=' +
          receiptReference;
      }
      if (policyReference !== '') {
        url = url + this.sep(url) + 'policyReference=' +
          policyReference;
      }
      if ((subscriberName !== '') && (subscriberName !== null)) {
        url = url + this.sep(url) + 'subscriberName=' +
          subscriberName;
      }
      if (insuranceCertificate !== '') {
        url = url + this.sep(url) + 'insuranceCertificate=' +
          insuranceCertificate;
      }
      if (fromDate !== null) {
        url = url + this.sep(url) + 'fromDate=' + fromDate;
      }
      if (toDate !== null) {
        url = url + this.sep(url) + 'toDate=' + toDate;
      }
      if (effectiveDate !== null) {
        url = url + this.sep(url) + 'effectiveDate=' + effectiveDate;
      }
      if (endDate !== null) {
        url = url + this.sep(url) + 'endDate=' + endDate;
      }
      if (nonZeroDue !== false) {
        url = url + this.sep(url) + 'nonZeroDue=' + nonZeroDue;
      }
      return (url);
    }
  });
  mod.PaymentCriteria = Backbone.Model.extend({
    defaults: {
      reference: null,
      status: null,
      fromCreationDate: null,
      toCreationDate: null,
      fromClosingDate: null,
      toClosingDate: null
    }
  });
  mod.Step = Backbone.Model.extend({
    defaults: {
      name: null,
      label: null,
      active: false,
    },
    getPath: function () {
      return 'edit/payment/' + this.get('name');
    }
  });
  mod.Steps = Backbone.Collection.extend({
    model: mod.Step,
    getStep: function (name) {
      return this.find(function (s) {
        return s.get('name') === name;
      });
    },
    getActive: function () {
      return this.find(function (s) {
        return s.get('active');
      });
    },
    setActive: function (step) {
      if (_.isNumber(step)) {
        step = this.at(step);
      }
      else if (_.isString(step)) {
        step = this.getStep(step);
      }
      if (step) {
        this.each(function (s) {
          s.set('active', false);
        });
        step.set('active', true);
        this.trigger('step', step.get('name'));
      }
    }
  });
  mod.ReceiptReported = Backbone.Model.extend({
    dateAttributes: ['reviewDate'],
    defaults: function () {
      return {
        reviewDate: null,
        receiptRef: null
      };
    }
  });
  mod.ReceiptsList = Backbone.Collection.extend({
    model: mod.ReceiptReported
  });
  mod.SendExep = Backbone.Model.extend({
    defaults: function () {
      return {
        status: ''
      };
    }
  });
});
