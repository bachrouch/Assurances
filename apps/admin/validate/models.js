main.module('admin.validate', function (mod, app, Backbone, Marionette, $, _) {
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
  mod.Settlement = Backbone.Model.extend({
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
  mod.PaymentControleView = Backbone.Model.extend({
    dateAttributes: ['newLimitDate']
  });
  mod.PaymentValidateView = Backbone.Model.extend({});
  mod.ControleButton = Backbone.Model.extend({
    dateAttributes: ['newLockDate']
  });
  mod.ReceiptCriteria = Backbone.Model.extend({
    dateAttributes: ['fromDate', 'toDate'],
    defaults: {
      pos: null,
      receiptReference: null,
      policyReference: null,
      subscriberName: null,
      fromDate: null,
      toDate: null,
      effectiveDate: null,
      endDate: null,
      nature: null,
      includeCancelled: false,
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
      var includeCancelled = this.get('includeCancelled');
      var pos = this.get('pos');
      var nonZeroDue = this.get('nonZeroDue');
      var nature = this.get('nature');
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
      if (includeCancelled !== false) {
        url = url + this.sep(url) + 'includeCancelled=' +
          includeCancelled;
      }
      if ((nature !== '') && (nature !== null)) {
        url = url + this.sep(url) + 'nature=' + nature;
      }
      if (pos && pos !== null) {
        url = url + this.sep(url) + 'pos=' + pos;
      }
      if (nonZeroDue && nonZeroDue !== false) {
        url = url + this.sep(url) + 'nonZeroDue=' + nonZeroDue;
      }
      return (url);
    }
  });
  mod.PaymentCriteria = Backbone.Model.extend({
    dateAttributes: ['fromCreationDate', 'toCreationDate',
      'fromClosingDate', 'toClosingDate'
    ],
    defaults: {
      pos: null,
      reference: null,
      status: null,
      includeDraft: false,
      nonZeroBalance: false,
      fromCreationDate: null,
      toCreationDate: null,
      fromClosingDate: null,
      toClosingDate: null,
      settlementReference: null
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
      var pos = this.get('pos');
      var reference = this.get('reference');
      var status = this.get('status');
      var includeDraft = this.get('includeDraft');
      var nonZeroBalance = this.get('nonZeroBalance');
      var fromCreationDate = this.get('fromCreationDate');
      var toCreationDate = this.get('toCreationDate');
      var fromClosingDate = this.get('fromClosingDate');
      var toClosingDate = this.get('toClosingDate');
      if (pos && pos !== null) {
        url = url + this.sep(url) + 'pos=' + pos;
      }
      if ((reference !== '') && (reference !== null)) {
        url = url + this.sep(url) + 'reference=' + reference;
      }
      if (status !== '') {
        url = url + this.sep(url) + 'status=' + status;
      }
      url = url + this.sep(url) + 'includeDraft=' + includeDraft;
      if (nonZeroBalance !== false) {
        url = url + this.sep(url) + 'nonZeroBalance=' +
          nonZeroBalance;
      }
      if (fromCreationDate !== null) {
        url = url + this.sep(url) + 'fromCreationDate=' +
          fromCreationDate;
      }
      if (toCreationDate !== null) {
        url = url + this.sep(url) + 'toCreationDate=' +
          toCreationDate;
      }
      if (fromClosingDate !== null) {
        url = url + this.sep(url) + 'fromClosingDate=' +
          fromClosingDate;
      }
      if (toClosingDate !== null) {
        url = url + this.sep(url) + 'toClosingDate=' + toClosingDate;
      }
      return (url);
    }
  });
  mod.Payment = Backbone.Model.extend({
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
        parts: new app.finance.receipt.Parts(),
        nbReceipts: 0,
        receiptsToDelete: []
      };
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
    updatePayment: function (settlementReference) {
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
      var nbReceipts = 0;
      var splittedSettlements = this.get('splittedSettlements');
      var SettlementsToRemove = [];
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
        var settlementRec = settlement.get('receipts');
        if (splittedSettlements === true && parseInt(
            settlementRec[0]) === settlementReference) {
          SettlementsToRemove.push(settlement);
        }
        else {
          paid += settlement.get('amount');
        }
      });
      for (var elem in SettlementsToRemove) {
        settlements.remove(SettlementsToRemove[elem]);
      }
      if (rateRas > 0) {
        ras = -rateRas * commission;
      }
      total = _.fixNumber(total, 3);
      commission = _.fixNumber(commission, 3);
      nbReceipts = _.size(receipts);
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
      self.trigger('change');
    }
  });
  mod.Payments = Backbone.Collection.extend({
    model: mod.Payment
  });
  mod.ReceiptsSummary = Backbone.Model.extend({
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
});
