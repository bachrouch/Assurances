main.module('configs.product', function (mod, app, Backbone) {
  mod.addInitializer(function () {
    mod.router = new Backbone.Router({
      routes: {
        product: function () {
          app.execute('configs:product');
        }
      }
    });
  });
});
