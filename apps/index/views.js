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
