main.module('loan.search', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:search', function () {
      if (app.loan.current !== 'search') {
        app.loan.current = 'search';
        mod.controller = new mod.Controller();
        app.mainRegion.show(mod.controller.layout);
      }
    });
  });
});
