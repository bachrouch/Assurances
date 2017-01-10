main.module('auto.subscribe', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-subscribe',
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
    template: '#auto-subscribe-summary',
    regions: {
      contract: '.tkf-summary-contract',
      vehicle: '.tkf-summary-vehicle',
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
    renderContract: function () {
      this.renderItem('contract');
    },
    renderVehicle: function () {
      this.renderItem('vehicle');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderContract();
      this.renderVehicle();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:contract': 'renderContract',
      'change:vehicle': 'renderVehicle',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.Step1View = app.common.StepView.extend({
    template: '#auto-subscribe-step1',
    regions: {
      insured: '.tkf-insured',
      vehicle: '.tkf-vehicle'
    },
    onRender: function () {
      this.insured.show(new app.auto.InsuredForm({
        model: mod.controller.container.get('insured')
      }));
      this.vehicle.show(new app.auto.VehicleForm({
        model: mod.controller.container.get('vehicle')
      }));
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#auto-subscribe-step2',
    regions: {
      quote: '.tkf-quote-form',
      coverages: '.tkf-coverages'
    },
    onRender: function () {
      this.quote.show(new app.auto.QuoteForm({
        model: mod.controller.container.get('quote')
      }));
      this.coverages.show(new app.auto.CoverageFormTable({
        collection: mod.controller.container.get('coverages')
      }));
    }
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#auto-subscribe-step3',
    regions: {
      header: '.tkf-quote-header',
      vehicle: '.tkf-quote-vehicle',
      coverages: '.tkf-quote-coverages',
      premium: '.tkf-quote-premium',
      message: '.tkf-quote-message',
      save: '.tkf-quote-save'
    },
    onRender: function () {
      this.header.show(new app.auto.QuoteConsultHeader({
        model: mod.controller.container.get('quote')
      }));
      this.vehicle.show(new app.auto.QuoteConsultVehicle({
        model: mod.controller.container.get('vehicle')
      }));
      this.coverages.show(new app.auto.CoverageConsultTable({
        collection: new app.auto.Coverages(mod.controller.container
          .get('coverages')
          .filter(function (c) {
            return c.get('subscribed');
          }))
      }));
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
      this.message.show(new app.auto.QuoteConsultMessage({
        model: mod.controller.container.get('quote')
      }));
      this.save.show(new app.auto.QuoteSave({
        model: mod.controller.container.get('quote')
      }));
    }
  });
  mod.Step4View = app.common.StepView.extend({
    template: '#auto-subscribe-step4',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      subscriber: '.tkf-subscriber',
      insuredType: '.tkf-insured-type',
      insuredStructure: '.tkf-insured-structure',
      beneficiary: '.tkf-beneficiary'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.auto.QuoteFormSubscriber({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonFormAndMap({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyFormAndMap({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderInsuredType: function () {
      var self = this;
      this.insuredType.show(new app.auto.QuoteFormInsured({
        model: mod.controller.container.get('quote')
      }));
      this.insuredType.currentView.on('insuredType:set', function () {
        var currentSubscriberType = self.subscriberType.currentView;
        var currentInsuredType = self.insuredType.currentView;
        var currentSubscriber = self.subscriber.currentView;
        var currentInsured;
        if (currentInsuredType.getValue('insuredType') ===
          'Souscripteur') {
          var subs = currentSubscriberType.getValue('subscriber');
          currentInsuredType.setValue('insured', subs);
          this.commit();
          currentInsured = self.insuredStructure.currentView;
          currentInsured.setValue(currentSubscriber.model.attributes);
          this.disable('insured', true);
        }
        else {
          self.renderInsuredStructure();
          this.disable('insured', false);
        }
      });
    },
    renderInsuredStructure: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isInsuredPerson()) {
        this.insuredStructure.show(new app.actors.PersonInsuredForm({
          model: mod.controller.container.get('insuredperson')
        }));
      }
      else {
        this.insuredStructure.show(new app.actors.CompanyInsuredForm({
          model: mod.controller.container.get('insuredcompany')
        }));
      }
    },
    renderBeneficiary: function () {
      this.beneficiary.show(new app.auto.QuoteFormBeneficiary({
        model: mod.controller.container.get('beneficiary')
      }));
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
      this.renderBeneficiary();
      this.renderInsuredType();
      this.renderInsuredStructure();
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
      this.listenTo(quote, 'change:insured', function () {
        if (quote.wasInsuredPerson()) {
          mod.controller.container.get('insuredperson')
            .trigger('flush');
        }
        else {
          mod.controller.container.get('insuredcompany')
            .trigger('flush');
        }
        this.renderInsuredStructure();
      });
    }
  });
  mod.Step5View = app.common.StepView.extend({
    template: '#auto-subscribe-step5',
    regions: {
      subscriber: '.tkf-step5-subscriber',
      premium: '.tkf-step5-premium',
      message: '.tkf-step5-message',
      save: '.tkf-step5-save'
    },
    renderSubscriber: function () {
      var quote = mod.controller.container.get('quote');
      if (quote.isSubscriberPerson()) {
        this.subscriber.show(new app.actors.PersonConsult({
          model: mod.controller.container.get('person')
        }));
      }
      else {
        this.subscriber.show(new app.actors.CompanyConsult({
          model: mod.controller.container.get('company')
        }));
      }
    },
    renderPremium: function ()  {
      this.premium.show(new app.auto.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new app.auto.ContractSave({
        model: mod.controller.container.get('quote')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderSave();
    }
  });
});
