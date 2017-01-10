main.module('assistance.subscribe', function (mod, app, Backbone, Marionette, $,
  _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#assistance-subscribe',
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
    template: '#assistance-subscribe-summary',
    regions: {
      travel: '.tkf-summary-travel',
      contract: '.tkf-summary-contract',
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
    renderTravel: function () {
      this.renderItem('travel');
    },
    renderPremium: function () {
      this.renderItem('premium');
    },
    renderSubscriber: function () {
      this.renderItem('subscriber');
    },
    onRender: function () {
      this.renderContract();
      this.renderTravel();
      this.renderPremium();
      this.renderSubscriber();
    },
    modelEvents: {
      'change:contract': 'renderContract',
      'change:travel': 'renderTravel',
      'change:premium': 'renderPremium',
      'change:subscriber': 'renderSubscriber'
    }
  });
  mod.Step1View = app.common.StepView.extend({
    template: '#assistance-subscribe-step1',
    regions: {
      travel: '.tkf-travel',
      pricings: '.tkf-pricingList'
    },
    onRender: function () {
      this.travel.show(new app.assistance.TravelForm({
        model: mod.controller.container.get('travel')
      }));
      this.pricings.show(new app.assistance.PricingsView({
        collection: mod.controller.container.get('pricings')
      }));
    }
  });
  mod.Step2View = app.common.StepView.extend({
    template: '#assistance-subscribe-step2',
    regions: {
      quote: '.tkf-quote-form',
      travel: '.tkf-quote-travel',
      premium: '.tkf-quote-premium'
    },
    onRender: function () {
      this.quote.show(new app.assistance.QuoteForm({
        model: mod.controller.container.get('quote')
      }));
      this.travel.show(new app.assistance.QuoteConsultTravel({
        model: mod.controller.container.get('travel')
      }));
      this.premium.show(new app.assistance.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    }
  });
  mod.Step3View = app.common.StepView.extend({
    template: '#assistance-subscribe-step3',
    regions: {
      subscriberType: '.tkf-subscriber-type',
      subscriber: '.tkf-subscriber',
      travelers: '.tkf-travelers',
      personToPrevent: '.tkf-person-to-prevent',
      doctor: '.tkf-doctor'
    },
    renderSubscriberType: function () {
      this.subscriberType.show(new app.assistance.QuoteFormSubscriber({
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
      else if (quote.isSubscriberCompany()) {
        this.subscriber.show(new app.actors.CompanyFormAndMap({
          model: mod.controller.container.get('company')
        }));
      }
      else {
        this.subscriber.close();
      }
    },
    renderTravelers: function () {
      this.travelers.show(new app.assistance.TravelerFormTable({
        collection: mod.controller.container.get('travelers')
      }));
    },
    renderPersonToprevent: function () {
      this.personToPrevent.show(new app.assistance.ThirdPartyPersonForm({
        model: mod.controller.container.get('personToPrevent')
      }));
    },
    renderDoctor: function () {
      this.doctor.show(new app.assistance.ThirdPartyPersonForm({
        model: mod.controller.container.get('doctor')
      }));
    },
    onRender: function () {
      this.renderSubscriberType();
      this.renderSubscriber();
      this.renderTravelers();
      this.renderPersonToprevent();
      this.renderDoctor();
    },
    initialize: function () {
      app.common.StepView.prototype.initialize.apply(this, arguments);
      var quote = mod.controller.container.get('quote');
      this.listenTo(quote, 'change:subscriber', function () {
        if (quote.wasSubscriberPerson()) {
          mod.controller.container.get('person')
            .trigger('flush');
        }
        else if (quote.wasSubscriberCompany()) {
          mod.controller.container.get('company')
            .trigger('flush');
        }
        this.renderSubscriber();
      });
    }
  });
  mod.Step4View = app.common.StepView.extend({
    template: '#assistance-subscribe-step4',
    regions: {
      subscriber: '.tkf-step5-subscriber',
      premium: '.tkf-step5-premium',
      message: '.tkf-step5-message',
      header: '.tkf-quote-header',
      travel: '.tkf-quote-travel',
      save: '.tkf-step5-save'
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
      this.premium.show(new app.assistance.QuoteConsultPremium({
        model: mod.controller.container.get('quote')
      }));
    },
    renderMessage: function () {
      this.message.show(new app.assistance.ContractConsultMessage({
        model: mod.controller.container.get('quote')
      }));
    },
    renderSave: function () {
      this.save.show(new app.assistance.ContractSave({
        model: mod.controller.container.get('quote')
      }));
    },
    renderHeader: function () {
      this.header.show(new app.assistance.QuoteConsultHeader({
        model: mod.controller.container.get('quote')
      }));
    },
    renderTravel: function () {
      this.travel.show(new app.assistance.QuoteConsultTravel({
        model: mod.controller.container.get('travel')
      }));
    },
    onRender: function () {
      this.renderSubscriber();
      this.renderPremium();
      this.renderMessage();
      this.renderSave();
      this.renderHeader();
      this.renderTravel();
    }
  });
});
