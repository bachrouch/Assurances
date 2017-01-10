main.module('mySpace.exemption', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('exemption:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.mainLayout);
    });
    app.commands.setHandler('exemption:consult', function (reference) {
      app.request('mySpace:exemptionConsult', {
          reference: parseInt(reference, 10)
        })
        .done(function (data) {
          mod.controller = new mod.Controller();
          mod.controller.getExemptionData(data);
          var type = data[0].type;
          var ref = data[0].request.reference;
          switch (type) {
          case 0:
            app.mainRegion.show(mod.controller.exemptionConsultView);
            break;
          case 1:
            mod.controller.getPayData(ref, function () {
              app.mainRegion.show(mod.controller.paymentExemptionConsultView);
            });
            break;
          }
        })
        .fail(app.fail);
    });
  });
});
