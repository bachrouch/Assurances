/* global Marionette: false */
/* global Backbone: false */
/* global _: false */
/* global window: false */
(function () {
  var main = new Marionette.Application();
  main.addRegions({
    connectionRegion: '#connection-region',
    mainRegion: '#main-region'
  });
  main.alert = function (msg) {
    window.alert(msg);
  };
  main.on('initialize:after', function () {
    if (Backbone.history) {
      main.common.initEnums(function () {
        main.common.initRules(function () {
          Backbone.history.start();
        });
      });
    }
    else {
      main.alert('No history');
    }
  });
  Backbone.$(_.bind(main.start, main));
  this.main = main;
})
.call(this);
