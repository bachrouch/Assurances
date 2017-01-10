main.module('loan.search', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.policies = new mod.Policies();
      this.layout = new mod.Layout();
    }
  });
});
