main.module('mySpace.exemption', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'exemption': function (criteria) {
          app.execute('exemption:search', criteria);
        },
        'exemption/:reference/consult': function (reference) {
          app.execute('exemption:consult', reference);
        }
      }
    });
  });
});

main.module('mySpace.exemption', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('exemption:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.mainLayout);
    });
    app.commands.setHandler('exemption:consult', function (reference) {
      app.request('mySpace:exemptionConsult', {
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
        })
        .fail(app.fail);
    });
  });
});

main.module('mySpace.exemption', function (mod, app, Backbone, Marionette) {
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
      this.paymentExemptionConsultView = new mod.PaymentExemptionConsultView();
      this.checkBtn = new mod.CheckBtn();
      this.sendExep = new mod.SendExep();
    },
    getPayData: function (ref, cb) {
      var self = this;
      app.request('mySpace:paymentSearch', {
          reference: ref
        })
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





main.module('mySpace.exemption', function (mod, app, Backbone) {
  mod.CheckBtn = Backbone.Model.extend({
    defaults: function () {
      return {
        status: ''
      };
    }
  });
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
    dateAttributes: ['fromCreationDate', 'toCreationDate'],
    defaults: function () {
      return {
        pos: null,
        reference: null,
        status: null,
        fromCreationDate: null,
        toCreationDate: null,
        type: null,
        num: null
      };
    }
  });
  mod.SendExep = Backbone.Model.extend({
    defaults: function () {
      return {
        status: ''
      };
    }
  });
});

main.module('mySpace.exemption', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('mySpace:exemptionSearch', function (criteria) {
      return app.common.post('/svc/exemption/exemptionSearch', {
        criteria: criteria
      });
    });
    app.reqres.setHandler('mySpace:paymentSearch', function (criteria,
      payback) {
      return app.common.post('/svc/payment/adminPaymentSearch', {
        criteria: criteria,
        payback: payback
      });
    });
    app.reqres.setHandler('mySpace:exemptionConsult', function (
      criteria) {
      return app.common.post('/svc/exemption/exemptionConsult', {
        criteria: criteria
      });
    });
  });
});

main.module('mySpace.exemption', function (mod, app, Backbone, Marionette, $, _) {
  mod.MainLayout = Marionette.Layout.extend({
    template: '#mySpace-search-exemptions',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.ExemptionSearchView());
    }
  });
  // Formulaire de recherche des dérogations
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#mySpace-exemption-search-criteria')
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
      type: {
        title: 'Type',
        type: 'CustSelect',
        data: 'common:exemptionType'
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
        app.request('mySpace:exemptionSearch', this.model)
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
    template: '#mySpace-exemption-search-result-row',
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
    template: '#mySpace-exemption-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.ExemptionConsultDetails = Marionette.ItemView.extend({
    template: '#mySpace-exemption-consult-details-view',
    templateHelpers: {
      updateStatus: function () {
        return _.updateExemptionStatus(this.status);
      }
    }
  });
  mod.ReceiptToAddRow = Marionette.ItemView.extend({
    template: '#mySpace-exemption-receipt-to-report-consult-row',
    tagName: 'tr'
  });
  // Liste des Quittances à reporter
  mod.ReceiptsToReport = Marionette.CompositeView.extend({
    template: '#mySpace-exemption-receipts-to-report-table',
    itemView: mod.ReceiptToAddRow,
    itemViewContainer: 'tbody'
  });
  //Ecran de consultation des détails de la dérogation
  mod.ExemptionConsultView = Marionette.Layout.extend({
    template: '#mySpace-exemption-consult-view',
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
  mod.ExemptionDetails = Marionette.ItemView.extend({
    template: '#mySpace-exemption-details-view',
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
    template: '#mySpace-exemption-act-result-row'
  });
  mod.ExemptionActionsTable = Marionette.CompositeView.extend({
    template: '#mySpace-exemption-actions-table',
    itemView: mod.Act,
    itemViewContainer: 'tbody'
  });
  mod.ExemptionStatusDetails = Marionette.ItemView.extend({
    template: '#mySpace-exemption-response-details-view',
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
      app.request('mySpace:exemptionSearch', {
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
    template: '#mySpace-exemption-status-summary-view',
    regions: {
      exemptionStatusDetails: '.tkf-exemption-status-details'
    },
    onRender: function () {
      this.exemptionStatusDetails.show(new mod.ExemptionStatusDetails({
        model: mod.controller.exemption
      }));
    }
  });
  // mod.UnlockSubscription = app.common.CustForm.extend({
  //   template: _.template($('#mySpace-controle-button')
  //     .html()),
  //   schema: {
  //     newLockDate: {
  //       title: 'Nouvelle date de blocage',
  //       type: 'CustDate'
  //     }
  //   },
  //   templateData: function () {
  //     return this.model.toJSON();
  //   },
  //   initListeners: function () {
  //     this.listenTo(this.model, 'change:newLockDate', function () {
  //       mod.controller.checkBtn.set('status', 'true');
  //     });
  //   },
  //   render: function () {
  //     app.common.CustForm.prototype.render.apply(this, arguments);
  //     setTimeout(_.bind(function () {
  //       this.initListeners();
  //     }, this), 0);
  //     return this;
  //   },
  //   unlockSubscription: function () {
  //     this.commit();
  //     var exemptionRef = mod.controller.exemption.get('reference');
  //     var newLockDate = moment(this.model.get('newLockDate'))
  //       .format('YYYY-MM-DD');
  //     if (moment()
  //       .isAfter(newLockDate) || !moment(newLockDate)
  //       .isValid()) {
  //       app.alert('Veuillez choisir une date future!');
  //     }
  //     else {
  //       app.request('mySpace:unlockSubscription', this.model,
  //           exemptionRef)
  //         .done(function () {
  //           app.alert('Déblocage effectué avec succés!');
  //         })
  //         .fail(app.fail);
  //     }
  //   },
  //   events: {
  //     'click a[data-actions="unlockSubscription"]': 'unlockSubscription'
  //   }
  // });
  mod.ExemptionDetailsView = Marionette.Layout.extend({
    template: '#mySpace-exemption-manage-details-view',
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
  mod.PaymentExemptionConsultView = Marionette.Layout.extend({
    template: '#mySpace-payment-exemption-manage-view',
    regions: {
      detailsExemption: '.tkf-exemption-manage-details',
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
    }
  });
  // Ecran Recherche des dérogations
  mod.ExemptionSearchView = Marionette.Layout.extend({
    template: '#mySpace-exemption-search-view',
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
