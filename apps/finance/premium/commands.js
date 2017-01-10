main.module('finance.premium', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('premium:consult', function (contract,
      raisedDate) {
      mod.controller = new mod.Controller();
      mod.controller.launch(contract, raisedDate);
    });
    app.commands.setHandler('premium:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
  });
});
