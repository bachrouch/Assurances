main.module('auto.valid', function (mod, app, Backbone, Marionette, $, _) {
  mod.Controller = Marionette.Controller.extend({
    launch: function (id) {
      var self = this;
      app.request('auto:fleet:get', {
          id: id
        })
        .done(function (data) {
          self.container = new mod.Container();
          var policy = self.container.get('policy');
          var vehicles = self.container.get('vehicles');
          vehicles.reset();
          _.each(data.vehicles, function (item) {
            var veh = new app.auto.Vehicle();
            veh.fromRequest(item);
            var cov = veh.get('coverages');
            cov.fromRequest(item.coverages);
            vehicles.add(veh);
          });
          policy.fromRequest(data.policy);
          policy.set('receiptDoc', new app.common.Doc({
            title: 'Quittance'
          }));
          var validLock = self.container.get('validationLocks');
          validLock.fromRequest(data.validationLocks);
          var discounts = self.container.get('discounts');
          discounts.fromRequest(data.discounts);
          self.layout = new mod.PolicyValidateView();
          app.mainRegion.show(self.layout);
        })
        .fail(app.fail);
    }
  });
});
