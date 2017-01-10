/*jslint browser:true */
main.module('loan.valid', function (mod, app, Backbone, Marionette, $, _) {
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#loan-consult',
    regions: {
      insured: '.tkf-insured',
      insuredEdit: '.tkf-insured-edit',
      insuredComp: '.tkf-insured-comp',
      loan: '.tkf-loan',
      loanEdit: '.tkf-loan-edit',
      beneficiary: '.tkf-beneficiary',
      beneficiaryEdit: '.tkf-beneficiary-edit',
      premium: '.tkf-premium',
      premiumEdit: '.tkf-premium-edit',
      subscriber: '.tkf-subscriber',
      subscriberEdit: '.tkf-subscriber-edit',
      policyValidate: '.tkf-policy-validate'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var insured = mod.controller.container.get('insured');
      var editInsured = mod.controller.container.get('editInsured');
      var loan = mod.controller.container.get('loan');
      var editLoan = mod.controller.container.get('editLoan');
      var beneficiary = mod.controller.container.get('beneficiary');
      var editBeneficiary = mod.controller.container.get('editBenef');
      var editContribution = mod.controller.container.get(
        'editContrib');
      var insuredComp = mod.controller.container.get('insuredComp');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      var editSubscriber = mod.controller.container.get(
        'editSubscriber');
      if (policy.get('userAdmin')) {
        this.$('.page-header h3')
          .append('Administration police N° ' + policy.get(
            'reference'));
        this.insured.show(new app.loan.InsuredForm({
          model: insured
        }));
        editInsured.set('modelName', 'insured');
        this.insuredEdit.show(new mod.EditView({
          model: editInsured
        }));
        this.$('.tkf-insured-comp')
          .addClass('hidden');
        this.insuredComp.show(new mod.InsuredComplementData({
          model: insuredComp
        }));
        this.loan.show(new app.loan.CreditForm({
          model: loan
        }));
        editLoan.set('modelName', 'loan');
        this.loanEdit.show(new mod.EditView({
          model: editLoan
        }));
        this.beneficiary.show(new app.loan.BeneficiaryForm({
          model: beneficiary
        }));
        editBeneficiary.set('modelName', 'beneficiary');
        this.beneficiaryEdit.show(new mod.EditView({
          model: editBeneficiary
        }));
        this.premium.show(new app.loan.PolicyPremiumOperation({
          model: policy
        }));
        editContribution.set('modelName', 'policy');
        this.premiumEdit.show(new mod.EditView({
          model: editContribution
        }));
        if (person) {
          editSubscriber.set('modelName', 'person');
          this.subscriberEdit.show(new mod.EditView({
            model: editSubscriber
          }));
          this.subscriber.show(new mod.SubscriberEditView({
            model: person
          }));
        }
        else if (company) {
          editSubscriber.set('modelName', 'company');
          this.subscriberEdit.show(new mod.EditView({
            model: editSubscriber
          }));
          this.subscriber.show(new mod.SubscriberEditView({
            model: company
          }));
        }
        this.policyValidate.show(new mod.PolicyValidAction({
          model: policy
        }));
      }
      else {
        this.$('.page-header h3')
          .append('Validation police N° ' + policy.get('reference'));
        this.insured.show(new app.loan.QuoteConsultInsured({
          model: insured
        }));
        this.$('.tkf-insured-edit')
          .addClass('hidden');
        this.loan.show(new app.loan.QuoteConsultCredit({
          model: loan
        }));
        this.$('.tkf-insured-comp')
          .addClass('hidden');
        this.$('.tkf-loan-edit')
          .addClass('hidden');
        this.beneficiary.show(new app.loan.QuoteConsultBeneficiary({
          model: beneficiary
        }));
        this.$('.tkf-beneficiary-edit')
          .addClass('hidden');
        this.premium.show(new app.loan.QuoteConsultPremium({
          model: policy
        }));
        this.$('.tkf-premium-edit')
          .addClass('hidden');
        if (person) {
          this.subscriber.show(new app.actors.PersonConsult({
            model: person
          }));
        }
        else if (company) {
          this.subscriber.show(new app.actors.CompanyConsult({
            model: company
          }));
        }
        this.$('.tkf-subscriber-edit')
          .addClass('hidden');
        this.policyValidate.show(new mod.PolicyValidView({
          model: policy
        }));
      }
    }
  });
  mod.InsuredComplementData = Marionette.Layout.extend({
    template: '#loan-insured-layout',
    regions: {
      insuredComp: '.tkf-insured-comp',
      medicalSelection: '.tkf-medical-selection',
      complEdit: '.tkf-insured-comp-edit'
    },
    onRender: function () {
      var insured = this.model;
      var medSelection = insured.get('medicalSelection');
      var editInsuredComp = mod.controller.container.get(
        'editInsuredComp');
      this.insuredComp.show(new app.loan.InsuredHgWg({
        model: insured
      }));
      this.medicalSelection.show(new app.loan.MedQuestFormTable({
        collection: medSelection
      }));
      editInsuredComp.set('modelName', 'insuredComp');
      this.complEdit.show(new mod.EditView({
        model: editInsuredComp
      }));
    }
  });
  mod.SubscriberEditView = Marionette.Layout.extend({
    template: '#loan-edit-subscriber',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      insuredType: '.tkf-insured-type',
      subscriber: '.tkf-subscriber'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.loan.QuoteFormSubscriber({
        model: mod.controller.container.get('subscriberType')
      }));
    },
    renderInsuredType: function () {
      var self = this;
      this.insuredType.show(new app.loan.QuoteFormInsured({
        model: mod.controller.container.get('insuredSubscriber')
      }));
      this.insuredType.currentView.on('insuredType:set', function () {
        var currentInsuredType = self.insuredType.currentView;
        if (currentInsuredType.getValue('insuredType') ===
          'Assuré') {
          var currentSubscriber = self.subscriber.currentView;
          var insuredModel = mod.controller.container.get(
            'insured');
          currentSubscriber.setValue(insuredModel.attributes);
        }
      });
    },
    renderSubscriber: function () {
      var policy = mod.controller.container.get('policy');
      if (policy.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonForm({
          model: mod.controller.container.get('person')
        }));
      }
      else if (policy.isSubscriberCompany()) {
        this.subscriber.show(new app.actors.CompanyForm({
          model: mod.controller.container.get('company')
        }));
      }
      else {
        this.subscriber.close();
      }
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
      this.renderInsuredType();
    },
    initialize: function () {
      var policy = mod.controller.container.get('policy');
      var subscriberType = mod.controller.container.get(
        'subscriberType');
      var editSubscriber = mod.controller.container.get(
        'editSubscriber');
      this.listenTo(subscriberType, 'change:subscriber', function () {
        policy.set('subscriber', subscriberType.get('subscriber'));
        policy.trigger('commit');
        if (subscriberType.get('subscriber') ===
          'Personne physique') {
          editSubscriber.set('modelName', 'person');
        }
        else {
          editSubscriber.set('modelName', 'company');
        }
        editSubscriber.trigger('commit');
      });
      this.listenTo(policy, 'change:subscriber', function () {
        if (policy.wasSubscriberPerson()) {
          mod.controller.container.get('person')
            .trigger('flush');
        }
        else {
          mod.controller.container.get('company')
            .trigger('flush');
        }
        this.renderSubscriber();
      });
    }
  });
  mod.PolicyValidView = app.common.CustForm.extend({
    template: _.template($('#loan-policy-valid-view')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.receiptDoc = new app.common.DocView({
        model: this.model.get('receiptDoc')
      });
      this.attestationDoc = new app.common.DocView({
        model: this.model.get('attestationDoc')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="rcPrint"]')
        .append(this.receiptDoc.render()
          .el);
      this.$('[data-actions="atPrint"]')
        .append(this.attestationDoc.render()
          .el);
      if (this.model.get('isValid')) {
        this.$('[data-actions="validateContract"]')
          .removeClass('btn-danger');
        this.$('[data-actions="validateContract"]')
          .addClass('btn-success');
      }
    },
    validateContract: function () {
      var policy = mod.controller.container.get('policy');
      app.request('loan:contract:validate', {
          policy: policy
        })
        .done(function (data) {
          policy.get('receiptDoc')
            .fromRequest(data.receiptDoc);
          policy.get('attestationDoc')
            .fromRequest(data.attestationDoc);
          policy.set('validated', true);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="validateContract"]': 'validateContract'
    }
  });
  mod.PolicyValidAction = Marionette.Layout.extend({
    template: '#loan-policy-valid-actions',
    regions: {
      validationLocks: '.tkf-validation-locks',
      valicationActions: '.tkf-validation-action'
    },
    onRender: function () {
      var validationLocks = mod.controller.container.get(
        'validationLocks');
      this.validationLocks.show(new mod.PolicyValidLocks({
        collection: validationLocks
      }));
      this.valicationActions.show(new mod.PolicyValidView({
        model: this.model
      }));
    }
  });
  mod.PolicyValidLock = app.common.CustForm.extend({
    template: _.template($('#loan-policy-valid-lock-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      if (this.model.get('validated') === true) {
        this.$('[data-actions="lockValidation"]')
          .addClass('disabled');
      }
      else if (this.model.get('validated') === false) {
        this.$('[data-actions="unlockValidation"]')
          .addClass('disabled');
      }
    },
    lockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var currValid = this.model;
      var self = this;
      app.request('loan:admin:lockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function () {
          self.$('[data-actions="lockValidation"]')
            .addClass('disabled');
          self.$('[data-actions="unlockValidation"]')
            .removeClass('disabled');
        })
        .fail(app.fail);
    },
    unlockValidation: function () {
      var policy = mod.controller.container.get('policy');
      var currValid = this.model;
      var self = this;
      app.request('loan:admin:unlockvalidation', {
          policy: policy,
          valid: currValid
        })
        .done(function () {
          self.$('[data-actions="unlockValidation"]')
            .addClass('disabled');
          self.$('[data-actions="lockValidation"]')
            .removeClass('disabled');
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="lockValidation"]': 'lockValidation',
      'click a[data-actions="unlockValidation"]': 'unlockValidation'
    }
  });
  mod.PolicyValidLocks = Marionette.CompositeView.extend({
    template: '#loan-policy-valid-locks',
    itemView: mod.PolicyValidLock,
    itemViewContainer: 'tbody'
  });
  mod.EditView = Marionette.Layout.extend({
    template: '#loan-validat-layout',
    editModView: function () {
      var modelName = this.model.get('modelName');
      var selectedModel = mod.controller.container.get(modelName);
      selectedModel.set('lockcontrols', false);
      if (selectedModel.get('medicalSelection')) {
        _.each(selectedModel.get('medicalSelection')
          .models,
          function (item) {
            item.set('lockcontrols', false);
          });
      }
      if (modelName === 'person' || modelName === 'company') {
        var subscriberType = mod.controller.container.get(
          'subscriberType');
        subscriberType.set('lockcontrols', false);
        var insuredSubscriber = mod.controller.container.get(
          'insuredSubscriber');
        insuredSubscriber.set('lockcontrols', false);
      }
      this.$('[data-actions="saveModView"]')
        .removeClass('disabled');
      this.$('[data-actions="editModView"]')
        .addClass('disabled');
    },
    saveModView: function () {
      var self = this;
      var modelName = this.model.get('modelName');
      var selectedModel = mod.controller.container.get(modelName);
      var policy = mod.controller.container.get('policy');
      var updatedFields = mod.controller.container.get(
        'updatedFields');
      updatedFields.clear();
      var prevAtt = selectedModel.previousAttributes();
      var subscriberType = mod.controller.container.get(
        'subscriberType');
      var insuredSubscriber = mod.controller.container.get(
        'insuredSubscriber');
      selectedModel.trigger('commit');
      if (selectedModel.validationError) {
        return;
      }
      var actuAtt = selectedModel.attributes;
      var dataToSend = {};
      var actuVal;
      if (_.size(prevAtt) > 1) {
        for (var key in prevAtt) {
          if (key !== 'lockcontrols') {
            if (prevAtt.hasOwnProperty(key)) {
              var prevVal = prevAtt[key];
              if (actuAtt.hasOwnProperty(key)) {
                actuVal = actuAtt[key];
                if (prevVal !== actuVal) {
                  dataToSend[key] = actuVal;
                }
              }
            }
          }
        }
      }
      else {
        for (var actkey in actuAtt) {
          actuVal = actuAtt[actkey];
          if (actuVal !== null) {
            dataToSend[actkey] = actuVal;
          }
        }
      }
      updatedFields.set(dataToSend);
      var extraToSend;
      var sExtra;
      if (selectedModel.get('medicalSelection')) {
        extraToSend = [];
        _.each(selectedModel.get('medicalSelection')
          .models,
          function (item) {
            item.trigger('commit');
            if (item.validationError) {
              return;
            }
            sExtra = {};
            sExtra.id = item.get('id');
            sExtra.answerYes = item.get('answerYes');
            sExtra.answerDetails = item.get('answerDetails');
            extraToSend.push(sExtra);
            item.set('lockcontrols', true);
          });
      }
      if (modelName === 'person') {
        policy.set('subscriber', 'Personne physique');
        policy.set('updateAdmin', true);
        policy.set('subscriberType', subscriberType);
        policy.set('insuredType', insuredSubscriber.get('insuredType'));
        app.request('loan:subscriber:check', {
            quote: policy,
            subscriber: mod.controller.container.get('person')
          })
          .done(function (data) {
            if (data.forUpdate) {
              var dialog = new app.common.DiagView({
                el: '#modal'
              });
              var diagMod = new Backbone.Model();
              var msgBody = 'D\'autres données existent pour';
              msgBody += ' ce souscripteur. Continuer?';
              diagMod.set('dialogBody', msgBody);
              var upSubs = new app.common.DialogBody({
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
                policy.set('fupdateSubs', true);
                app.request('loan:subscriber:set', {
                    quote: policy,
                    subscriber: mod.controller.container.get(
                      'person')
                  })
                  .done(function () {
                    selectedModel.set('lockcontrols', true);
                    subscriberType.set('lockcontrols', true);
                    insuredSubscriber.set('lockcontrols', true);
                    self.$('[data-actions="saveModView"]')
                      .addClass('disabled');
                    self.$('[data-actions="editModView"]')
                      .removeClass('disabled');
                  })
                  .fail(app.fail);
              };
              diagbut.no = {};
              diagbut.no.label = 'Non';
              diagbut.no.className = 'col-sm-3 btn-warning';
              diagbut.no.className += ' pull-right';
              diagbut.no.callback = function () {
                policy.set('fupdateSubs', false);
              };
              upSubs.closeButton = false;
              upSubs.buttons = diagbut;
              dialog.show(upSubs);
            }
            else {
              app.request('loan:subscriber:set', {
                  quote: policy,
                  subscriber: mod.controller.container.get(
                    'person')
                })
                .done(function () {
                  selectedModel.set('lockcontrols', true);
                  subscriberType.set('lockcontrols', true);
                  insuredSubscriber.set('lockcontrols', true);
                  self.$('[data-actions="saveModView"]')
                    .addClass('disabled');
                  self.$('[data-actions="editModView"]')
                    .removeClass('disabled');
                })
                .fail(app.fail);
            }
          })
          .fail(app.fail);
      }
      else if (modelName === 'company') {
        policy.set('subscriber', 'Personne morale');
        policy.set('updateAdmin', true);
        policy.set('subscriberType', subscriberType);
        policy.set('insuredType', insuredSubscriber.get('insuredType'));
        app.request('loan:subscriber:check', {
            quote: policy,
            subscriber: mod.controller.container.get('company')
          })
          .done(function (data) {
            if (data.forUpdate) {
              var dialog = new app.common.DiagView({
                el: '#modal'
              });
              var diagMod = new Backbone.Model();
              var msgBody = 'D\'autres données existent pour';
              msgBody += ' ce souscripteur. Continuer?';
              diagMod.set('dialogBody', msgBody);
              var upSubs = new app.common.DialogBody({
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
                policy.set('fupdateSubs', true);
                app.request('loan:subscriber:set', {
                    quote: policy,
                    subscriber: mod.controller.container.get(
                      'company')
                  })
                  .done(function () {
                    selectedModel.set('lockcontrols', true);
                    subscriberType.set('lockcontrols', true);
                    insuredSubscriber.set('lockcontrols', true);
                    self.$('[data-actions="saveModView"]')
                      .addClass('disabled');
                    self.$('[data-actions="editModView"]')
                      .removeClass('disabled');
                  })
                  .fail(app.fail);
              };
              diagbut.no = {};
              diagbut.no.label = 'Non';
              diagbut.no.className = 'col-sm-3 btn-warning';
              diagbut.no.className += ' pull-right';
              diagbut.no.callback = function () {
                policy.set('fupdateSubs', false);
              };
              upSubs.closeButton = false;
              upSubs.buttons = diagbut;
              dialog.show(upSubs);
            }
            else {
              app.request('loan:subscriber:set', {
                  quote: policy,
                  subscriber: mod.controller.container.get(
                    'company')
                })
                .done(function () {
                  selectedModel.set('lockcontrols', true);
                  subscriberType.set('lockcontrols', true);
                  insuredSubscriber.set('lockcontrols', true);
                  self.$('[data-actions="saveModView"]')
                    .addClass('disabled');
                  self.$('[data-actions="editModView"]')
                    .removeClass('disabled');
                })
                .fail(app.fail);
            }
          })
          .fail(app.fail);
      }
      else {
        selectedModel.set('lockcontrols', true);
        this.$('[data-actions="saveModView"]')
          .addClass('disabled');
        this.$('[data-actions="editModView"]')
          .removeClass('disabled');
        app.request('loan:admin:edit', {
            policy: policy,
            editedmodel: modelName,
            newdata: updatedFields,
            extradata: extraToSend
          })
          .done()
          .fail(app.fail);
      }
    },
    displayInsured: function () {
      var vis = window.$('.tkf-insured-comp.hidden');
      if (vis.length >= 1) {
        vis.removeClass('hidden');
        this.$('[data-actions="displayInsured"]')
          .text('Fermer');
      }
      else {
        this.$('[data-actions="displayInsured"]')
          .text('Autres informations');
        vis = window.$('.tkf-insured-comp');
        vis.addClass('hidden');
      }
    },
    onRender: function () {
      this.$('[data-actions="saveModView"]')
        .addClass('disabled');
      if (this.model.get('modelName') === 'insured') {
        this.$('[data-actions="displayInsured"]')
          .removeClass('hidden');
      }
    },
    events: {
      'click a[data-actions="editModView"]': 'editModView',
      'click a[data-actions="saveModView"]': 'saveModView',
      'click a[data-actions="displayInsured"]': 'displayInsured'
    }
  });
});
