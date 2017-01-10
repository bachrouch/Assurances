main.module('auto.term', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:term', function () {
      app.auto.current = 'term';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
    });
    app.commands.setHandler('auto:term:consult', function (id) {
      app.auto.current = 'term';
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});
