main.module('connection', function (mod, app) {
  app.addInitializer(function () {
    mod.controller = new mod.Controller();
  });
  app.on('start', function () {
    app.vent.trigger('connection:changed');
    app.execute('connection:check');
  });
});

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

main.module('connection', function (mod, app) {
  mod.addInitializer(function () {
    // when user asks to login
    app.vent.on('connection:login', function () {
      mod.controller.trigger('connection:login');
    });
    // when user asks to logout
    app.vent.on('connection:logout', function () {
      mod.controller.trigger('connection:logout');
    });
    // when connection status changed (usually after a check)
    app.vent.on('connection:changed', function () {
      mod.controller.trigger('connection:changed');
    });
  });
});



main.module('connection', function (mod, app, Backbone) {
  mod.SessionRequest = Backbone.Model.extend({
    /*
     * username: string
     * password: string
     */
    defaults: {
      username: null,
      password: null
    },
  });
  mod.SessionStatus = Backbone.Model.extend({
    /*
     * connected: bool
     * fullName: string (user)
     * pos: string (point of sale)
     */
    defaults: {
      connected: false,
      pos: {}
    },
    getpos: function () {
      return this.get('pos')
        .get('code');
    },
    isConnected: function () {
      return this.get('connected');
    }
  });
  mod.Container = Backbone.Model.extend({
    initialize: function () {
      this.set('request', new mod.SessionRequest());
      this.set('status', new mod.SessionStatus());
    }
  });
  mod.PointOfSale = Backbone.Model.extend({});
});

main.module('connection', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('connection:login', function (request) {
      return app.common.post('/svc/connection/login', request.pick(
        'username', 'password'));
    });
    app.reqres.setHandler('connection:logout', function () {
      return app.common.post('/svc/connection/logout');
    });
    app.reqres.setHandler('connection:check', function () {
      return app.common.post('/svc/connection/check');
    });
  });
});

main.module('connection', function (mod, app, Backbone, Marionette, $, _) {
  mod.ConnectionOffView = app.common.CustForm.extend({
    template: _.template($('#connection-off')
      .html()),
    schema: {
      username: {
        type: 'CustText',
        title: 'Utilisateur',
        validators: ['required']
      },
      password: {
        type: 'CustText',
        dataType: 'password',
        title: 'Mot de passe',
        validators: ['required']
      }
    },
    events: {
      'click button': 'login'
    },
    login: function () {
      app.vent.trigger('connection:login');
      return false;
    }
  });
  mod.ConnectionOnView = Marionette.ItemView.extend({
    template: '#connection-on',
    templateHelpers: {
      printUser: function () {
        var posCode = this.pos.code;
        return this.fullName.slice(0, 8) + ' (' + posCode + ')';
      }
    },
    events: {
      'click button': 'logout'
    },
    logout: function () {
      app.vent.trigger('connection:logout');
      return false;
    }
  });
});
