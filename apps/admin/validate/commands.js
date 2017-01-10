main.module('admin.validate', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    app.commands.setHandler('admin:payment', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.paymentSearchView);
    });
    app.commands.setHandler('admin:validate', function (reference) {
      app.request('admin:paymentSearch', {
          reference: parseInt(reference, 10)
        }, null)
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.paymentValidateView);
          }
        });
    });
    app.commands.setHandler('admin:manage', function (reference) {
      app.request('admin:paymentSearch', {
          reference: parseInt(reference, 10)
        }, null)
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.paymentControleView);
          }
        });
    });
    app.commands.setHandler('admin:receiptSearch', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.mainLayout);
    });
  });
});
