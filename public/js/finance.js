main.module('finance.payment', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'payment': function () {
          app.execute('payment:index');
        },
        'payment/:reference/edit': function (reference) {
          app.execute('payment:edit', reference);
        },
        'payment/search': function (criteria) {
          app.execute('payment:search', criteria);
        },
        'payment/:reference/consult': function (reference) {
          app.execute('payment:consult', reference);
        },
        'payment/:reference/paymentRequest': function (reference) {
          app.execute('payment:paymentRequest', reference);
        }
      }
    });
  });
});

main.module('finance.payment', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    app.commands.setHandler('payment:index', function () {
      app.request('payment:current')
        .done(function (data) {
          if (data.payment) {
            mod.router.navigate('payment/' + data.payment.reference +
              '/edit', {
                trigger: true,
                replace: false
              });
          }
          else {
            app.request('payment:create')
              .done(function (data) {
                mod.router.navigate('payment/' + data.payment.reference +
                  '/edit', {
                    trigger: true,
                    replace: false
                  });
              });
          }
        });
    });
    app.commands.setHandler('payment:edit', function (reference) {
      app.request('payment:search', {
          reference: parseInt(reference, 10),
          status: '0'
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.layout);
          }
        });
    });
    app.commands.setHandler('payment:paymentRequest', function (
      reference) {
      app.request('payment:search', {
          reference: parseInt(reference, 10),
          status: '0'
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.paymentRequestView);
          }
        });
    });
    app.commands.setHandler('payment:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
    app.commands.setHandler('payment:consult', function (reference) {
      app.request('payment:search', {
          reference: parseInt(reference, 10),
          status: ''
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            mod.controller.setDocData(mod.controller.payment);
            app.mainRegion.show(mod.controller.paymentConsultView);
          }
        });
    });
    app.commands.setHandler('payment:receipts', function (cb) {
      var receipts = mod.controller.payment.get('receipts');
      var table = [];
      receipts.each(function (receipt) {
        if (receipt !== null) {
          var item = {
            id: receipt.get('reference')
              .toString(),
            text: receipt.get('reference')
              .toString()
          };
          table.push(item);
        }
      });
      cb(table);
    });
  });
});

main.module('finance.payment', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.steps = new mod.Steps();
      this.receipts = new mod.Receipts();
      this.receiptsSummary = new mod.ReceiptsSummary();
      this.payment = new mod.Payment();
      this.pos = new mod.POS();
      this.payments = new mod.Payments();
      this.settlement = new mod.Settlement();
      this.doc = new app.common.Doc();
      this.layout = new mod.Layout();
      this.searchLayout = new mod.SearchLayout();
      this.paymentCriteria = new mod.PaymentCriteria();
      this.paymentConsultView = new mod.PaymentConsultView();
      this.paymentRequestView = new mod.PaymentRequestView();
      this.postponedReceipts = [];
      this.receiptReported = new mod.ReceiptReported();
      this.receiptsList = new mod.ReceiptsList();
      this.sendExep = new mod.SendExep();
      this.initSteps();
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      steps[0] = new mod.Step({
        name: 'Picker',
        active: false,
        label: 'Recherche'
      });
      steps[1] = new mod.Step({
        name: 'Main',
        active: false,
        label: 'Quittances'
      });
      steps[2] = new mod.Step({
        name: 'Settlement',
        active: false,
        label: 'Règlements'
      });
      self.steps.reset(steps);
      //
    },
    cancelPayment: function () {
      app.request('payment:current')
        .done(function (data) {
          if (data.payment) {
            var receipts = mod.controller.payment.get('receipts');
            receipts.fromRequest(data.payment.receipts);
            // get TTC Amount
            var total = mod.controller.payment.get('total');
            total = data.payment.premium.total;
            total = _.fixNumber(total, 3);
            mod.controller.payment.set('total', total);
            // get Commission
            var commission = mod.controller.payment.get(
              'commission');
            commission = data.payment.premium.commission;
            commission = _.fixNumber(commission, 3);
            mod.controller.payment.set('commission', commission);
            // get RAS
            var ras = mod.controller.payment.get('ras');
            ras = data.payment.premium.ras;
            ras = _.fixNumber(ras, 3);
            mod.controller.payment.set('ras', ras);
            //Get Amount to pay
            var toPay = mod.controller.payment.get('toPay');
            toPay = data.payment.premium.toPay;
            toPay = _.fixNumber(toPay, 3);
            mod.controller.payment.set('toPay', toPay);
            // Get Amount affected
            var affected = mod.controller.payment.get('affected');
            affected = data.payment.premium.affected;
            affected = _.fixNumber(affected, 3);
            mod.controller.payment.set('affected', affected);
            // Get paid Amount
            var paid = mod.controller.payment.get('paid');
            paid = data.payment.premium.paid;
            paid = _.fixNumber(paid, 3);
            mod.controller.payment.set('paid', paid);
          }
        });
    },
    getPaymentData: function (data) {
      var payment = data[0];
      this.payment.fromRequest(payment);
      var receipts = this.payment.get('receipts');
      receipts.fromRequest(payment.receipts);
      var pos = this.payment.get('pos');
      pos.fromRequest(payment.pos);
      this.pos = pos;
      var premium = this.payment.get('premium');
      premium.fromRequest(payment.premium);
      //get settlement
      var settlements = this.payment.get('settlements');
      settlements.fromRequest(payment.settlements);
      var listSettlements = payment.settlements;
      _.each(listSettlements, function (settlement) {
        var recs = settlement.receipts;
        var index = _.indexOf(listSettlements, settlement);
        var setl = settlements.at(index);
        var theReceipts = setl.get('receipts'); //settlements[index].receipts;
        _.each(recs, function (receipt) {
          theReceipts.push(receipt);
        });
      });
    },
    setDocData: function (payment) {
      this.doc.set('title', 'Imprimer');
      this.doc.set('id', payment.get('pdfId'));
      this.doc.set('lob', '/accounting/fdc');
    },
    addSettlement: function (payment, settlementToAdd) {
      // var mode = this.model.get('mode')
      // this.model.set('mode', parseInt(mode));
      var mode = settlementToAdd.get('mode');
      settlementToAdd.set('mode', parseInt(mode));
      var listSettlements = payment.get('settlements');
      var receipt = settlementToAdd.get('receipts');
      var settlement = new mod.Settlement();
      settlement.set('mode', settlementToAdd.get('mode'));
      var settlementAmount = settlementToAdd.get('amount');
      settlementAmount = _.fixNumber(settlementAmount, 3);
      settlement.set('amount', settlementAmount);
      settlement.set('date', settlementToAdd.get('date'));
      settlement.set('reference', settlementToAdd.get('reference'));
      settlement.set('bank', settlementToAdd.get('bank'));
      if (receipt !== '') {
        settlement.get('receipts')
          .push(receipt);
      }
      listSettlements.add(settlement);
      payment.set('settlements', listSettlements);
      return listSettlements;
    },
    addReceipt: function (receiptToAdd) {
      var added = false;
      var receiptsList = mod.controller.receiptsList;
      var receiptRef = receiptToAdd.get('receiptsLst');
      var reviewDate = receiptToAdd.get('reviewDate');
      var receiptReported = new mod.ReceiptReported();
      receiptReported.set('receiptRef', receiptRef);
      receiptReported.set('reviewDate', reviewDate);
      if (!added) {
        receiptsList.add(receiptReported);
      }
      return receiptsList;
    },
    getPaymentConfigUtils: function (rules) {
      var PaymentConfigUtils = {};
      _.each(rules, function (rule) {
        _.each(rule, function (elem) {
          switch (elem.name) {
          case 'partialPaymentLimit':
            PaymentConfigUtils.limit = elem.value;
            break;
          case 'partialPaymentMinPercent':
            PaymentConfigUtils.minPercent = elem.value;
            break;
          case 'partialPaymentNonAffectedProfiles':
            PaymentConfigUtils.nonAffectedProfiles = elem.value;
            PaymentConfigUtils.exceptedPos = elem.exception;
            break;
          }
        });
      });
      return PaymentConfigUtils;
    },
    verifyPartialAmount: function (rec, config) {
      var pos = this.payment.get('pos');
      var posCode = pos.get('code');
      var total = rec.get('total');
      var toAffect = rec.get('toAffect');
      var due = rec.get('due');
      if (toAffect > due) {
        return {
          authorized: false,
          message: 'Le montant saisi "' + toAffect +
            '" est supérier au montant à régler "' + due + '" !'
        };
      }
      else {
        if (toAffect === due) {
          return {
            authorized: true
          };
        }
        else {
          if (!_.contains(config.nonAffectedProfiles, posCode.substring(
              0, 1)) && posCode !== config.exceptedPos) {
            if (total >= config.limit) {
              if (toAffect <= total * config.minPercent) {
                return {
                  authorized: false,
                  message: 'Le montant à reglér est inférieur à la valeur minimale autorisée : ' +
                    config.minPercent + '% du montant total!'
                };
              }
              else {
                return {
                  authorized: true
                };
              }
            }
            else {
              return {
                authorized: false,
                message: 'Le paiement partiel pour un montant total ne dépassant pas ' +
                  config.limit + ' dt n\'est pas autorisé!'
              };
            }
          }
          else {
            return {
              authorized: true
            };
          }
        }
      }
    }
  });
});





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

main.module('finance.payment', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('payment:create', function () {
      return app.common.post('/svc/payment/create');
    });
    app.reqres.setHandler('payment:current', function () {
      return app.common.post('/svc/payment/current');
    });
    app.reqres.setHandler('payment:save', function (payment, close,
      postponedReceipts) {
      return app.common.post('/svc/payment/save', {
        payment: payment,
        close: close,
        postponedReceipts: postponedReceipts
      });
    });
    app.reqres.setHandler('payment:search', function (criteria) {
      return app.common.post('/svc/payment/search', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('payment:finalize', function (payment) {
      return app.common.post('/svc/payment/finalize', {
        payment: payment
      });
    });
    app.reqres.setHandler('payment:sendExemption', function (payment,
      msg, receiptsList) {
      return app.common.post('/svc/payment/sendExemption', {
        payment: payment,
        msg: msg,
        receiptsList: receiptsList
      });
    });
    app.reqres.setHandler('payment:print', function (payment) {
      return app.common.post('/svc/payment/print', {
        payment: payment
      });
    });
    app.reqres.setHandler('receipt:search', function (criteria, payment,
      allReceipts) {
      return app.common.post('/svc/receipt/search', {
        criteria: criteria,
        payment: payment,
        allReceipts: allReceipts
      });
    });
    app.reqres.setHandler('payment:verifyPostPone', function (recId) {
      return app.common.post('/svc/payment/verifyPostPone', {
        recId: recId
      });
    });
  });
});

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

main.module('finance.premium', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'premium/:contract/:raisedDate/consult': function (contract,
          raisedDate) {
          app.execute('premium:consult', contract, raisedDate);
        },
        'premium/search': function (criteria) {
          app.execute('premium:search', criteria);
        }
      }
    });
  });
});

main.module('finance.premium', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('premium:consult', function (contract,
      raisedDate) {
      mod.controller = new mod.Controller();
      mod.controller.launch(contract, raisedDate);
    });
    app.commands.setHandler('premium:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
  });
});

main.module('finance.premium', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.receipts = new mod.Premiums();
      this.searchLayout = new mod.SearchLayout();
    },
    launch: function (contract, raisedDate) {
      var self = this;
      app.request('premium:consult', contract, raisedDate)
        .done(function (data) {
          self.container = new mod.Container();
          var premium = self.container.get('premium');
          premium.fromRequest(data.premium);
          premium.set('stamps', data.premium.stamps);
          premium.set('taxes', data.premium.taxes);
          var coverages = self.container.get('coverages');
          coverages.fromRequest(data.coverages);
          self.layout = new mod.ReceiptConsultView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    },
    updatePaymentMode: function (mode) {
      if (mode === 0) {
        return 'Virement';
      }
      else if (mode === 1) {
        return 'Espèces/Versement';
      }
      else if (mode === 2) {
        return 'Chèque';
      }
      else if (mode === 3) {
        return 'Traite';
      }
      else if (mode === 5) {
        return 'Prélèvement sur salaire';
      }
      else if (mode === 6) {
        return 'Prélèvement bancaire';
      }
    }
  });
});





main.module('finance.premium', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    /*
     * policyReference: number
     */
    dateAttributes: ['fromDate', 'toDate'],
    defaults: {
      policyReference: null,
      fromDate: moment()
        .add(-1, 'M')
        .toDate(),
      toDate: moment()
        .toDate()
    }
  });
  mod.Coverage = Backbone.Model.extend({
    /*
     * name: Description of the cover
     * amount: net contribtion
     * tua: amount of tua tax
     * fg: amount of fg tax
     * commission: commission amount
     */
    defaults: {
      name: null,
      amount: 0,
      tua: 0,
      fg: 0,
      commission: 0
    }
  });
  mod.Coverages = Backbone.Collection.extend({
    model: mod.Coverage
  });
  mod.Premium = Backbone.Model.extend({
    /*
     * date : date (date emission de la prime)
     * nature : string (nature de la prime : comptant, avenant, ...)
     * fromDate : premium effective date
     * toDate : premium end date
     * premiumStatus : premium status 0 non raised 1 raised (receipt)
     * statusDesc: status description
     * contract : number (référence de la police)
     * subscriberName : string (Nom du souscripteur)
     * total : number (montant TTC)
     * remainingAmount : number used to check premium remaining amount on settlement
     * taxes : array containing premium taxes
     * stamps : array containing premium stamps
     * commission: amount of commission
     */
    dateAttributes: ['date', 'fromDate', 'toDate'],
    defaults: function () {
      return {
        reference: null,
        date: null,
        nature: null,
        fromDate: null,
        toDate: null,
        contract: null,
        subscriberName: null,
        premiumStatus: null,
        statusDesc: null,
        total: null,
        remainingAmount: null,
        taxes: [],
        stamps: [],
        commission: null
      };
    }
  });
  mod.Premiums = Backbone.Collection.extend({
    model: mod.Premium
  });
  mod.Settlement = Backbone.Model.extend({
    /*
     * mode : number (0:virement, 1 : espèces/Versement, 2: chèque)
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
        num: null,
        bank: ''
      };
    }
  });
  mod.Settlements = Backbone.Collection.extend({
    model: mod.Settlement
  });
  mod.PremiumGenerate = Backbone.Model.extend({
    /*
     * reportText : Text to be reported in case there is a problem with the premium
     */
    defaults: function () {
      return {
        reportText: null,
        receiptDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        premium: new mod.Premium(),
        coverages: new mod.Coverages(),
        settlement: new mod.Settlement(),
        settlements: new mod.Settlements(),
        premiumgenerate: new mod.PremiumGenerate()
      };
    }
  });
});

main.module('finance.premium', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('premium:consult', function (contract,
      raisedDate) {
      return app.common.post('/svc/premium/consult', {
        contract: contract,
        raisedDate: raisedDate
      });
    });
    app.reqres.setHandler('premium:search', function (criteria) {
      return app.common.post('/svc/premium/receiptsearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('premium:receipt:generate', function (data) {
      return app.common.post('/svc/premium/generate', {
        premium: data.premium.toRequest(),
        settlements: data.settlements.toRequest()
      });
    });
    app.reqres.setHandler('premium:senderror', function (data) {
      return app.common.post('/svc/premium/senderror', {
        premium: data.premium.toRequest(),
        reportText: data.reportText
      });
    });
    app.reqres.setHandler('premium:memoir:generate', function (data) {
      return app.common.post('/svc/premium/memoir', {
        premium: data.premium.toRequest()
      });
    });
  });
});

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

main.module('finance.receipt', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'receipt/:id/consult': function (id) {
          app.execute('finance:receipt', id);
        },
        'receipt/search': function (criteria, payment, allReceipts) {
          app.execute('receipt:search', criteria, payment,
            allReceipts);
        }
      }
    });
  });
});

main.module('finance.receipt', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('finance:receipt', function (id) {
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
    app.commands.setHandler('receipt:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
  });
});

main.module('finance.receipt', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new app.finance.payment.Criteria();
      this.receipts = new app.finance.payment.Receipts();
      this.receiptsSummary = new app.finance.payment.ReceiptsSummary();
      this.searchLayout = new mod.SearchLayout();
    },
    launch: function (id) {
      var self = this;
      app.request('receipt:consult', id)
        .done(function (data) {
          if (data.receipt === null) {
            app.alert('no receipt found');
          }
          else {
            self.container = new mod.Container();
            var receipt = self.container.get('receipt');
            receipt.fromRequest(data.receipt);
            var subscriberName = self.container.get(
              'subscriberName');
            subscriberName = data.receipt.subscriber.name;
            receipt.set('subscriberName', subscriberName);
            var due = self.container.get('due');
            due = data.receipt.recovery.due;
            receipt.set('due', due);
            var total = self.container.get('total');
            total = data.receipt.summary.total;
            receipt.set('total', total);
            var summary = self.container.get('summary');
            summary.fromRequest(data.receipt.summary);
            var stamps = self.container.get('stamps');
            stamps.fromRequest(data.receipt.summary.stamps);
            summary.set('stamps', stamps);
            var taxes = self.container.get('taxes');
            taxes.fromRequest(data.receipt.summary.taxes);
            summary.set('taxes', taxes);
            var payments = self.container.get('payments');
            payments.fromRequest(data.receipt.payments);
            var parts = self.container.get('parts');
            parts.fromRequest(data.receipt.recovery.parts);
            self.layout = new mod.ReceiptConsultView();
            app.mainRegion.show(self.layout);
          }
        })
        .fail(app.fail);
    }
  });
});





main.module('finance.receipt', function (mod, app, Backbone) {
  mod.Stamp = Backbone.Model.extend({
    /*
     * code: string
     * amount: amount
     */
    defaults: function () {
      return {
        code: 0,
        amount: 0
      };
    }
  });
  mod.Stamps = Backbone.Collection.extend({
    model: mod.Stamp
  });
  mod.Part = Backbone.Model.extend({
    /*
     * reference : number (référence de la feuille de caisse)
     * amount: amount (prime nette / term)
     * date: date de clôture
     */
    dateAttributes: ['date'],
    defaults: function () {
      return {
        reference: 0,
        amount: 0,
        date: null
      };
    }
  });
  mod.Parts = Backbone.Collection.extend({
    model: mod.Part
  });
  mod.Summary = Backbone.Model.extend({
    /*
     * premium : number (prime nette)
     * premiumCommission : number (montant de la commission)
     * premiumTaxes : number (montant du taxe)
     * fees : number (frais)
     * feesCommission : number (montant de les frais)
     * feesTaxes : number (montant du taxe)
     * commision: amount (tarif annuel)
     * taxes: amount (tax sur prime nette)
     * stamps: amount (montant des timbres)
     * total : number (Montant TTC)
     */
    defaults: function () {
      return {
        premium: 0,
        premiumCommission: 0,
        premiumTaxes: new mod.Stamps(),
        fees: 0,
        feesCommission: 0,
        feesTaxes: new mod.Stamps(),
        amount: 0,
        commission: 0,
        taxes: new mod.Stamps(),
        stamps: new mod.Stamps(),
        total: 0
      };
    }
  });
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        receipt: new app.finance.payment.Receipt(),
        summary: new mod.Summary(),
        payments: new app.finance.payment.Settlements(),
        stamps: new mod.Stamps(),
        taxes: new mod.Stamps(),
        parts: new mod.Parts()
      };
    },
    initialize: function () {
      this.get('parts')
        .reset();
    }
  });
});

main.module('finance.receipt', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('receipt:consult', function (id) {
      return app.common.post('/svc/receipt/consult', {
        id: parseInt(id, 10)
      });
    });
    app.reqres.setHandler('receipt:search', function (criteria, payment,
      allReceipts) {
      return app.common.post('/svc/receipt/search', {
        criteria: criteria,
        payment: payment,
        allReceipts: allReceipts
      });
    });
  });
});

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
