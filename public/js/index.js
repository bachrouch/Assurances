main.module('index', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    new Backbone.Router({
      routes: {
        '': function () {
          app.execute('index:ui:index');
        },
        forbidden: function () {
          app.execute('index:ui:forbidden');
        },
        wip: function () {
          app.execute('index:ui:wip');
        },
        unauthorized: function () {
          app.execute('index:ui:unauthorized');
        },
        locked: function () {
          app.execute('index:ui:locked');
        }
      }
    });
  });
});

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











main.module('index', function (mod, app, Backbone, Marionette) {
  mod.IndexView = Marionette.ItemView.extend({
    template: '#index-index'
  });
  mod.ForbiddenView = Marionette.ItemView.extend({
    template: '#index-forbidden'
  });
  mod.WIPView = Marionette.ItemView.extend({
    template: '#index-wip'
  });
  mod.UnauthorizedView = Marionette.ItemView.extend({
    template: '#index-unauthorized'
  });
  mod.LockedView = Marionette.ItemView.extend({
    template: '#index-locked'
  });
});
