main.module('assistance.consult', function (mod, app, Backbone) {
  mod.Container = Backbone.Model.extend({
    defaults: function () {
      return {
        policy: new app.assistance.Quote(),
        travel: new app.assistance.Travel(),
        coverages: new app.assistance.Coverages(),
        person: new app.actors.Person(),
        company: new app.actors.Company()
      };
    }
  });
});
