main.module('connection', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    app.commands.setHandler('connection:check', function () {
      var defer = app.request('connection:check');
      defer.done(function (data) {
          var status = mod.controller.container.get('status');
          var pos = status.get('pos');
          if (data.status.pos) {
            pos = _.extend(pos, data.status.pos);
          }
          status.fromRequest(data.status);
        })
        .fail(app.fail);
    });
  });
});
