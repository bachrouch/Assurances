main.module('mySpace.exemption', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        'exemption': function (criteria) {
          app.execute('exemption:search', criteria);
        },
        'exemption/:reference/consult': function (reference) {
          app.execute('exemption:consult', reference);
        }
      }
    });
  });
});
