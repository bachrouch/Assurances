main.module('admin.commission', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        commission: function () {
          app.execute('admin:commission:search');
        },
        'commission/:reference/manage': function (reference) {
          app.execute('admin:commission:manage', reference);
        }
      }
    });
  });
});

/*jslint browser: true */
main.module('admin.commission', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('admin:commission:search', function () {
      app.request('admin:commission:checkAccess')
        .done(function () {
          app.admin.current = 'CommissionSearch';
          mod.controller = new mod.ControllerSearch();
          app.mainRegion.show(mod.controller.layout);
          mod.router.navigate('commission', {
            trigger: true,
            replace: false
          });
        })
        .fail(function () {
          window.location.href = '/#unauthorized';
        });
    });
    app.commands.setHandler('admin:commission:manage', function (
      reference) {
      app.request('admin:commission:manage', reference)
        .done(function (data) {
          app.admin.current = 'commissionManage';
          mod.controller = new mod.ControllerManage();
          mod.controller.receipt.fromRequest(data.receipt);
          mod.controller.auditHistory.fromRequest(data.receipt.auditHistory);
          mod.controller.auditCoverages.fromRequest(data.receipt.displayCoverages);
          if (data.receipt.lastAction !== {}) {
            mod.controller.auditActions.fromRequest(data.receipt.lastAction);
          }
          mod.controller.auditAdjCoverages.fromRequest(data.receipt
            .auditAdjCoverages);
          app.mainRegion.show(mod.controller.layout);
        })
        .fail(function () {
          window.location.href = '/#unauthorized';
        });
    });
  });
});

main.module('admin.commission', function (mod, app, Backbone, Marionette) {
  mod.ControllerSearch = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.receipts = new mod.ReceiptsComm();
      this.pos = new mod.PosSummaryModel();
      this.layout = new mod.LayoutSearch();
    }
  });
  mod.ControllerManage = Marionette.Controller.extend({
    initialize: function () {
      this.layout = new mod.LayoutManage();
      this.receipt = new mod.ReceiptComm();
      this.pos = new mod.PosSummaryModel();
      this.auditHistory = new mod.AuditHistory();
      this.auditCoverages = new mod.AuditCoverages();
      this.auditActions = new mod.AuditAction();
      this.auditAdjCoverages = new mod.AuditCoverages();
    }
  });
});





main.module('admin.commission', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['raisedFrom', 'raisedTo', 'effectiveFrom',
      'effectiveTo'
    ],
    defaults: {
      reference: null,
      pos: null,
      status: null,
      onlyIrregular: true
    }
  });
  mod.ReceiptComm = Backbone.Model.extend({
    /*
    reference: Receipt Number
    raisedDate: Receipt raised date
    effectiveDate: Receipt effective date
    pos: Point of sale
    status: Commission status for receipt
    link: Link to check receipt page
    product: product code
    */
    dateAttributes: ['effectiveDate', 'raisedDate', 'toDate'],
    defaults: function () {
      return {
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    }
  });
  mod.ReceiptsComm = Backbone.Collection.extend({
    model: mod.ReceiptComm
  });
  mod.PosSummaryModel = Backbone.Model.extend({
    /*
    code: Pos code
    name: Pos name
    activityStart: Date of first subscribed contract
    accreditDate: Date of the accredititation
    currentProfile: Name of current profile
    transcodedTo: Code of pos used for transfert
    */
    dateAttributes: ['activityStart', 'accreditDate', 'activityEnd'],
    defaults: {
      code: null,
      name: null,
      transcodedTo: null
    }
  });
  mod.AuditSingleHistory = Backbone.Model.extend({
    /*
    name: Username of the action
    date: Date of the action
    action: Description of the action
    */
    dateAttributes: ['date']
  });
  mod.AuditHistory = Backbone.Collection.extend({
    model: mod.AuditSingleHistory
  });
  mod.AuditSingleCover = Backbone.Model.extend({
    /*
    code: Cover code
    amount: Net amount of the cover
    commission: Receipt commission
    calcCommission: Recalculated commission
    */
  });
  mod.AuditCoverages = Backbone.Collection.extend({
    model: mod.AuditSingleCover
  });
  mod.AuditAction = Backbone.Model.extend({
    defaults: {
      identifiedUser: null,
      identifiedComments: null,
      identified: false,
      transferredUser: null,
      transferredComments: null,
      transferred: false,
      requestUser: null,
      requestComments: null,
      requested: false,
      fixedUser: null,
      fixedComments: null,
      fixed: false
    }
  });
});

main.module('admin.commission', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:pos:history', function (pos) {
      return app.common.post('/svc/admin/pos/history', {
        pos: pos
      });
    });
    app.reqres.setHandler('admin:commission:search', function (data) {
      return app.common.post('/svc/admin/commission/identify', {
        data: data.toRequest()
      });
    });
    app.reqres.setHandler('admin:commission:checkAccess', function () {
      return app.common.post('/svc/admin/commission/checkAccess');
    });
    app.reqres.setHandler('admin:commission:manage', function (
      reference) {
      return app.common.post('/svc/admin/commission/manage', {
        reference: reference
      });
    });
    app.reqres.setHandler('admin:commission:identify', function (data) {
      return app.common.post(
        '/svc/admin/commission/identifyReceipt', {
          data: data
        });
    });
    app.reqres.setHandler('admin:commission:autofix', function (data) {
      return app.common.post('/svc/admin/commission/autofix', {
        receiptNumber: data.receipt,
        adjCovers: data.adjRec.toRequest()
      });
    });
  });
});

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

main.module('admin.exemption', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'exemption': function (criteria) {
          app.execute('exemption:search', criteria);
        },
        'exemption/:reference/consult': function (reference) {
          app.execute('exemption:consult', reference);
        },
        'exemption/:reference/manage': function (reference) {
          app.execute('exemption:manage', reference);
        }
      }
    });
  });
});

main.module('admin.exemption', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('exemption:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.mainLayout);
    });
    app.commands.setHandler('exemption:consult', function (reference) {
      app.request('admin:exemptionSearch', {
          reference: parseInt(reference, 10)
        })
        .done(function (data) {
          mod.controller = new mod.Controller();
          mod.controller.getExemptionData(data);
          var type = data[0].type;
          var ref = data[0].request.reference;
          switch (type) {
          case 0:
            app.mainRegion.show(mod.controller.exemptionConsultView);
            break;
          case 1:
            mod.controller.getPayData(ref, function () {
              app.mainRegion.show(mod.controller.paymentExemptionConsultView);
            });
            break;
          }
        });
    });
    app.commands.setHandler('exemption:manage', function (reference) {
      app.request('admin:exemptionSearch', {
          reference: parseInt(reference, 10)
        })
        .done(function (data) {
          mod.controller = new mod.Controller();
          mod.controller.getExemptionData(data);
          var type = data[0].type;
          var ref = data[0].request.reference;
          switch (type) {
          case 0:
            app.mainRegion.show(mod.controller.exemptionManageView);
            break;
          case 1:
            mod.controller.getPayData(ref, function () {
              app.mainRegion.show(mod.controller.paymentExemptionManageView);
            });
            break;
          }
        });
    });
  });
});

main.module('admin.exemption', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.mainLayout = new mod.MainLayout();
      this.exemptionCriteria = new mod.ExemptionCriteria();
      this.receipts = new app.finance.payment.Receipts();
      this.payment = new app.finance.payment.Payment();
      this.pos = new app.finance.payment.POS();
      this.request = new mod.Request();
      this.actions = new mod.Actions();
      this.exemption = new mod.Exemption();
      this.exemptions = new mod.Exemptions();
      this.exemptionConsultView = new mod.ExemptionConsultView();
      this.exemptionManageView = new mod.ExemptionManageView();
      this.paymentExemptionManageView = new mod.PaymentExemptionManageView();
      this.paymentExemptionConsultView = new mod.PaymentExemptionConsultView();
      this.receiptsList = new app.finance.payment.ReceiptsList();
    },
    getPayData: function (ref, cb) {
      var self = this;
      app.request('admin:paymentSearch', {
          reference: ref
        }, null)
        .done(function (data) {
          var payment = data[0];
          self.payment.fromRequest(payment);
          var receipts = self.payment.get('receipts');
          receipts.fromRequest(payment.receipts);
          var pos = self.payment.get('pos');
          pos.fromRequest(payment.pos);
          self.pos = pos;
          var premium = self.payment.get('premium');
          premium.fromRequest(payment.premium);
          cb();
        })
        .fail(function () {
          cb('Erreur lors de la récupération des données');
        });
    },
    getExemptionData: function (data) {
      var exemption = data[0];
      this.exemption.fromRequest(exemption);
      var request = this.exemption.get('request');
      request.fromRequest(exemption.request);
      var actions = this.exemption.get('actions');
      actions.fromRequest(exemption.actions);
      var actsList = actions.get('actsList');
      actsList.fromRequest(exemption.actions.actsList);
      this.actsList = actsList;
      var pos = this.exemption.get('pos');
      pos.fromRequest(exemption.pos);
      var receiptsList = request.get('receiptsList');
      receiptsList.fromRequest(exemption.request.receiptsList);
      this.receiptsList = receiptsList;
    }
  });
});





main.module('admin.exemption', function (mod, app, Backbone) {
  mod.Request = Backbone.Model.extend({
    defaults: function () {
      return {
        msg: null,
        reference: null,
        receiptsList: new app.finance.payment.ReceiptsList()
      };
    }
  });
  mod.Act = Backbone.Model.extend({
    dateAttributes: ['date', 'actDate'],
    defaults: function () {
      return {
        actName: null,
        date: null,
        actDate: null,
        modifiedBy: null
      };
    }
  });
  mod.ActsList = Backbone.Collection.extend({
    model: mod.Act
  });
  mod.Actions = Backbone.Model.extend({
    defaults: function () {
      return {
        comments: null,
        actsList: new mod.ActsList()
      };
    }
  });
  mod.Exemption = Backbone.Model.extend({
    dateAttributes: ['creationDate', 'closingDate'],
    defaults: function () {
      return {
        reference: null,
        status: null,
        type: null,
        object: null,
        creator: null,
        creationDate: null,
        closingDate: null,
        closingUser: null,
        pos: new app.finance.payment.POS(),
        request: new mod.Request(),
        actions: new mod.Actions()
      };
    }
  });
  mod.Exemptions = Backbone.Collection.extend({
    model: mod.Exemption
  });
  mod.ExemptionCriteria = Backbone.Model.extend({
    dateAttributes: ['fromCreationDate', 'toCreationDate',
      'fromClosingDate', 'toClosingDate'
    ],
    defaults: function () {
      return {
        pos: null,
        reference: null,
        status: null,
        fromCreationDate: null,
        toCreationDate: null,
        fromClosingDate: null,
        toClosingDate: null,
        type: null,
        num: null
      };
    }
  });
});

main.module('admin.exemption', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:exemptionSearch', function (criteria) {
      return app.common.post('/svc/exemption/adminExemptionSearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('admin:acceptExemption', function (exemption,
      comments) {
      return app.common.post('/svc/exemption/adminAcceptExemption', {
        exemption: exemption,
        comments: comments
      });
    });
    app.reqres.setHandler('admin:rejectExemption', function (exemption,
      comments) {
      return app.common.post('/svc/exemption/adminRejectExemption', {
        exemption: exemption,
        comments: comments
      });
    });
    app.reqres.setHandler('admin:postpone', function (receipt,
      paymentReference, exemptionRef) {
      return app.common.post('/svc/payment/postponePayment', {
        receipt: receipt,
        exemptionRef: exemptionRef,
        paymentReference: paymentReference
      });
    });
    app.reqres.setHandler('admin:unlockSubscription', function (payment,
      exemptionRef) {
      return app.common.post('/svc/payment/unlockSubscription', {
        payment: payment,
        exemptionRef: exemptionRef
      });
    });
  });
});

main.module('admin.exemption', function (mod, app, Backbone, Marionette, $, _) {
  mod.MainLayout = Marionette.Layout.extend({
    template: '#admin-search-exemptions',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.ExemptionSearchView());
    }
  });
  // Formulaire de recherche des dérogations
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#admin-exemption-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustNumber'
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
      type: {
        title: 'Type',
        type: 'CustSelect',
        data: 'common:exemptionType'
      },
      pos: {
        title: 'Intermédiaire',
        type: 'CustSelect',
        data: 'common:posList'
      },
      status: {
        title: 'Statut',
        type: 'CustSelect',
        data: 'common:exemptionStatus'
      },
      num: {
        title: 'Numéro FC',
        type: 'CustNumber'
      }
    },
    search: function () {
      var error = this.commit();
      var exemptions = mod.controller.exemptions;
      if (!error) {
        app.request('admin:exemptionSearch', this.model)
          .done(function (data) {
            exemptions.reset();
            data = _.first(data, 50);
            _.each(data, function (item) {
              var exemption = new mod.Exemption();
              exemption.fromRequest(item);
              var request = exemption.get('request');
              request.fromRequest(item.request);
              var pos = exemption.get('pos');
              pos.fromRequest(item.pos);
              var actions = exemption.get('actions');
              actions.fromRequest(item.actions);
              exemptions.add(exemption);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search'
    }
  });
  mod.ResultFormRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-exemption-search-result-row',
    templateHelpers: {
      updateStatus: function () {
        return _.updateExemptionStatus(this.status);
      },
      updateExemptionType: function () {
        return _.updateExemptionType(this.type);
      },
      getPos: function () {
        var code = this.pos.get('code');
        return (code);
      },
      getNum: function () {
        var num = this.request.get('reference');
        return (num);
      }
    },
    onRender: function () {
      var status = this.model.get('status');
      switch (status) {
      case 0:
        this.$el.addClass('primary');
        break;
      case 1:
        this.$el.addClass('success');
        break;
      default:
        this.$el.addClass('danger');
      }
    },
    manage: function () {
      mod.router.navigate('exemption/' + this.model.get('reference') +
        '/manage', {
          replace: false,
          trigger: true
        });
    },
    events: {
      'click a[data-actions="manage"]': 'manage'
    }
  });
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#admin-exemption-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.ExemptionConsultDetails = Marionette.ItemView.extend({
    template: '#admin-exemption-consult-details-view',
    templateHelpers: {
      updateStatus: function () {
        return _.updateExemptionStatus(this.status);
      }
    }
  });
  //Ecran de consultation des détails de la dérogation
  mod.ExemptionConsultView = Marionette.Layout.extend({
    template: '#admin-exemption-consult-view',
    regions: {
      details: '.tkf-exemption-details'
    },
    templateHelpers: {
      exemptionReference: function () {
        return mod.controller.exemption.get('reference');
      },
      updateExemptionType: function () {
        return _.updateExemptionType(mod.controller.exemption.get(
          'type'));
      }
    },
    onRender: function () {
      this.details.show(new mod.ExemptionConsultDetails({
        model: mod.controller.exemption
      }));
    }
  });
  mod.Response = app.common.CustForm.extend({
    template: _.template($('#admin-exemption-manage-response-view')
      .html()),
    schema: {
      comments: {
        title: 'Commentaires',
        type: 'TextArea'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    disableButton: function () {
      this.$('a[data-actions="accept"]')
        .addClass('disabled');
      this.$('a[data-actions="reject"]')
        .addClass('disabled');
      this.$('textarea[data-fields="comments"]')
        .attr('disabled', 'disabled');
    },
    accept: function () {
      this.commit();
      this.disableButton();
      var comments = this.$('textarea[data-fields="comments"]')
        .val();
      this.model.set('comments', comments);
      app.request('admin:acceptExemption', mod.controller.exemption,
          this.model.get('comments'))
        .done(function () {
          app.alert('Votre réponse a été envoyée avec succès');
          mod.router.navigate('exemption', {
            replace: false,
            trigger: true
          });
        })
        .fail(function () {
          this.$('a[data-actions="sendDerogation"]')
            .removeClass('disabled');
          app.fail();
        });
    },
    reject: function () {
      this.commit();
      this.disableButton();
      var comments = this.$('textarea[data-fields="comments"]')
        .val();
      this.model.set('comments', comments);
      app.request('admin:rejectExemption', mod.controller.exemption,
          this.model.get('comments'))
        .done(function () {
          app.alert('Votre réponse a été envoyée avec succès');
          mod.router.navigate('exemption', {
            replace: false,
            trigger: true
          });
        })
        .fail(function () {
          this.$('a[data-actions="sendDerogation"]')
            .removeClass('disabled');
          app.fail();
        });
    },
    events: {
      'click a[data-actions="accept"]': 'accept',
      'click a[data-actions="reject"]': 'reject'
    }
  });
  mod.ReceiptToAddRow = Marionette.ItemView.extend({
    template: '#admin-exemption-receipt-to-report-consult-row',
    tagName: 'tr'
  });
  // Liste des Quittances à reporter
  mod.ReceiptsToReport = Marionette.CompositeView.extend({
    template: '#admin-exemption-receipts-to-report-table',
    itemView: mod.ReceiptToAddRow,
    itemViewContainer: 'tbody'
  });
  mod.ExemptionDetails = Marionette.ItemView.extend({
    template: '#admin-exemption-details-view',
    templateHelpers: {
      getPos: function () {
        var pos = mod.controller.exemption.get('pos');
        var code = pos.get('code');
        return (code);
      },
      getCreator: function () {
        var creator = mod.controller.exemption.get('creator');
        return (creator);
      },
      getCreationDate: function () {
        var creationDate = mod.controller.exemption.get(
          'creationDate');
        return (creationDate);
      }
    },
    receiptsToReport: function () {
      var request = mod.controller.exemption.get('request');
      var receiptsList = request.get('receiptsList');
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Liste des quittances à reporter');
      var receiptsToReport = new mod.ReceiptsToReport({
        collection: receiptsList
      });
      dialog.show(receiptsToReport);
    },
    events: {
      'click a[data-actions="receiptsToReport"]': 'receiptsToReport'
    }
  });
  mod.Act = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-exemption-act-result-row'
  });
  mod.ExemptionActionsTable = Marionette.CompositeView.extend({
    template: '#admin-exemption-actions-table',
    itemView: mod.Act,
    itemViewContainer: 'tbody'
  });
  mod.ExemptionStatusDetails = Marionette.ItemView.extend({
    template: '#admin-exemption-response-details-view',
    templateHelpers: {
      updateStatus: function () {
        return _.updateExemptionStatus(mod.controller.exemption.get(
          'status'));
      },
      getComments: function () {
        var actions = this.actions;
        return (actions.get('comments'));
      }
    },
    receiptsReported: function () {
      var reference = mod.controller.exemption.get('reference');
      app.request('admin:exemptionSearch', {
          reference: parseInt(reference, 10)
        })
        .done(function (data) {
          var dialog = new app.common.DiagView({
            el: '#modal'
          });
          var exemption = mod.controller.exemption;
          var actions = exemption.get('actions');
          actions.fromRequest(data[0].actions);
          var actsList = actions.get('actsList');
          actsList.fromRequest(data[0].actions.actsList);
          dialog.setTitle('Liste des quittances reportées');
          var receiptsReported = new mod.ExemptionActionsTable({
            collection: actsList
          });
          dialog.show(receiptsReported);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="receiptsReported"]': 'receiptsReported'
    }
  });
  mod.ExemptionActionsDetails = Marionette.Layout.extend({
    template: '#admin-exemption-status-summary-view',
    regions: {
      exemptionStatusDetails: '.tkf-exemption-status-details'
    },
    onRender: function () {
      this.exemptionStatusDetails.show(new mod.ExemptionStatusDetails({
        model: mod.controller.exemption
      }));
    }
  });
  mod.UnlockSubscription = app.common.CustForm.extend({
    template: _.template($('#admin-controle-button')
      .html()),
    schema: {
      newLockDate: {
        title: 'Nouvelle date de blocage',
        type: 'CustDate'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    unlockSubscription: function () {
      this.commit();
      var exemptionRef = mod.controller.exemption.get('reference');
      var newLockDate = moment(this.model.get('newLockDate'))
        .format('YYYY-MM-DD');
      if (moment()
        .isAfter(newLockDate) || !moment(newLockDate)
        .isValid()) {
        app.alert('Veuillez choisir une date future!');
      }
      else {
        app.request('admin:unlockSubscription', this.model,
            exemptionRef)
          .done(function () {
            app.alert('Déblocage effectué avec succés!');
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="unlockSubscription"]': 'unlockSubscription'
    }
  });
  mod.ExemptionDetailsView = Marionette.Layout.extend({
    template: '#admin-exemption-manage-details-view',
    regions: {
      exemptionDetails: '.tkf-exemption-details',
      exemptionActionsDetails: '.tkf-exemption-actions-details'
    },
    onRender: function () {
      this.exemptionDetails.show(new mod.ExemptionDetails({
        model: mod.controller.exemption.get('request')
      }));
      this.exemptionActionsDetails.show(new mod.ExemptionActionsDetails({
        model: mod.controller.exemption.get('actions')
      }));
    }
  });
  //Ecran pour gérer la dérogation: modifier le statut et débloquer la souscription
  mod.UnlockSub = Marionette.Layout.extend({
    template: '#admin-exemption-manage-actions-view',
    regions: {
      unlockSubscription: '.tkf-deblocking-subscription',
      response: '.tkf-response'
    },
    templateHelpers: {
      exemptionReference: function () {
        return mod.controller.exemption.get('reference');
      },
      updateExemptionType: function () {
        return _.updateExemptionType(mod.controller.exemption.get(
          'type'));
      }
    },
    onRender: function () {
      var status = mod.controller.exemption.get('status');
      this.unlockSubscription.show(new mod.UnlockSubscription({
        model: mod.controller.payment
      }));
      if (status === 0) {
        this.response.show(new mod.Response({
          model: mod.controller.exemption
        }));
      }
    }
  });
  //Ecran pour modifier le statut de la dérogation
  mod.ExemptionManageView = Marionette.Layout.extend({
    template: '#admin-exemption-manage-view',
    regions: {
      details: '.tkf-exemption-details',
      response: '.tkf-response'
    },
    templateHelpers: {
      exemptionReference: function () {
        return mod.controller.exemption.get('reference');
      },
      updateExemptionType: function () {
        return _.updateExemptionType(mod.controller.exemption.get(
          'type'));
      }
    },
    onRender: function () {
      var status = mod.controller.exemption.get('status');
      if (status === 0) {
        this.response.show(new mod.Response({
          model: mod.controller.exemption
        }));
      }
      this.details.show(new mod.ExemptionDetails({
        model: mod.controller.exemption
      }));
    }
  });
  mod.PaymentReceiptRow = app.common.CustForm.extend({
    template: _.template($('#admin-payment-receipt-row')
      .html()),
    schema: {
      postponedTo: {
        title: 'Nouvelle date',
        type: 'CustDate'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initEvents: function () {
      var self = this;
      var status = mod.controller.exemption.get('status');
      var reference = this.model.get('reference');
      var request = mod.controller.exemption.get('request');
      var receiptsList = request.get('receiptsList');
      receiptsList = receiptsList.toJSON();
      _.each(receiptsList, function (receipt) {
        var ref = parseInt(receipt.receiptRef, 10);
        if (reference === ref) {
          self.$el.addClass('primary');
          self.setValue('postponedTo', moment(receipt.reviewDate)
            .toDate());
          self.$('[name="postponedTo"]')
            .css('background-color', '#DFF1FB');
        }
      });
      if (status !== 0) {
        this.$('a[data-actions="postpone"]')
          .addClass('disabled');
        this.disable('postponedTo', true);
      }
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
      }, this), 0);
      return this;
    },
    postpone: function () {
      this.commit();
      var receipts = mod.controller.payment.get('receipts');
      var reference = mod.controller.payment.get('reference');
      var exemptionRef = mod.controller.exemption.get('reference');
      var postponedTo = moment(this.model.get('postponedTo'))
        .format('YYYY-MM-DD');
      var today = moment()
        .format('YYYY-MM-DD');
      if (moment(today)
        .isAfter(postponedTo) || !moment(postponedTo)
        .isValid()) {
        app.alert('Veuillez choisir une future date');
        return;
      }
      else {
        receipts.remove(this.model);
        app.request('admin:postpone', this.model, reference,
            exemptionRef)
          .done(function () {
            app.alert('Quittance reportée avec succès!');
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="postpone"]': 'postpone'
    }
  });
  mod.PaymentReceiptConsulRow = Marionette.ItemView.extend({
    tagName: 'tr',
    template: '#admin-payment-receipt-consult-row'
  });
  // Table des quittances de la feuille de caisse
  mod.ListReceipts = Marionette.CompositeView.extend({
    template: '#admin-payment-receipts-consult-table',
    itemView: mod.PaymentReceiptConsulRow,
    itemViewContainer: 'tbody'
  });
  // Table des quittances de la feuille de caisse
  mod.ListReceiptsConsultView = Marionette.CompositeView.extend({
    template: '#admin-payment-receipts-table',
    itemView: mod.PaymentReceiptRow,
    itemViewContainer: 'tbody'
  });
  mod.PaymentExemptionManageView = Marionette.Layout.extend({
    template: '#admin-payment-exemption-manage-view',
    regions: {
      detailsExemption: '.tkf-exemption-manage-details',
      actions: '.tkf-exemption-response',
      summaryPaymentConsult: '.tkf-summary-payment',
      summaryPaymentAmounts: '.tkf-payment-amounts',
      paymentReservedUse: '.tkf-payment-reserved',
      listReceipts: '.tkf-listReceipts'
    },
    templateHelpers: {
      paymentReference: function () {
        return mod.controller.payment.get('reference');
      }
    },
    onRender: function () {
      var status = mod.controller.exemption.get('status');
      this.detailsExemption.show(new mod.ExemptionDetailsView({
        model: mod.controller.exemption
      }));
      if (status === 0) {
        this.actions.show(new mod.UnlockSub({
          model: mod.controller.exemption
        }));
      }
      this.summaryPaymentConsult.show(new app.admin.validate.SummaryPaymentConsultView({
        model: mod.controller.payment
      }));
      this.summaryPaymentAmounts.show(new app.admin.validate.SummaryPaymentAmounts({
        model: mod.controller.payment
      }));
      this.paymentReservedUse.show(new app.admin.validate.PaymentReservedUse({
        model: mod.controller.payment
      }));
      this.listReceipts.show(new mod.ListReceiptsConsultView({
        collection: mod.controller.payment.get('receipts')
      }));
    }
  });
  mod.PaymentExemptionConsultView = Marionette.Layout.extend({
    template: '#admin-payment-exemption-manage-view',
    regions: {
      detailsExemption: '.tkf-exemption-manage-details',
      summaryPaymentConsult: '.tkf-summary-payment',
      summaryPaymentAmounts: '.tkf-payment-amounts',
      paymentReservedUse: '.tkf-payment-reserved',
      listReceipts: '.tkf-listReceipts'
    },
    templateHelpers: {
      paymentReference: function () {
        return mod.controller.payment.get('reference');
      }
    },
    onRender: function () {
      this.detailsExemption.show(new mod.ExemptionDetailsView({
        model: mod.controller.exemption
      }));
      this.summaryPaymentConsult.show(new app.admin.validate.SummaryPaymentConsultView({
        model: mod.controller.payment
      }));
      this.summaryPaymentAmounts.show(new app.admin.validate.SummaryPaymentAmounts({
        model: mod.controller.payment
      }));
      this.paymentReservedUse.show(new app.admin.validate.PaymentReservedUse({
        model: mod.controller.payment
      }));
      this.listReceipts.show(new mod.ListReceipts({
        collection: mod.controller.payment.get('receipts')
      }));
    }
  });
  // Ecran Recherche des dérogations
  mod.ExemptionSearchView = Marionette.Layout.extend({
    template: '#admin-exemption-search-view',
    regions: {
      criteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.exemptionCriteria
      }));
      this.results.show(new mod.SearchResults({
        collection: mod.controller.exemptions
      }));
    }
  });
});

main.module('admin.payback', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'payback': function () {
          app.execute('payback:index');
        },
        'payback/search': function (criteria) {
          app.execute('payback:search', criteria);
        },
        'payback/:reference/edit': function (reference) {
          app.execute('payback:edit', reference);
        },
        'payback/:reference/consult': function (reference) {
          app.execute('payback:consult', reference);
        }
      }
    });
  });
});

main.module('admin.payback', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    app.commands.setHandler('payback:index', function () {
      app.request('payback:create')
        .done(function (data) {
          mod.router.navigate('payback/' + data.payback.reference +
            '/edit', {
              trigger: true,
              replace: false
            });
        });
    });
    app.commands.setHandler('payback:edit', function (reference) {
      app.request('payback:search', {
          reference: parseInt(reference, 10),
          status: '0'
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert(
              'Feuille de remboursement inexistente ou non modifiable!'
            );
            mod.router.navigate('payback/search', {
              replace: false,
              trigger: true
            });
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaybackData(data);
            app.mainRegion.show(mod.controller.mainLayout);
          }
        });
    });
    app.commands.setHandler('payback:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
    app.commands.setHandler('payback:consult', function (reference) {
      app.request('payback:search', {
          reference: parseInt(reference, 10),
          status: ''
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('Feuille de remboursement inexistente');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaybackData(data);
            mod.controller.setDocData(mod.controller.payback);
            app.mainRegion.show(mod.controller.paybacktConsultView);
          }
        });
    });
    app.commands.setHandler('payback:payments', function (cb) {
      var payments = mod.controller.payback.get('payments');
      var table = [];
      payments.each(function (payment) {
        if (payment !== null) {
          var item = {
            id: payment.get('reference')
              .toString(),
            text: payment.get('reference')
              .toString()
          };
          table.push(item);
        }
      });
      cb(table);
    });
  });
});

main.module('admin.payback', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.payback = new mod.Payback();
      this.steps = new app.finance.payment.Steps();
      this.payment = new app.finance.payment.Payment();
      this.settlement = new app.finance.payment.Settlement();
      this.payments = new app.finance.payment.Payments();
      this.paymentCriteria = new app.admin.validate.PaymentCriteria();
      this.paybacks = new mod.Paybacks();
      this.doc = new app.common.Doc();
      this.paybackCriteria = new mod.PaybackCriteria();
      this.mainLayout = new mod.MainLayout();
      this.searchLayout = new mod.SearchLayout();
      this.paybacktConsultView = new mod.PaybacktConsultView();
      this.initSteps();
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      steps[0] = new app.finance.payment.Step({
        name: 'Main',
        active: false,
        label: 'Recherche'
      });
      steps[1] = new app.finance.payment.Step({
        name: 'Payment',
        active: false,
        label: 'Feuilles de caisse'
      });
      steps[2] = new app.finance.payment.Step({
        name: 'Settlement',
        active: false,
        label: 'Règlements'
      });
      self.steps.reset(steps);
    },
    setDocData: function (payback) {
      this.doc.set('title', 'Imprimer');
      this.doc.set('id', payback.get('pdfId'));
      this.doc.set('lob', '/payback/sheet');
    },
    getPaybackData: function (data) {
      var payback = data[0];
      this.payback.fromRequest(payback);
      var payments = this.payback.get('payments');
      payments.fromRequest(payback.payments);
      var listPayments = payback.payments;
      _.each(listPayments, function (payment) {
        var index = _.indexOf(listPayments, payment);
        var paymentPremium = payments.at(index)
          .get('premium');
        paymentPremium.fromRequest(payment.premium);
        var pos = payments.at(index)
          .get('pos');
        pos.fromRequest(payment.pos);
      });
      var premium = this.payback.get('premium');
      premium.fromRequest(payback.premium);
      //get settlement
      var settlements = this.payback.get('settlements');
      settlements.fromRequest(payback.settlements);
      var listSettlements = payback.settlements;
      _.each(listSettlements, function (settlement) {
        var pays = settlement.payments;
        var index = _.indexOf(listSettlements, settlement);
        var setl = settlements.at(index);
        var thePayments = setl.get('payments'); //settlements[index].receipts;
        _.each(pays, function (payment) {
          thePayments.push(payment);
        });
      });
    },
    updatePaybackData: function () {}
  });
});





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

main.module('admin.validate', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('payback:create', function () {
      return app.common.post('/svc/payback/paybackCreate');
    });
    app.reqres.setHandler('payback:search', function (criteria) {
      return app.common.post('/svc/payback/paybackSearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('payback:save', function (payback) {
      return app.common.post('/svc/payback/paybackSave', {
        payback: payback
      });
    });
    app.reqres.setHandler('payback:paybackFinalize', function (payback) {
      return app.common.post('svc/payback/paybackFinalize', {
        payback: payback
      });
    });
    app.reqres.setHandler('payback:print', function (payback) {
      return app.common.post('/svc/payback/print', {
        payback: payback
      });
    });
  });
});

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

main.module('admin.terms', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'terms': function () {
          app.execute('admin:terms');
        },
        'terms/id/:reference': function (reference) {
          app.execute('admin:terms:get', reference);
        }
      }
    });
  });
});

main.module('admin.terms', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('admin:terms', function () {
      app.admin.current = 'terms';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
    });
    app.commands.setHandler('admin:terms:get', function (id) {
      app.admin.current = 'terms';
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});

main.module('admin.terms', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.layout = new mod.Layout();
      this.termCriteria = new mod.Criteria();
      this.steps = new mod.Steps();
      this.termPolicies = new mod.Policies();
      this.simulateRenewalPolicies = new mod.Policies();
      this.initSteps();
    },
    initSteps: function () {
      var self = this;
      var steps = [];
      steps[0] = new mod.Step({
        name: 'Term',
        active: false,
        label: 'Termes'
      });
      steps[1] = new mod.Step({
        name: 'SimulateRenewal',
        active: false,
        label: 'Simulation du renouvellement'
      });
      self.steps.reset(steps);
    },
    activateStep: function (step, updateURL) {
      var self = this;
      if (updateURL) {
        mod.router.navigate(step.getPath(), {
          replace: true,
          trigger: false
        });
      }
      step.executeBefore(function () {
        self.container.get('steps')
          .setActive(step);
        self.layout.triggerMethod('step', step);
      });
    },
    launch: function (id) {
      var self = this;
      app.request('admin:terms:get', {
          id: id
        })
        .done(function (data) {
          self.container = new mod.Container();
          var policy = self.container.get('policy');
          policy.fromRequest(data.policy);
          policy.get('quoteDoc')
            .fromRequest(data.policy.quoteDoc);
          policy.get('subscribeLink')
            .fromRequest(data.policy.subscribeLink);
          policy.get('transformLink')
            .fromRequest(data.policy.transformLink);
          policy.get('aeDoc')
            .fromRequest(data.policy.aeDoc);
          policy.get('attestationDoc')
            .fromRequest(data.policy.attestationDoc);
          policy.get('receiptDoc')
            .fromRequest(data.policy.receiptDoc);
          self.container.get('insured')
            .fromRequest(data.insured);
          self.container.get('vehicle')
            .fromRequest(data.vehicle);
          self.container.get('coverages')
            .fromRequest(data.coverages);
          if (data.person) {
            self.container.get('person')
              .fromRequest(data.person);
          }
          if (data.company) {
            self.container.get('company')
              .fromRequest(data.company);
          }
          if (data.beneficiary) {
            self.container.get('beneficiary')
              .fromRequest(data.beneficiary);
          }
          var settlements = self.container.get('settlements');
          settlements.fromRequest(data.settlements);
          self.layout = new mod.PolicyConsultView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    }
  });
});





main.module('admin.terms', function (mod, app, Backbone, Marionette, $, _) {
  mod.Policy = Backbone.Model.extend({
    /*
    reference: number (référence du Contract)
    effectiveDate: Contract  effective date
    termDate: date d'échéance
    clientName: Client Name
    premium: Premium Raised Equal to 0 for Quote
    details: Link to the details screen in order to validate or
    refuse the term
    */
    dateAttributes: ['effectiveDate', 'termDate'],
    defaults: function () {
      return {
        reference: 0,
        effectiveDate: null,
        termDate: null,
        clientName: null,
        premium: 0,
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    }
  });
  mod.Policies = Backbone.Collection.extend({
    model: mod.Policy
  });
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['termDate'],
    defaults: function () {
      return {
        reference: null,
        clientName: null,
        termDate: null,
        status: 0
      };
    }
  });
  mod.Step = Backbone.Model.extend({
    defaults: {
      name: null,
      label: null,
      active: false
    }
  });
  mod.Steps = Backbone.Collection.extend({
    model: mod.Step,
    getStep: function (name) {
      return this.find(function (t) {
        return t.get('name') === name;
      });
    },
    getActive: function () {
      return this.find(function (t) {
        return t.get('active');
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
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.auto.Quote(),
        vehicle: new app.auto.Vehicle(),
        insured: new app.auto.Insured(),
        coverages: new app.auto.Coverages(),
        person: new app.actors.Person(),
        company: new app.actors.Company(),
        settlement: new mod.Settlement(),
        settlements: new mod.Settlements()
      };
    }
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
});

main.module('admin.terms', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:termList', function () {
      return app.common.post('/svc/admin/termList');
    });
    app.reqres.setHandler('admin:termSearch', function (criteria,
      indice) {
      return app.common.post('/svc/admin/termSearch', {
        criteria: criteria,
        indice: indice
      });
    });
    app.reqres.setHandler('admin:terms:remove', function (data) {
      return app.common.post('/svc/admin/term/remove', {
        policy: data.policy.toRequest(),
        settlements: data.settlements.toRequest(),
        attestationNumber: data.attestationNumber
      });
    });
    app.reqres.setHandler('admin:terms:get', function (data) {
      return app.common.post('/svc/admin/terms/get', {
        id: data.id
      });
    });
  });
});

main.module('admin.terms', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#admin-terms',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content'
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.listenTo(mod.controller.steps, 'step', function (step) {
        this.content.show(new mod['step' + step + 'View']());
      });
      app.request('admin:termList')
        .done(function (data) {
          var Terms = data.TermPolicies;
          var SimulateRenewal = data.SimulateRenewalPolicies;
          mod.controller.termPolicies.reset();
          _.each(Terms, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.termPolicies.add(policy);
          });
          mod.controller.simulateRenewalPolicies.reset();
          _.each(SimulateRenewal, function (item) {
            var policy = new mod.Policy();
            policy.fromRequest(item);
            var consultlink = policy.get('consultlink');
            consultlink.fromRequest(item.consultlink);
            mod.controller.simulateRenewalPolicies.add(policy);
          });
        })
        .fail(app.fail);
      mod.controller.steps.setActive(0);
    }
  });
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
  mod.NavView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-tabs',
    itemView: mod.NavItemView,
    initialize: function () {
      this.collection = mod.controller.steps;
    }
  });
  mod.TermCriteria = app.common.CustForm.extend({
    template: _.template($('#admin-terms-search')
      .html()),
    schema: {
      reference: {
        title: 'N° Contrat',
        type: 'CustText'
      },
      clientName: {
        title: 'Nom',
        type: 'CustText'
      },
      status: {
        title: 'Statut',
        type: 'CustSelect',
        data: 'common:termStatus'
      },
      pos: {
        title: 'Intermédiaire',
        type: 'CustSelect',
        data: 'common:posList'
      },
      termDate: {
        title: 'Date terme',
        type: 'CustDate'
      }
    },
    term: function () {
      var error = this.commit();
      if (!error) {
        app.request('admin:termSearch', this.model, 1)
          .done(function (data) {
            mod.controller.termPolicies.reset();
            _.each(data, function (item) {
              var policy = new mod.Policy();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.termPolicies.add(policy);
            });
          })
          .fail(app.fail);
      }
    },
    events: {
      'click a[data-actions="term"]': 'term',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#admin-terms-row')
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
  mod.PolicieTermTable = Marionette.CompositeView.extend({
    template: '#admin-terms-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.stepTermView = Marionette.Layout.extend({
    template: '#admin-terms-view',
    regions: {
      error: '.tkf-error',
      Criteria: '.tkf-Criteria',
      Policies: '.tkf-Policies'
    },
    onRender: function () {
      this.Criteria.show(new mod.TermCriteria({
        model: mod.controller.termCriteria
      }));
      this.Policies.show(new mod.PolicieTermTable({
        collection: mod.controller.termPolicies
      }));
    }
  });
  mod.stepSimulateRenewalView = Marionette.Layout.extend({
    template: '#admin-terms-renewal-view',
    regions: {
      error: '.tkf-error',
      Criteria: '.tkf-Criteria',
      Policies: '.tkf-Policies'
    },
    onRender: function () {
      this.Criteria.show(new mod.TermCriteria({
        model: mod.controller.termCriteria
      }));
      this.Policies.show(new mod.PolicieTermTable({
        collection: mod.controller.simulateRenewalPolicies
      }));
    }
  });
  //TERM CONSULT VIEWS
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#auto-term-consult',
    regions: {
      header: '.tkf-header',
      vehicle: '.tkf-vehicle',
      coverages: '.tkf-coverages',
      premium: '.tkf-premium',
      subscriber: '.tkf-subscriber',
      payment: '.tkf-payment',
      paymentList: '.tkf-payment-list',
      actionsQuote: '.tkf-actions-quote',
      actionsPolicy: '.tkf-actions-policy',
      message: '.tkf-message'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var vehicle = mod.controller.container.get('vehicle');
      var coverages = mod.controller.container.get('coverages');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      var settlement = mod.controller.container.get('settlement');
      var settlements = mod.controller.container.get('settlements');
      var ref = policy.get('reference');
      policy.set('remainingAmont', policy.get('totalContribution'));
      this.listenTo(policy, 'change:validated', function () {
        var pol = mod.controller.container.get('policy');
        if (pol.get('validated')) {
          this.$('.tkf-payment')
            .addClass('hidden');
          this.$('[data-actions="erase"]')
            .addClass('hidden');
        }
      });
      this.header.show(new mod.TermConsultHeader({
        model: policy
      }));
      this.vehicle.show(new app.auto.QuoteConsultVehicle({
        model: vehicle
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: new app.auto.Coverages(coverages.filter(
          function (c) {
            return c.get('subscribed');
          }))
      }));
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: policy
      }));
      if (person.id) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: person
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: company
        }));
      }
      this.$('.list-group-item.tkf-actions-quote')
        .addClass('hidden');
      this.$('.page-header.tkf-consult-title h3')
        .append(' Police N° ' + ref);
      if (policy.get('validated')) {
        this.actionsPolicy.show(new mod.ActionsPolicyConsult({
          model: policy
        }));
        if (settlements.length !== 0) {
          this.paymentList.show(new mod.Payments({
            collection: settlements
          }));
        }
        else {
          this.$('.list-group-item.tkf-payment-list')
            .addClass('hidden');
        }
      }
      else {
        this.actionsPolicy.show(new mod.ActionsValidate({
          model: policy
        }));
        this.payment.show(new mod.Payment({
          model: settlement
        }));
        this.paymentList.show(new mod.Payments({
          collection: settlements
        }));
      }
    }
  });
  mod.ActionsPolicyConsult = app.common.CustForm.extend({
    template: _.template($('#auto-term-actions-policy')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.aeDoc = new app.common.DocView({
        model: this.model.get('aeDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.aeDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="aePrint"]')
        .append(this.aeDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      var docae = this.model.get('aeDoc');
      var docat = this.model.get('attestationDoc');
      var docrc = this.model.get('receiptDoc');
      if (docae.hasURL() && docrc.hasURL() && docat.hasURL()) {
        this.$('.row.tkf-regenerate')
          .addClass('hidden');
      }
      else {
        this.$('.row.tkf-regenerate')
          .removeClass('hidden');
      }
    },
    regenerate: function () {
      var self = this;
      var docs = {};
      var policy = mod.controller.container.get('policy');
      app.request('auto:contract:regenerate', {
          policy: policy
        })
        .done(function (data) {
          docs = data.docs;
          var docae = self.model.get('aeDoc');
          docae.unset('error');
          docae.fromRequest(docs.aeDoc);
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          var docrc = self.model.get('receiptDoc');
          docrc.unset('error');
          docrc.fromRequest(docs.rcdoc);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="regenerate"]': 'regenerate',
    }
  });
  mod.ActionsValidate = app.common.CustForm.extend({
    template: _.template($('#auto-term-validate-policy')
      .html()),
    schema: {
      attestationNumber: {
        title: 'Numéro de l\'attestation',
        type: 'CustSelect',
        request: 'auto:attestation:list'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.aeDoc = new app.common.DocView({
        model: this.model.get('aeDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
    },
    remove: function () {
      this.aeDoc.remove();
      this.attestationDoc.remove();
      this.receiptDoc.remove();
      return app.common.CustForm.prototype.remove.apply(this,
        arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="aePrint"]')
        .append(this.aeDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      this.$('.tkf-message-text')
        .addClass('hidden');
    },
    validateContract: function () {
      this.commit();
      this.$('.tkf-message-text')
        .addClass('hidden');
      var self = this;
      var docs = {};
      var settlements = mod.controller.container.get('settlements');
      var attestationNumber = this.model.get('attestationNumber');
      var policy = mod.controller.container.get('policy');
      app.request('policy:term:validate', {
          policy: policy,
          settlements: settlements,
          attestationNumber: attestationNumber
        })
        .done(function (data) {
          policy.set('validated', true);
          docs = data.docs;
          var docat = self.model.get('attestationDoc');
          docat.unset('error');
          docat.fromRequest(docs.atdoc);
          self.$('[data-actions="validate"]')
            .addClass('disabled');
          self.disable('attestationNumber', true);
          self.$('[data-actions="validate"]')
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
      'click a[data-actions="validate"]': 'validateContract',
    }
  });
  mod.Payment = app.common.CustForm.extend({
    template: _.template($('#auto-payment-form')
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
      var policy = mod.controller.container.get('policy');
      this.listenTo(policy, 'change:remainingAmont', function () {
        var pol = mod.controller.container.get('policy');
        var remaining = pol.get('remainingAmont');
        this.setValue('amount', remaining.toFixed(3));
      });
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      var policy = mod.controller.container.get('policy');
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.onModeChange();
        this.initEvents();
        this.setValue('amount', policy.get('totalContribution')
          .toFixed(3));
      }, this), 0);
      return this;
    },
    addPayment: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont')
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
        policy.set('remainingAmont', remaining);
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
  mod.PaymentRow = Marionette.ItemView.extend({
    template: '#auto-payment-consult-row',
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
          return 'prélévement bancaire';
        }
      },
      updateBankDescription: function () {
        var bank = this.bank;
        if (bank !== '') {
          return app.common.enums.banks[bank - 1].text;
        }
        else {
          return '';
        }
      }
    },
    erase: function () {
      var settlements = mod.controller.container.get('settlements');
      var policy = mod.controller.container.get('policy');
      var remainingAmont = policy.get('remainingAmont');
      policy.set('remainingAmont', remainingAmont + this.model.get(
        'amount'));
      settlements.remove(this.model);
    },
    events: {
      'click a[data-actions="erase"]': 'erase'
    }
  });
  mod.Payments = Marionette.CompositeView.extend({
    template: '#auto-payment-consult-table',
    itemView: mod.PaymentRow,
    itemViewContainer: 'tbody'
  });
  mod.TermConsultHeader = Marionette.ItemView.extend({
    template: '#auto-term-consult-header',
    ui: {
      billingFrequency: '[data-values="billingFrequency"]',
      effectiveDate: '[data-values="effectiveDate"]',
      termDate: '[data-values="termDate"]',
      beginDate: '[data-values="beginDate"]',
      endDate: '[data-values="endDate"]'
    },
    onRender: function () {
      if (this.model.isRenewable()) {
        this.ui.beginDate.parent()
          .addClass('hidden');
        this.ui.endDate.parent()
          .addClass('hidden');
      }
      else {
        this.ui.billingFrequency.parent()
          .addClass('hidden');
        this.ui.effectiveDate.parent()
          .addClass('hidden');
        this.ui.primaryTermDate.parent()
          .addClass('hidden');
      }
    }
  });
});

main.module('admin.validate', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'payment': function () {
          app.execute('admin:payment');
        },
        'payment/:reference/validate': function (reference) {
          app.execute('admin:validate', reference);
        },
        'payment/:reference/manage': function (reference) {
          app.execute('admin:manage', reference);
        },
        'receipt': function () {
          app.execute('admin:receiptSearch');
        }
      }
    });
  });
});

main.module('admin.validate', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    app.commands.setHandler('admin:payment', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.paymentSearchView);
    });
    app.commands.setHandler('admin:validate', function (reference) {
      app.request('admin:paymentSearch', {
          reference: parseInt(reference, 10)
        }, null)
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.paymentValidateView);
          }
        });
    });
    app.commands.setHandler('admin:manage', function (reference) {
      app.request('admin:paymentSearch', {
          reference: parseInt(reference, 10)
        }, null)
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.paymentControleView);
          }
        });
    });
    app.commands.setHandler('admin:receiptSearch', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.mainLayout);
    });
  });
});

main.module('admin.validate', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.receiptCriteria = new mod.ReceiptCriteria();
      this.pos = new mod.POS();
      this.paymentCriteria = new mod.PaymentCriteria();
      this.receiptsSummary = new mod.ReceiptsSummary();
      this.receipts = new mod.Receipts();
      this.payment = new mod.Payment();
      this.payments = new mod.Payments();
      this.mainLayout = new mod.MainLayout();
      this.paymentValidateView = new mod.PaymentValidateView();
      this.paymentControleView = new mod.PaymentControleView();
      this.paymentSearchView = new mod.PaymentSearchView();
      this.settlement = new mod.Settlement();
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
        var theReceipts = setl.get('receipts');
        _.each(recs, function (receipt) {
          theReceipts.push(receipt);
        });
      });
      var parts = this.payment.get('parts');
      parts.fromRequest(payment.parts);
    }
  });
});





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

main.module('admin.validate', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('admin:paymentSearch', function (criteria,
      payback) {
      return app.common.post('/svc/payment/adminPaymentSearch', {
        criteria: criteria,
        payback: payback
      });
    });
    app.reqres.setHandler('admin:validate', function (payment) {
      return app.common.post('/svc/payment/validatePayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('payment:save', function (payment) {
      return app.common.post('/svc/admin/payment/cancelReceipt', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:delay', function (payment) {
      return app.common.post('/svc/payment/delayPayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:reject', function (payment) {
      return app.common.post('/svc/payment/rejectPayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:finalize', function (payment) {
      return app.common.post('/svc/payment/finalizePayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:reverseValidation', function (payment) {
      return app.common.post('/svc/payment/reverseValidatePayment', {
        payment: payment
      });
    });
    app.reqres.setHandler('admin:receiptSearch', function (criteria,
      payment, allReceipts) {
      return app.common.post('/svc/receipt/adminReceiptSearch', {
        criteria: criteria,
        payment: payment,
        allReceipts: allReceipts
      });
    });
  });
});

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
