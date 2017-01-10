main.module('loan.search', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['subsDateFrom', 'subsDateTo', 'effcDateFrom',
      'effcDateTo'
    ],
    defaults: {
      reference: null,
      clientname: null,
      clientid: null,
      insured: null
    }
  });
  mod.Policy = Backbone.Model.extend({
    /*
    numero: Contract or Quote Reference
    effectiveDate: Contract or Quote effective date
    insured: Life Insured name
    cliName: Client Name (subscriber)
    premium: Premium Raised Equal to 0 for Quote
    details: Link to Consultation Process page
    */
    defaults: function () {
      return {
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    },
    dateAttributes: ['effectiveDate']
  });
  mod.Policies = Backbone.Collection.extend({
    model: mod.Policy
  });
});
