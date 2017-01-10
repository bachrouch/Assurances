main.module('assistance', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('assistance:ui:index', function () {
      app.assistance.current = 'index';
      app.mainRegion.show(new mod.IndexView());
    });
    app.commands.setHandler('assistance:ui:error', function () {
      app.assistance.current = 'error';
      app.mainRegion.show(new mod.ErrorView());
    });
    app.commands.setHandler('assistance:contract:kinds', function (cb) {
      cb([{
        id: 'Annuelle',
        text: 'Annuelle'
      }, {
        id: 'Temporaire',
        text: 'Temporaire'
      }]);
    });
    app.commands.setHandler('assistance:subscriber:types', function (cb) {
      cb([{
        id: 'Personne physique',
        text: 'Personne physique'
      }, {
        id: 'Personne morale',
        text: 'Personne morale'
      }]);
    });
  });
});
