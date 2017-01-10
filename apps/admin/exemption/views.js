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
