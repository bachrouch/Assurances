main.module('loan.subscribe', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#loan-subscribe',
    regions: {
      nav: '.tkf-nav',
      content: '.tkf-content',
      summary: '.tkf-summary'
    },
    onRender: function () {
      this.nav.show(new mod.NavView());
      this.summary.show(new mod.SummaryView({
        model: mod.controller.container.get('summary')
      }));
    },
    onStep: function (step) {
      this.content.show(new mod['Step' + step.get('rank') + 'View']({
        model: step
      }));
    },
    onError: function () {
      this.content.currentView.refreshError();
    }
  });
  mod.NavItemView = Marionette.View.extend({
    tagName: 'li',
    template: _.template('<a href="#<%= path %>"><%= label %></a>'),
    initialize: function () {
      this.listenTo(this.model, 'change:active', this.updateActive);
    },
    render: function () {
      var html = this.template(_.extend({
        path: this.model.getPath()
      }, this.model.toJSON()));
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
    }
  });
  mod.NavView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-pills',
    itemView: mod.NavItemView,
    initialize: function () {
      this.collection = mod.controller.container.get('steps');
    }
  });
  mod.SummaryItemView = Marionette.View.extend({
    tagName: 'p',
    template: _.template(
      '<% _.each(a, function(e) { %> <%= e %></br> <% }); %>'),
    render: function () {
      var html = this.template(this.model.toJSON());
      this.$el.html(html);
      return this;
    }
  });
  mod.SummaryView = Marionette.Layout.extend({
    template: '#loan-subscribe-summary',
    regions: {
      insured: '.tkf-summary-insured',
      credit: '.tkf-summary-credit',
      premium: '.tkf-summary-premium',
      subscriber: '.tkf-summary-subscriber'
    },
    renderItem: function (item) {
      this[item].show(new mod.SummaryItemView({
        model: new Backbone.Model({
          a: this.model.get(item)
        })
      }));
    },
    renderInsured: function () {
      this.renderItem('insured');
    },
    renderCredit: function () {
      this.renderItem('credit');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderInsured();
      this.renderCredit();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:insured': 'renderInsured',
      'change:credit': 'renderCredit',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.Step1View = app.common.StepView.extend({
    template: '#loan-subscribe-step1',
    regions: {
      credit: '.tkf-credit',
      beneficiary: '.tkf-beneficiary',
      insured: '.tkf-insured'
    },
    onRender: function () {
      this.credit.show(new app.loan.CreditForm({
        model: mod.controller.container.get('credit')
      }));
      this.beneficiary.show(new app.loan.BeneficiaryForm({
        model: mod.controller.container.get('beneficiary')
      }));
      this.insured.show(new app.loan.InsuredForm({
        model: mod.controller.container.get('insured')
      }));
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#loan-subscribe-step2',
    regions: {
      insuredhgwg: '.tkf-insuredhgwg',
      medquestions: '.tkf-medquestions',
      medselections: '.tkf-medselections',
      medselectdoctor: '.tkf-medselectdoctor',
      doctortestlist: '.tkf-doctortestlist',
      medselectlab: '.tkf-medselectlab',
      labtestlist: '.tkf-labtestlist',
      medselectcardio: '.tkf-medselectcardio',
      cardiotestlist: '.tkf-cardiotestlist',
      medselectimagery: '.tkf-medselectimagery',
      imagerytestlist: '.tkf-imagerytestlist'
    },
    onRender: function () {
      var self = this;
      this.insuredhgwg.show(new app.loan.InsuredHgWg({
        model: mod.controller.container.get('insured')
      }));
      var quote = mod.controller.container.get('quote');
      var applyMedicalSelection = quote.get('applyMedicalSelection');
      if (!applyMedicalSelection) {
        this.medquestions.show(new app.loan.MedQuestFormTable({
          collection: mod.controller.container.get(
            'medquestions')
        }));
        this.$('.panel.panel-default.tkf-medselections')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-doctorpanel')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-labpanel')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-cardiopanel')
          .addClass('hidden');
        this.$('.panel.panel-default.tkf-imagerypanel')
          .addClass('hidden');
      }
      else {
        this.medselections.show(new app.loan.MedSelectFormTable({
          collection: mod.controller.container.get(
            'medselections')
        }));
        this.$('.panel-body.tkf-medquestions')
          .addClass('hidden');
        //DOCTOR FORM AND TEST LIST DISPLAY
        var doctortests = mod.controller.container.get('doctortests');
        if (doctortests.length !== 0) {
          this.medselectdoctor.show(new app.loan.DocMedicalSelection({
            model: mod.controller.container.get(
              'doctorprovider')
          }));
          this.doctortestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get(
              'doctortests')
          }));
          this.medselectdoctor.currentView.on('provider:set',
            function () {
              var doctortests = mod.controller.container.get(
                'doctortests');
              var providerid = self.medselectdoctor.currentView;
              providerid = providerid.getValue('provider');
              var firsttest = doctortests.at(0);
              firsttest.set({
                providerid: providerid
              });
              doctortests.trigger('commit');
            });
        }
        else {
          this.$('.panel.panel-default.tkf-doctorpanel')
            .addClass('hidden');
        }
        //LAB FORM AND TEST DISPLAY
        var labtests = mod.controller.container.get('labtests');
        if (labtests.length !== 0) {
          this.medselectlab.show(new app.loan.LabMedicalSelection({
            model: mod.controller.container.get('labprovider')
          }));
          this.labtestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get('labtests')
          }));
          this.medselectlab.currentView.on('provider:set', function () {
            var labtests = mod.controller.container.get(
              'labtests');
            var providerid = self.medselectlab.currentView;
            providerid = providerid.getValue('provider');
            var firsttest = labtests.at(0);
            firsttest.set({
              providerid: providerid
            });
            labtests.trigger('commit');
          });
        }
        else {
          this.$('.panel.panel-default.tkf-labpanel')
            .addClass('hidden');
        }
        //CARDIO FORM AND TEST DISPLAY
        var cardiotests = mod.controller.container.get('cardiotests');
        if (cardiotests.length !== 0) {
          this.medselectcardio.show(new app.loan.CardioMedicalSelection({
            model: mod.controller.container.get(
              'cardioprovider')
          }));
          this.cardiotestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get(
              'cardiotests')
          }));
          this.medselectcardio.currentView.on('provider:set',
            function () {
              var cardiotests = mod.controller.container.get(
                'cardiotests');
              var providerid = self.medselectcardio.currentView;
              providerid = providerid.getValue('provider');
              var firsttest = cardiotests.at(0);
              firsttest.set({
                providerid: providerid
              });
              cardiotests.trigger('commit');
            });
        }
        else {
          this.$('.panel.panel-default.tkf-cardiopanel')
            .addClass('hidden');
        }
        //MEDICAL IMAGERY FORM AND TEST DISPLAY
        var imagetests = mod.controller.container.get('imagetests');
        if (imagetests.length !== 0) {
          this.medselectimagery.show(new app.loan.ImageMedicalSelection({
            model: mod.controller.container.get('imageprovider')
          }));
          this.imagerytestlist.show(new app.loan.MedSelectFormTable({
            collection: mod.controller.container.get(
              'imagetests')
          }));
          this.medselectimagery.currentView.on('provider:set',
            function () {
              var imagetests = mod.controller.container.get(
                'imagetests');
              var providerid = self.medselectimagery.currentView;
              providerid = providerid.getValue('provider');
              var firsttest = imagetests.at(0);
              firsttest.set({
                providerid: providerid
              });
              imagetests.trigger('commit');
            });
        }
        else {
          this.$('.panel.panel-default.tkf-imagerypanel')
            .addClass('hidden');
        }
      }
    },
    initialize: function () {
      var self = this;
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      var doctortests = mod.controller.container.get('doctortests');
      var labtests = mod.controller.container.get('labtests');
      var cardiotests = mod.controller.container.get('cardiotests');
      var imagetests = mod.controller.container.get('imagetests');
      var doctorprovider = mod.controller.container.get(
        'doctorprovider');
      var labprovider = mod.controller.container.get('labprovider');
      var cardioprovider = mod.controller.container.get(
        'cardioprovider');
      var imageprovider = mod.controller.container.get(
        'imageprovider');
      this.listenTo(doctortests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentdoctor = self.medselectdoctor.currentView;
          currentdoctor.disable('provider', true);
          quote.set('validated', true);
          doctorprovider.set('generated', true);
        }
      });
      this.listenTo(labtests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentlab = self.medselectlab.currentView;
          currentlab.disable('provider', true);
          quote.set('validated', true);
          labprovider.set('generated', true);
        }
      });
      this.listenTo(cardiotests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentcardio = self.medselectcardio.currentView;
          currentcardio.disable('provider', true);
          quote.set('validated', true);
          cardioprovider.set('generated', true);
        }
      });
      this.listenTo(imagetests, 'change', function (model) {
        var medselDoc = model.get('medselDoc');
        if (medselDoc.get('file')) {
          var currentimagery = self.medselectimagery.currentView;
          currentimagery.disable('provider', true);
          quote.set('validated', true);
          imageprovider.set('generated', true);
        }
      });
    }
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#loan-subscribe-step3',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      insuredType: '.tkf-insured-type',
      subscriber: '.tkf-subscriber'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.loan.QuoteFormSubscriber({
        model: mod.controller.container.get('quote')
      }));
    },
    renderInsuredType: function () {
      var self = this;
      this.insuredType.show(new app.loan.QuoteFormInsured({
        model: mod.controller.container.get('quote')
      }));
      this.insuredType.currentView.on('insuredType:set', function () {
        var currentInsuredType = self.insuredType.currentView;
        if (currentInsuredType.getValue('insuredType') ===
          'Assuré') {
          var currentSubscriber = self.subscriber.currentView;
          var insuredModel = mod.controller.container.get(
            'insured');
          currentSubscriber.model.set(insuredModel.attributes);
        }
      });
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonFormAndMap({
          model: mod.controller.container.get('person')
        }));
      }
      else if (quote.isSubscriberCompany()) {
        this.subscriber.show(new app.actors.CompanyFormAndMap({
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
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:subscriber', function () {
        if (quote.wasSubscriberPerson()) {
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
  mod.Step4View = app.common.StepView.extend({
    template: '#loan-subscribe-step4',
    regions: {
      subscriber: '.tkf-step4-subscriber',
      premium: '.tkf-step4-premium',
      premiumOperation: '.tkf-step4-premium-operation',
      message: '.tkf-step4-message',
      save: '.tkf-step4-save'
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: mod.controller.container.get('person')
        }));
      }
      else if (quote.isSubscriberCompany()) {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderPremium: function ()  {
      this.premium.show(new app.loan.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderPremiumOperation: function ()  {
      this.premiumOperation.show(new app.loan.QuotePremiumOperation({
        model: mod.controller.container.get('quote')
      }));
    },
    renderMessage: function () {
      this.message.show(new app.loan.ProjectConsultMessage({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new app.loan.ProjectSave({
        model: mod.controller.container.get('quote')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderPremiumOperation();
      this.renderMessage();
      this.renderSave();
    },
    initialize: function () {
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:premium', function () {
        this.renderPremium();
      });
    }
  });
});
