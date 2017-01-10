main.module('auto.valid', function (mod, app, Backbone) {
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.auto.Quote(),
        vehicles: new mod.Vehicles(),
        validationLocks: new mod.ValidationLocks(),
        discounts: new mod.Discounts()
      };
    },
    initialize: function () {
      this.get('policy')
        .clear();
      this.get('vehicles')
        .reset();
      this.get('validationLocks')
        .reset();
      this.get('discounts')
        .reset();
    }
  });
  mod.Vehicles = Backbone.Collection.extend({
    model: app.auto.Vehicle
  });
  mod.ValidationLock = Backbone.Model.extend({});
  mod.ValidationLocks = Backbone.Collection.extend({
    model: mod.ValidationLock
  });
  mod.Discount = Backbone.Model.extend({
    defaults: function () {
      return {
        usage: null,
        cover: null,
        discount: null
      };
    }
  });
  mod.Discounts = Backbone.Collection.extend({
    model: mod.Discount
  });
});
