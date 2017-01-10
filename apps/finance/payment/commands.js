main.module('finance.payment', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    app.commands.setHandler('payment:index', function () {
      app.request('payment:current')
        .done(function (data) {
          if (data.payment) {
            mod.router.navigate('payment/' + data.payment.reference +
              '/edit', {
                trigger: true,
                replace: false
              });
          }
          else {
            app.request('payment:create')
              .done(function (data) {
                mod.router.navigate('payment/' + data.payment.reference +
                  '/edit', {
                    trigger: true,
                    replace: false
                  });
              });
          }
        });
    });
    app.commands.setHandler('payment:edit', function (reference) {
      app.request('payment:search', {
          reference: parseInt(reference, 10),
          status: '0'
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.layout);
          }
        });
    });
    app.commands.setHandler('payment:paymentRequest', function (
      reference) {
      app.request('payment:search', {
          reference: parseInt(reference, 10),
          status: '0'
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            app.mainRegion.show(mod.controller.paymentRequestView);
          }
        });
    });
    app.commands.setHandler('payment:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
    app.commands.setHandler('payment:consult', function (reference) {
      app.request('payment:search', {
          reference: parseInt(reference, 10),
          status: ''
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('no payments found');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaymentData(data);
            mod.controller.setDocData(mod.controller.payment);
            app.mainRegion.show(mod.controller.paymentConsultView);
          }
        });
    });
    app.commands.setHandler('payment:receipts', function (cb) {
      var receipts = mod.controller.payment.get('receipts');
      var table = [];
      receipts.each(function (receipt) {
        if (receipt !== null) {
          var item = {
            id: receipt.get('reference')
              .toString(),
            text: receipt.get('reference')
              .toString()
          };
          table.push(item);
        }
      });
      cb(table);
    });
  });
});
