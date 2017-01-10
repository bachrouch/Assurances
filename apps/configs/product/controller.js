main.module('configs.product', function (mod, app, Backbone, Marionette) {
  mod.ControllerProduct = Marionette.Controller.extend({
    initialize: function () {
      this.criteria = new mod.Criteria();
      this.products = new mod.Products();
      this.covers = new mod.Covers();
      this.layout = new mod.LayoutProduct();
    }
  });
});
