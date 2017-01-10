main.module('actors', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('actors:states', function (criterium) {
      return app.common.post('/svc/actors/states', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('actors:fields', function (criterium) {
      return app.common.post('/svc/actors/fields', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('actors:professions', function (criterium) {
      return app.common.post('/svc/actors/professions', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('actors:getclient', function (data) {
      return app.common.post('/svc/actors/getclient', {
        custtype: data.custtype,
        custid: data.custid
      });
    });
    app.reqres.setHandler('actors:socialprofession', function (
      criterium) {
      return app.common.post('/svc/actors/socialprofession', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('actors:getPostalCodeAddress', function (
      postalCode) {
      return app.common.post(
        '/svc/actors/person/getPostalCodeAddress', {
          postalCode: postalCode
        });
    });
    app.reqres.setHandler('actors:getLocality', function (postalCode,
      criterium) {
      return app.common.post('/svc/actors/postalLocality', {
        postalCode: postalCode,
        criterium: criterium
      });
    });
    app.reqres.setHandler('actors:loadPostalList', function () {
      return app.common.post('/svc/actors/person/loadPostalList');
    });
    app.reqres.setHandler('actors:getLngLatBase', function (data) {
      return app.common.post('/svc/actors/getLngLatBase', {
        postalCode: data.postalCode,
        delegation: data.delegation
      });
    });
    app.reqres.setHandler('actors:saveLngLat', function (data) {
      return app.common.post('/svc/actors/saveLngLat', {
        postalCode: data.postalCode,
        delegation: data.delegation,
        longitude: data.longitude,
        latitude: data.latitude
      });
    });
  });
});
