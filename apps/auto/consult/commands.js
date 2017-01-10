main.module('auto.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:consult', function (id) {
      app.auto.current = 'consult';
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});
