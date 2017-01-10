main.module('auto.frontierInsurance', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:frontierInsurance', function () {
      app.auto.current = 'frontierInsurance';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
    });
  });
});
