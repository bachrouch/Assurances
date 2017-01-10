main.module('admin.payback', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    app.commands.setHandler('payback:index', function () {
      app.request('payback:create')
        .done(function (data) {
          mod.router.navigate('payback/' + data.payback.reference +
            '/edit', {
              trigger: true,
              replace: false
            });
        });
    });
    app.commands.setHandler('payback:edit', function (reference) {
      app.request('payback:search', {
          reference: parseInt(reference, 10),
          status: '0'
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert(
              'Feuille de remboursement inexistente ou non modifiable!'
            );
            mod.router.navigate('payback/search', {
              replace: false,
              trigger: true
            });
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaybackData(data);
            app.mainRegion.show(mod.controller.mainLayout);
          }
        });
    });
    app.commands.setHandler('payback:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
    app.commands.setHandler('payback:consult', function (reference) {
      app.request('payback:search', {
          reference: parseInt(reference, 10),
          status: ''
        })
        .done(function (data) {
          if (_.isEmpty(data)) {
            app.alert('Feuille de remboursement inexistente');
          }
          else {
            mod.controller = new mod.Controller();
            mod.controller.getPaybackData(data);
            mod.controller.setDocData(mod.controller.payback);
            app.mainRegion.show(mod.controller.paybacktConsultView);
          }
        });
    });
    app.commands.setHandler('payback:payments', function (cb) {
      var payments = mod.controller.payback.get('payments');
      var table = [];
      payments.each(function (payment) {
        if (payment !== null) {
          var item = {
            id: payment.get('reference')
              .toString(),
            text: payment.get('reference')
              .toString()
          };
          table.push(item);
        }
      });
      cb(table);
    });
  });
});
