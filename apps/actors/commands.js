main.module('actors', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('actors:company:types', function (cb) {
      cb([{
        id: 1,
        text: 'SARL'
      }, {
        id: 2,
        text: 'SA'
      }]);
    });
    app.commands.setHandler('actors:person:genders', function (cb) {
      cb([{
        id: 1,
        text: 'Monsieur'
      }, {
        id: 2,
        text: 'Madame'
      }]);
    });
    app.commands.setHandler('actors:beneficiary:clauses', function (cb) {
      cb([{
        id: 1,
        text: 'Ne pas ajouter P/C sur quittance et attestation'
      }, {
        id: 2,
        text: 'Ajouter P/C sur quittance et attestation'
      }]);
    });
    app.commands.setHandler('actors:postalListDisplay', function (cb) {
      var table = [];
      app.request('actors:loadPostalList')
        .done(function (postalList) {
          if (postalList !== null) {
            postalList.forEach(function (data) {
              var item = {
                id: data.id,
                text: data.text
              };
              table.push(item);
            });
          }
        });
      cb(table);
    });
  });
});
