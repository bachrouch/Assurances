main.module('auto', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('auto:vehicle:usages', function (criterium) {
      return app.common.post('/svc/auto/vehicle/usages', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:bonuses', function (usage,
      criterium) {
      return app.common.post('/svc/auto/vehicle/bonuses', {
        usage: usage,
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:makes', function (criterium) {
      return app.common.post('/svc/auto/vehicle/makes', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:models', function (make,
      criterium) {
      return app.common.post('/svc/auto/vehicle/models', {
        make: make,
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:vehicle:create', function (data) {
      return app.common.post('/svc/auto/vehicle/create', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest(),
        vehicle: data.vehicle.toRequest()
      });
    });
    app.reqres.setHandler('auto:vehicle:update', function (data) {
      return app.common.post('/svc/auto/vehicle/update', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest(),
        vehicle: data.vehicle.toRequest()
      });
    });
    app.reqres.setHandler('auto:coverage:list', function (data) {
      return app.common.post('/svc/auto/coverage/list', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:coverage:update', function (data) {
      return app.common.post('/svc/auto/coverage/update', {
        quote: data.quote.toRequest(),
        coverage: data.coverage.toRequest()
      });
    });
    app.reqres.setHandler('auto:subscriber:set', function (data) {
      return app.common.post('/svc/auto/subscriber/set', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest(),
        insured: data.insured.toRequest()
      });
    });
    app.reqres.setHandler('auto:beneficiary:set', function (data) {
      return app.common.post('/svc/auto/beneficiary/set', {
        quote: data.quote.toRequest(),
        beneficiary: data.beneficiary.toRequest()
      });
    });
    app.reqres.setHandler('auto:print:quote', function (data) {
      return app.common.post('/svc/auto/print/quote', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:contract:create', function (data) {
      return app.common.post('/svc/auto/contract/create', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:policy:get', function (data) {
      return app.common.post('/svc/auto/policy/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('auto:beneficiary:get', function (criterium) {
      return app.common.post('/svc/auto/beneficiary/get', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:attestation:list', function (policy,
      criterium) {
      return app.common.post('/svc/auto/attestation/list', {
        policy: policy,
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:coverage:check', function (data) {
      return app.common.post('/svc/auto/coverage/check', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:term:get', function (data) {
      return app.common.post('/svc/auto/term/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('auto:fleet:save', function (data) {
      return app.common.post('/svc/auto/fleet/save', {
        vehicle: data.vehicle.toRequest(),
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:add', function (data) {
      return app.common.post('/svc/auto/fleet/add', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:remove', function (data) {
      return app.common.post('/svc/auto/fleet/remove', {
        vehicle: data.vehicle.toRequest(),
        vehicles: data.vehicles.toRequest(),
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:summary', function (data) {
      return app.common.post('/svc/auto/fleet/summary', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:recalculate', function (data) {
      return app.common.post('/svc/auto/fleet/recalculate', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:create', function (data) {
      return app.common.post('/svc/auto/fleet/create', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:get', function (data) {
      return app.common.post('/svc/auto/fleet/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('auto:fleet:validate', function (data) {
      return app.common.post('/svc/auto/fleet/validate', {
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:printAttestation', function (data) {
      return app.common.post('/svc/auto/fleet/printAttestation', {
        vehicle: data.vehicle.toRequest(),
        attestation: data.attestation,
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:printvehicle', function (data) {
      return app.common.post('/svc/auto/fleet/printVehicle', {
        vehicle: data.vehicle.toRequest(),
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:getVehicle', function (data) {
      return app.common.post('/svc/auto/fleet/getVehicle', {
        quote: data.quote.toRequest(),
        vehicle: data.vehicle.toRequest(),
        forEdit: data.forEdit
      });
    });
    app.reqres.setHandler('auto:fleet:exportFleet', function (data) {
      return app.common.post('/svc/auto/fleet/exportFleet', {
        quote: data.quote.toRequest(),
        vehicles: data.vehicles.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:lockvalidation', function (data) {
      return app.common.post('/svc/auto/fleet/admin/lockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:unlockvalidation', function (data) {
      return app.common.post(
        '/svc/auto/fleet/admin/unlockvalidation', {
          policy: data.policy.toRequest(),
          valid: data.valid.toRequest()
        });
    });
    app.reqres.setHandler('auto:admin:lockvalidation', function (data) {
      return app.common.post('/svc/auto/fleet/admin/lockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:applyBonus', function (data) {
      return app.common.post('/svc/auto/fleet/admin/applyBonus', {
        policy: data.policy.toRequest(),
        bonus: data.bonus.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:revertBonus', function (data) {
      return app.common.post('/svc/auto/fleet/admin/revertBonus', {
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('auto:admin:saveBonus', function (data) {
      return app.common.post('/svc/auto/fleet/admin/saveBonus', {
        policy: data.policy.toRequest(),
        vehicle: data.vehicle.toRequest()
      });
    });
    app.reqres.setHandler('auto:fleet:usages', function (reference) {
      return app.common.post('/svc/auto/fleet/usages', {
        id: reference
      });
    });
    app.reqres.setHandler('auto:fleet:covers', function (reference) {
      return app.common.post('/svc/auto/fleet/covers', {
        id: reference
      });
    });
    app.reqres.setHandler('auto:admin:cancelDiscount', function (data) {
      return app.common.post('/svc/auto/admin/cancelDiscount', {
        discount: data.discount
      });
    });
    app.reqres.setHandler('auto:admin:saveDiscount', function (data) {
      return app.common.post('/svc/auto/admin/saveDiscount', {
        discount: data.discount
      });
    });
    app.reqres.setHandler('auto:subscribe:checkLockSubscription',
      function () {
        return app.common.post(
          '/svc/auto/subscribe/checkLockSubscription');
      });
    app.reqres.setHandler('auto:frontierInsurance:listUsages', function (
      criterium) {
      return app.common.post('/svc/auto/getListUsages', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:frontierInsurance:durationsList',
      function (criterium) {
        return app.common.post('/svc/auto/getDurationsList', {
          criterium: criterium
        });
      });
    app.reqres.setHandler('auto:frontierInsurance:idTypes', function (
      criterium) {
      return app.common.post('/svc/auto/getIdTypes', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('auto:frontierInsurance:getPremium', function (
      data) {
      return app.common.post('/svc/auto/getPremium', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler(
      'auto:frontierInsurance:validateFrontierInsuranceContract',
      function (container, attestationNumber) {
        return app.common.post(
          '/svc/auto/validateFrontierInsuranceContract', {
            container: container,
            attestationNumber: attestationNumber
          });
      });
    app.reqres.setHandler('auto:frontierInsurance:getListOfCountries',
      function (criterium) {
        return app.common.post('/svc/auto/getListOfCountries', {
          criterium: criterium
        });
      });
  });
});
