main.module('auto.frontierInsurance', function (mod, app, Backbone, Marionette) {
  mod.Controller = Marionette.Controller.extend({
    initialize: function () {
      this.layout = new mod.Layout();
      this.container = new mod.Container();
    }
  });
});
