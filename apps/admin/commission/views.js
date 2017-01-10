main.module('admin.commission', function (mod, app, Backbone, Marionette, $, _) {
  mod.LayoutSearch = Marionette.Layout.extend({
    template: '#admin-commission-search',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.SearchView());
    }
  });
  mod.SearchView = Marionette.Layout.extend({
    template: '#admin-commission-search-view',
    regions: {
      error: '.tkf-error',
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
    }
  });
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#admin-commission-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'N° Quittance',
        type: 'CustText'
      },
      pos: {
        title: 'Intermédiaire',
        type: 'CustSelect',
        data: 'common:posList'
      },
      raisedFrom: {
        title: 'De',
        type: 'CustDate'
      },
      raisedTo: {
        title: 'A',
        type: 'CustDate'
      },
      effectiveFrom: {
        title: 'De',
        type: 'CustDate'
      },
      effectiveTo: {
        title: 'A',
        type: 'CustDate'
      },
      onlyIrregular: {
        title: 'onlyIrregular',
        type: 'CustCheckbox'
      },
      status: {
        title: 'Statut',
        type: 'CustSelect',
        data: 'common:irregStatus'
      },
      nature: {
        title: 'Nature anomalie',
        type: 'CustSelect',
        data: 'common:irregNature'
      }
    },
    searchRecComm: function () {
      var error = this.commit();
      var receipts = mod.controller.receipts;
      if (!error) {
        app.request('admin:commission:search', this.model)
          .done(function (data) {
            receipts.reset();
            _.each(data.receipts, function (item) {
              var receipt = new mod.ReceiptComm();
              receipt.fromRequest(item);
              var consultlink = receipt.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              receipts.add(receipt);
            });
          })
          .fail(app.fail);
      }
    },
    posHistory: function () {
      var pos = this.getValue('pos');
      var history = mod.controller.pos;
      if (pos !== '') {
        var dialog = new app.common.DiagView({
          el: '#modal'
        });
        dialog.setTitle('Historique de l\'intermédiaire');
        app.request('admin:pos:history', pos)
          .done(function (data) {
            history.fromRequest(data.pos);
            var currentPos = new mod.PosSummary({
              model: history
            });
            dialog.show(currentPos);
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="searchRecComm"]': 'searchRecComm',
      'click a[data-actions="posHistory"]': 'posHistory',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#admin-commission-result-row')
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
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#admin-commission-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.PosSummary = Marionette.ItemView.extend({
    template: '#admin-pos-summary-view'
  });
  mod.LayoutManage = Marionette.Layout.extend({
    template: '#admin-commission-manage',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.ManageView());
    }
  });
  mod.ManageView = Marionette.Layout.extend({
    template: '#admin-commission-manage-view',
    regions: {
      receiptSummary: '.tkf-receiptSummary',
      receiptHistory: '.tkf-receiptHistory',
      receiptCoverages: '.tkf-receiptCoverages',
      receiptActions: '.tkf-receiptActions',
      receiptGeneration: '.tkf-receiptGeneration'
    },
    onRender: function () {
      var receipt = mod.controller.receipt;
      var auditHistory = mod.controller.auditHistory;
      var auditCoverages = mod.controller.auditCoverages;
      var auditActions = mod.controller.auditActions;
      this.receiptSummary.show(new mod.ReceiptSummaryView({
        model: receipt
      }));
      this.receiptHistory.show(new mod.AuditHistoryTable({
        collection: auditHistory
      }));
      this.receiptCoverages.show(new mod.CommissionCovTable({
        collection: auditCoverages
      }));
      this.receiptActions.show(new mod.CommissionActions({
        model: auditActions
      }));
      this.receiptGeneration.show(new mod.CommissionAdjust({
        model: receipt
      }));
    }
  });
  mod.CommissionAdjust = Marionette.Layout.extend({
    template: '#admin-commission-adjust-view',
    regions: {
      automaticReceiptDetails: '.tkf-automaticReceiptDetails',
      automaticReceiptGen: '.tkf-automaticReceiptGen',
      manualReceipt: '.tkf-manualReceipt',
      fixReceipt: '.tkf-fixReceipt'
    },
    onRender: function () {
      var adjCoverages = mod.controller.auditAdjCoverages;
      var receipt = mod.controller.receipt;
      this.automaticReceiptDetails.show(new mod.CoverageAdjustView({
        collection: adjCoverages
      }));
      this.automaticReceiptGen.show(new mod.AutoReceiptGenAction({
        model: receipt
      }));
    }
  });
  mod.CoverageAdjustRow = Marionette.ItemView.extend({
    template: '#admin-commission-cover-adjust-row',
    tagName: 'tr',
    templateHelpers: {
      coverName: function () {
        var cover = this.code;
        var name;
        _.each(main.common.enums.coverReference, function (item) {
          if (item.id === cover) {
            name = item.text;
          }
        });
        return name;
      },
      commissionRaised: function () {
        var commission = this.commission;
        var calcCommission = this.calcCommission;
        return Number((calcCommission - commission)
          .toFixed(3));
      },
      percentComm: function () {
        var percent = 0;
        if (this.amount !== 0) {
          percent = Number((this.calcCommission / this.amount) * 100)
            .toFixed(3);
        }
        return percent;
      }
    }
  });
  mod.CoverageAdjustView = Marionette.CompositeView.extend({
    template: '#admin-commission-cover-adjust-table',
    itemView: mod.CoverageAdjustRow,
    itemViewContainer: 'tbody'
  });
  mod.AutoReceiptGenAction = Marionette.ItemView.extend({
    template: '#admin-commission-auto-receipt-gen',
    templateHelpers: {
      totalCommission: function () {
        var adjRec = mod.controller.auditAdjCoverages.models;
        var totalComm = 0;
        _.each(adjRec, function (item) {
          totalComm += item.get('calcCommission') - item.get(
            'commission');
        });
        return Number(totalComm.toFixed(3));
      },
      receiptTotal: function () {
        var adjRec = mod.controller.auditAdjCoverages.models;
        var totalComm = 0;
        var receiptTot;
        _.each(adjRec, function (item) {
          totalComm += item.get('calcCommission') - item.get(
            'commission');
        });
        if (totalComm < 0) {
          receiptTot = -0.001;
        }
        else {
          receiptTot = 0.001;
        }
        return Number(receiptTot.toFixed(3));
      }
    },
    generateAutoReceipt: function () {
      var originalReceipt = this.model.get('reference');
      var adjRec = mod.controller.auditAdjCoverages;
      var self = this;
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      var diagMod = new Backbone.Model();
      var msgBody = 'Cette opération va éméttre une quittance';
      msgBody += ' avec les détails spécifiés. Continuer?';
      diagMod.set('dialogBody', msgBody);
      var genRec = new app.common.DialogBody({
        model: diagMod
      });
      var msgtitle = 'Demande de confirmation !';
      dialog.setTitle(msgtitle);
      var diagbut = {};
      diagbut = {};
      diagbut.yes = {};
      diagbut.yes.label = 'Oui';
      diagbut.yes.className = 'col-sm-3 btn-success';
      diagbut.yes.className += ' pull-left';
      diagbut.yes.callback = function () {
        app.request('admin:commission:autofix', {
            receipt: originalReceipt,
            adjRec: adjRec
          })
          .done(function (data) {
            var newReceiptNumber = data.receiptNumber;
            self.$('.tkf-button')
              .contents()
              .remove();
            self.$('.tkf-button')
              .append('N° Q ' + newReceiptNumber);
          })
          .fail(app.fail);
      };
      diagbut.no = {};
      diagbut.no.label = 'Non';
      diagbut.no.className = 'col-sm-3 btn-warning';
      diagbut.no.className += ' pull-right';
      diagbut.no.callback = function () {};
      genRec.closeButton = false;
      genRec.buttons = diagbut;
      dialog.show(genRec);
    },
    events: {
      'click a[data-actions="generateAutoReceipt"]': 'generateAutoReceipt'
    }
  });
  mod.ReceiptSummaryView = Marionette.ItemView.extend({
    template: '#admin-receipt-summary-view',
    templateHelpers: {
      posName: function () {
        var posCode = this.pos;
        var name;
        _.each(main.common.enums.posList, function (item) {
          if (item.id === parseInt(posCode)) {
            name = item.text;
          }
        });
        return name;
      }
    },
    posHistory: function () {
      var pos = this.model.get('pos');
      var history = mod.controller.pos;
      if (pos !== '') {
        var dialog = new app.common.DiagView({
          el: '#modal'
        });
        dialog.setTitle('Historique de l\'intermédiaire');
        app.request('admin:pos:history', pos)
          .done(function (data) {
            history.fromRequest(data.pos);
            var currentPos = new mod.PosSummary({
              model: history
            });
            dialog.show(currentPos);
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="posHistory"]': 'posHistory'
    }
  });
  mod.AuditHistoryRow = Marionette.ItemView.extend({
    template: '#admin-commission-history-row',
    tagName: 'tr',
    templateHelpers: {
      actionDesc: function () {
        var actionCode = this.actionCode;
        var name;
        _.each(main.common.enums.irregStatus, function (item) {
          if (item.id === parseInt(actionCode)) {
            name = item.text;
          }
        });
        return name;
      }
    }
  });
  mod.AuditHistoryTable = Marionette.CompositeView.extend({
    template: '#admin-commission-history-table',
    itemView: mod.AuditHistoryRow,
    itemViewContainer: 'tbody'
  });
  mod.CommissionCovRow = Marionette.ItemView.extend({
    template: '#admin-commission-coverage-row',
    tagName: 'tr',
    templateHelpers: {
      coverName: function () {
        var cover = this.code;
        var name;
        _.each(main.common.enums.coverReference, function (item) {
          if (item.id === cover) {
            name = item.text;
          }
        });
        return name;
      },
      percentComm: function () {
        var percent = 0;
        if (this.amount !== 0) {
          percent = Number((this.calcCommission / this.amount) * 100)
            .toFixed(3);
        }
        return percent;
      }
    }
  });
  mod.CommissionCovTable = Marionette.CompositeView.extend({
    template: '#admin-commission-coverage-table',
    itemView: mod.CommissionCovRow,
    itemViewContainer: 'tbody'
  });
  mod.CommissionActions = app.common.CustForm.extend({
    template: _.template($('#admin-commission-action-form')
      .html()),
    schema: {
      identifiedComments: {
        title: 'Commentaires',
        type: 'CustText',
        disabler: {
          identified: true
        }
      },
      transferredComments: {
        title: 'Commentaires',
        type: 'CustText',
        disabler: {
          transferred: true
        }
      },
      requestComments: {
        title: 'Commentaires',
        type: 'CustText',
        disabler: {
          requested: true
        }
      },
      closedComments: {
        title: 'Commentaires',
        type: 'CustText',
        disabler: {
          closed: true
        }
      }
    },
    identify: function () {
      if (this.model.get('identified')) {
        this.$('[data-actions="identify"]')
          .addClass('disabled');
        return false;
      }
      var comments = this.getValue('identifiedComments');
      comments = comments.trim();
      this.setValue('identifiedComments', comments);
      var receiptRef = mod.controller.receipt.get('reference');
      var self = this;
      if (comments !== '') {
        var data = {};
        data.comments = comments;
        data.reference = receiptRef;
        app.request('admin:commission:identify', data)
          .done(function () {
            self.disable('identifiedComments', true);
            self.$('[data-actions="identify"]')
              .addClass('disabled');
          })
          .fail(app.fail);
      }
    },
    transfer: function () {
      if (this.model.get('transferred')) {
        this.$('[data-actions="transfer"]')
          .addClass('disabled');
        return false;
      }
      var comments = this.getValue('transferredComments');
      comments = comments.trim();
      this.setValue('transferredComments', comments);
      var receiptRef = mod.controller.receipt.get('reference');
      var self = this;
      if (comments !== '') {
        var data = {};
        data.comments = comments;
        data.reference = receiptRef;
        app.request('admin:commission:transfer', data)
          .done(function () {
            self.disable('transferredComments', true);
            self.$('[data-actions="transfer"]')
              .addClass('disabled');
          })
          .fail(app.fail);
      }
    },
    request: function () {
      if (this.model.get('requested')) {
        this.$('[data-actions="request"]')
          .addClass('disabled');
        return false;
      }
      var comments = this.getValue('requestComments');
      comments = comments.trim();
      this.setValue('requestComments', comments);
      var receiptRef = mod.controller.receipt.get('reference');
      var self = this;
      if (comments !== '') {
        var data = {};
        data.comments = comments;
        data.reference = receiptRef;
        app.request('admin:commission:request', data)
          .done(function () {
            self.disable('requestComments', true);
            self.$('[data-actions="request"]')
              .addClass('disabled');
          })
          .fail(app.fail);
      }
    },
    close: function () {
      if (this.model.get('closed')) {
        this.$('[data-actions="close"]')
          .addClass('disabled');
        return false;
      }
      var comments = this.getValue('closedComments');
      comments = comments.trim();
      this.setValue('closedComments', comments);
      var receiptRef = mod.controller.receipt.get('reference');
      var self = this;
      if (comments !== '') {
        var data = {};
        data.comments = comments;
        data.reference = receiptRef;
        app.request('admin:commission:close', data)
          .done(function () {
            self.disable('closedComments', true);
            self.$('[data-actions="close"]')
              .addClass('disabled');
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="identify"]': 'identify',
      'click a[data-actions="transfer"]': 'transfer',
      'click a[data-actions="request"]': 'request',
      'click a[data-actions="close"]': 'close',
    }
  });
});
