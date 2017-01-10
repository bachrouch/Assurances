main.module('loan', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:ui:index', function () {
      app.loan.current = 'index';
      app.mainRegion.show(new mod.IndexView());
    });
    app.commands.setHandler('loan:ui:error', function () {
      app.loan.current = 'error';
      app.mainRegion.show(new mod.ErrorView());
    });
    app.commands.setHandler('loan:subscriber:types', function (cb) {
      cb([{
        id: 'Personne physique',
        text: 'Personne physique'
      }, {
        id: 'Personne morale',
        text: 'Personne morale'
      }]);
    });
    app.commands.setHandler('loan:person:genders', function (cb) {
      cb([{
        id: 1,
        text: 'Monsieur'
      }, {
        id: 2,
        text: 'Madame'
      }]);
    });
    app.commands.setHandler('loan:fraction:refund', function (cb) {
      cb([{
        id: 'Annuel',
        text: 'Annuel'
      }, {
        id: 'Mensuel',
        text: 'Mensuel'
      }]);
    });
    app.commands.setHandler('loan:fraction:premium', function (cb) {
      cb([{
        id: 'Unique',
        text: 'Unique'
      }, {
        id: 'Unique',
        text: 'Unique'
      }]);
    });
    app.commands.setHandler('loan:insured:types', function (cb) {
      cb([{
        id: 'Assuré',
        text: 'Assuré'
      }, {
        id: 'Autre',
        text: 'Autre'
      }]);
    });
    app.commands.setHandler('loan:insured:smoking', function (cb) {
      cb([{
        id: 'Non',
        text: 'Non'
      }, {
        id: 'Fumeur occasionnel',
        text: 'Fumeur occasionnel'
      }, {
        id: 'Fumeur modéré',
        text: 'Fumeur modéré'
      }, {
        id: 'Grand fumeur',
        text: 'Grand fumeur'
      }]);
    });
    app.commands.setHandler('loan:contribution:adjust', function (cb) {
      cb([{
        id: 0,
        text: 'Aucun ajustement'
      }, {
        id: 5,
        text: 'Ajustement minimal (5%)'
      }, {
        id: 10,
        text: 'Ajustement moyen (10%)'
      }, {
        id: 15,
        text: 'Ajustement moyen (15%)'
      }, {
        id: 20,
        text: 'Ajustement maximal (20%)'
      }]);
    });
    app.commands.setHandler('loan:teta:adjust', function (cb) {
      cb([{
        id: 0,
        text: 'Pas de frais d\'acquisition (0%)'
      }, {
        id: 5,
        text: 'Frais d\'acquisition minimaux (5%)'
      }, {
        id: 10,
        text: 'Frais d\'acquisition moyens (10%)'
      }, {
        id: 15,
        text: 'Frais d\'acquisition moyens (15%)'
      }, {
        id: 20,
        text: 'Frais d\'acquisition maximaux (20%)'
      }]);
    });
  });
});
