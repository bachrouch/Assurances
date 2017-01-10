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
