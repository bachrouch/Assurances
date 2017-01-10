/*jslint browser: true */
main.module('configs.product', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('configs:product', function () {
      app.request('configs:product:checkAccess')
        .done(function () {
          app.configs.current = 'ProductConfig';
          mod.controller = new mod.ControllerProduct();
          app.mainRegion.show(mod.controller.layout);
          mod.router.navigate('product', {
            trigger: true,
            replace: false
          });
        })
        .fail(function () {
          window.location.href = '/#unauthorized';
        });
    });
  });
});
