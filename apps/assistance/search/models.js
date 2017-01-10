main.module('assistance.search', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['subsDateFrom', 'subsDateTo', 'effcDateFrom',
      'effcDateTo'
    ],
    defaults: {
      reference: null,
      country: null,
      clientname: null,
      clientid: null
    }
  });
  mod.PolicySummary = Backbone.Model.extend({
    /*
    numero: Contract or Quote Reference
    country; Pays
    effectiveDate: Contract or Quote effective date
    cliName: Client Name
    premium: Premium Raised Equal to 0 for Quote
    details: Link to Consultation Process page
    */
    dateAttributes: ['effectiveDate'],
    defaults: function () {
      return {
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    }
  });
  mod.Policies = Backbone.Collection.extend({
    model: mod.PolicySummary
  });
});
