main.module('configs.product', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    defaults: {
      contract: null,
      branch: null,
      product: null
    }
  });
  mod.Product = Backbone.Model.extend({
    /*
     * code: number (product code)
     * name: string (product name)
     * branch: string (branch code)
     * status: number (status code of the product 0 disabled 1 activated 2 disabled)
     * effectiveDate: date (product effective date)
     * endDate: date (product end date can be linked with status)
     */
    dateAttributes: ['fromDate', 'toDate'],
    defaults: {
      code: null,
      name: null,
      branch: null,
      status: null,
      fromDate: null,
      toDate: null
    }
  });
  mod.Products = Backbone.Collection.extend({
    model: mod.Product
  });
  mod.Cover = Backbone.Model.extend({
    /*
     * code: string (cover code)
     * name: string (cover name)
     * commissions: collection (list of commission profiles added for that cover)
     * pricing: collection (will be added further to define pricing calculation)
     */
    defaults: function () {
      return {
        code: null,
        name: null,
        commissions: new mod.Commissions()
      };
    }
  });
  mod.Covers = Backbone.Collection.extend({
    model: mod.Cover
  });
  mod.Commission = Backbone.Model.extend({
    /*
     * code: string (commission profile code)
     * rate: double (commission profile rate)
     */
    defaults: {
      code: null,
      rate: null
    }
  });
  mod.Commissions = Backbone.Collection.extend({
    model: mod.Commission
  });
});
