main.module('auto.search', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['effcDateFrom', 'effcDateTo'],
    defaults: {
      reference: null,
      clientname: null,
      clientid: null,
      vehicle: null,
      status: null,
      type: null,
      nature: null
    }
  });
  mod.PolicySummary = Backbone.Model.extend({
    /*
    numero: Contract or Quote Reference
    effectiveDate: Contract or Quote effective date
    vehicle: Vehicle Registration Number
    cliName: Client Name
    premium: Premium Raised Equal to 0 for Quote
    details: Link to Consultation Process page
    */
    dateAttributes: ['effectiveDate', 'subscribeDate', 'endDate'],
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
