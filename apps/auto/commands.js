main.module('auto', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('auto:ui:index', function () {
      app.auto.current = 'index';
      app.mainRegion.show(new mod.IndexView());
    });
    app.commands.setHandler('auto:ui:error', function () {
      app.auto.current = 'error';
      app.mainRegion.show(new mod.ErrorView());
    });
    app.commands.setHandler('auto:vehicle:energies', function (cb) {
      cb([{
        id: 'Essence',
        text: 'Essence'
      }, {
        id: 'Diesel',
        text: 'Diesel'
      }, {
        id: 'GPL',
        text: 'GPL'
      }, {
        id: 'Hybride',
        text: 'Hybride'
      }, {
        id: 'Electrique',
        text: 'Electrique'
      }]);
    });
    app.commands.setHandler('auto:contract:kinds', function (cb) {
      cb([{
        id: 'Renouvelable',
        text: 'Renouvelable'
      }, {
        id: 'Ferme',
        text: 'Ferme'
      }]);
    });
    app.commands.setHandler('auto:contract:frequencies', function (cb) {
      cb([{
        id: 'Annuel',
        text: 'Annuel'
      }, {
        id: 'Semestriel',
        text: 'Semestriel'
      }]);
    });
    app.commands.setHandler('auto:subscriber:types', function (cb) {
      cb([{
        id: 'Personne physique',
        text: 'Personne physique'
      }, {
        id: 'Personne morale',
        text: 'Personne morale'
      }]);
    });
    app.commands.setHandler('auto:insured:types', function (cb) {
      cb([{
        id: 'Souscripteur',
        text: 'Souscripteur'
      }, {
        id: 'Autre',
        text: 'Autre'
      }]);
    });
  });
});
