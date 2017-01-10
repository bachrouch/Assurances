main.module('loan.valid', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:valid', function (id) {
      if (app.loan.current !== 'valid') {
        app.loan.current = 'valid';
        mod.controller = new mod.Controller();
        mod.controller.launch(id);
      }
    });
  });
});
