/*jslint browser:true */
main.module('connection', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    initEvents: function () {
      this.on('connection:login', function () {
        var request = this.container.get('request');
        request.trigger('commit');
        if (!request.validationError) {
          app.request('connection:login', request)
            .done(function () {
              app.execute('connection:check');
              app.common.initEnums(function () {});
              window.location = '/';
            })
            .fail(app.fail);
        }
      });
      this.on('connection:logout', function () {
        app.request('connection:logout')
          .done(function () {
            app.execute('connection:check');
            app.common.destroyEnums(function () {});
            window.location = '/';
          })
          .fail(app.fail);
      });
      this.on('connection:changed', function () {
        var connected = this.container.get('status')
          .isConnected();
        if (connected) {
          var request = this.container.get('request');
          request.set(_.result(request, 'defaults'));
          app.connectionRegion.show(new mod.ConnectionOnView({
            model: this.container.get('status')
          }));
        }
        else {
          app.connectionRegion.show(new mod.ConnectionOffView({
            model: this.container.get('request')
          }));
        }
      });
    },
    initialize: function () {
      this.container = new mod.Container();
      this.initEvents();
      var status = this.container.get('status');
      status.on('change', function () {
        app.vent.trigger('connection:changed');
      });
    }
  });
});
