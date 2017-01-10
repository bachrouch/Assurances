main.module('auto.frontierInsurance', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'frontierInsurance': function () {
          app.execute('auto:frontierInsurance');
        }
      }
    });
  });
});
