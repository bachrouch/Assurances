main.module('admin.terms', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('admin:terms', function () {
      app.admin.current = 'terms';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
    });
    app.commands.setHandler('admin:terms:get', function (id) {
      app.admin.current = 'terms';
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});
