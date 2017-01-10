main.module('assistance.search', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('assistance:search', function () {
      if (app.assistance.current !== 'search') {
        app.assistance.current = 'search';
        mod.controller = new mod.Controller();
        app.mainRegion.show(mod.controller.layout);
      }
    });
  });
});
