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
