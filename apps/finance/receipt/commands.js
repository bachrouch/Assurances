main.module('finance.receipt', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('finance:receipt', function (id) {
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
    app.commands.setHandler('receipt:search', function () {
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.searchLayout);
    });
  });
});
