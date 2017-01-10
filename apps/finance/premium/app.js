main.module('finance.premium', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'premium/:contract/:raisedDate/consult': function (contract,
          raisedDate) {
          app.execute('premium:consult', contract, raisedDate);
        },
        'premium/search': function (criteria) {
          app.execute('premium:search', criteria);
        }
      }
    });
  });
});
