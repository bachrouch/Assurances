main.module('assistance', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    mod.zones = {};
    app.reqres.setHandler('assistance:travel:countries', function (
      criterium) {
      return app.common.post('/svc/assistance/travel/country', {
          criterium: criterium
        })
        .done(function (data) {
          var keys = _.pluck(data, 'id');
          var values = _.pluck(data, 'zone');
          var obj = _.object(keys, values);
          _.extend(mod.zones, obj);
        });
    });
    app.reqres.setHandler('assistance:travel:create', function (data) {
      return app.common.post('/svc/assistance/travel/create', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        countries: data.travel.get('country')
      });
    });
    app.reqres.setHandler('assistance:travel:update', function (data) {
      return app.common.post('/svc/assistance/travel/update', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        countries: data.travel.get('country')
      });
    });
    app.reqres.setHandler('assistance:traveler:set', function (data) {
      return app.common.post('/svc/assistance/traveler/set', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        travelers: data.travelers.toRequest()
      });
    });
    app.reqres.setHandler('assistance:personToPrevent:set', function (
      data) {
      return app.common.post('/svc/assistance/personToPrevent/set', {
        quote: data.quote.toRequest(),
        personToPrevent: data.personToPrevent.toRequest()
      });
    });
    app.reqres.setHandler('assistance:doctor:set', function (data) {
      return app.common.post('/svc/assistance/doctor/set', {
        quote: data.quote.toRequest(),
        doctor: data.doctor.toRequest()
      });
    });
    app.reqres.setHandler('assistance:subscriber:set', function (data) {
      return app.common.post('/svc/assistance/subscriber/set', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:quote', function (data) {
      return app.common.post('/svc/assistance/print/quote', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:contract:create', function (data) {
      return app.common.post('/svc/assistance/contract/create', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:cp', function (data) {
      return app.common.post('/svc/assistance/print/cp', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:attestation', function (
      data) {
      return app.common.post('/svc/assistance/print/attestation', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:print:receipt', function (data) {
      return app.common.post('/svc/assistance/print/receipt', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('assistance:policy:get', function (data) {
      return app.common.post('/svc/assistance/policy/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('assistance:traveler:get', function (
      criterium) {
      return app.common.post('/svc/assistance/traveler/get', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('assistance:pricings:get', function (data) {
      return app.common.post('/svc/assistance/pricings/get', data);
    });
    app.reqres.setHandler('assistance:pricings:set', function (data) {
      return app.common.post('/svc/assistance/pricings/set', {
        quote: data.quote.toRequest(),
        travel: data.travel.toRequest(),
        pricing: data.pricing.toRequest()
      });
    });
  });
});
