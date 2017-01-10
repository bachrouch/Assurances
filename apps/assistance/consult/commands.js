main.module('assistance.consult', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('assistance:consult', function (id) {
      mod.controller = new mod.Controller();
      mod.controller.launch(id);
    });
  });
});
