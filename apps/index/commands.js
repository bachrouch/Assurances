main.module('index', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('index:ui:index', function () {
      app.mainRegion.show(new mod.IndexView());
    });
    app.commands.setHandler('index:ui:forbidden', function () {
      app.mainRegion.show(new mod.ForbiddenView());
    });
    app.commands.setHandler('index:ui:wip', function () {
      app.mainRegion.show(new mod.WIPView());
    });
    app.commands.setHandler('index:ui:unauthorized', function () {
      app.mainRegion.show(new mod.UnauthorizedView());
    });
    app.commands.setHandler('index:ui:locked', function () {
      app.mainRegion.show(new mod.LockedView());
    });
  });
});
