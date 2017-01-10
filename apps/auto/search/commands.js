main.module('auto.search', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:search', function () {
      app.auto.current = 'search';
      mod.controller = new mod.Controller();
      app.request('auto:search:init')
        .done(function (data) {
          mod.controller.criteria.set('admin', data.admin);
          mod.controller.criteria.set('pos', parseInt(data.pos));
          app.mainRegion.show(mod.controller.layout);
        })
        .fail(app.fail);
    });
  });
});
