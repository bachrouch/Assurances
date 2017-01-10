main.module('assistance.consult', function (mod, app, Backbone, Marionette) {
  mod.PolicyConsultView = Marionette.Layout.extend({
    template: '#assistance-consult',
    regions: {
      title: '.tkf-title',
      header: '.tkf-header',
      travel: '.tkf-travel',
      coverages: '.tkf-coverages',
      premium: '.tkf-premium',
      subscriber: '.tkf-subscriber'
    },
    onRender: function () {
      var policy = mod.controller.container.get('policy');
      var travel = mod.controller.container.get('travel');
      var coverages = mod.controller.container.get('coverages');
      var person = mod.controller.container.get('person');
      var company = mod.controller.container.get('company');
      this.title.show(new mod.ConsultTitle({
        model: policy
      }));
      this.header.show(new app.assistance.QuoteConsultHeader({
        model: policy
      }));
      this.travel.show(new app.assistance.QuoteConsultTravel({
        model: travel
      }));
      this.coverages.show(new app.assistance.CoverageConsultTable({
        collection: coverages
      }));
      this.premium.show(new app.assistance.QuoteConsultPremium({
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
    }
  });
  mod.ConsultTitle = Marionette.ItemView.extend({
    template: '#assistance-consult-title'
  });
});
