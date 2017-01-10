main.module('auto.valid', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:valid', function (id) {
      if (app.auto.current !== 'valid') {
        app.auto.current = 'valid';
        mod.controller = new mod.Controller();
        mod.controller.launch(id);
      }
    });
  });
});
