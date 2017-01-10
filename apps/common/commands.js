main.module('common', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('error', function (error) {
      main.alert(error);
    });
    app.commands.setHandler('common:banklist', function (cb) {
      cb(main.common.enums.banks);
    });
    app.commands.setHandler('common:paymentStatus', function (cb) {
      cb(main.common.enums.paymentStatus);
    });
    app.commands.setHandler('common:paybackStatus', function (cb) {
      cb(main.common.enums.paybackStatus);
    });
    app.commands.setHandler('common:settlementMode', function (cb) {
      cb(main.common.enums.settlementMode);
    });
    app.commands.setHandler('common:posList', function (cb) {
      cb(main.common.enums.posList);
    });
    app.commands.setHandler('common:travelTypes', function (cb) {
      cb(main.common.enums.travelTypes);
    });
    app.commands.setHandler('common:termStatus', function (cb) {
      cb(main.common.enums.termStatus);
    });
    app.commands.setHandler('common:exemptionStatus', function (cb) {
      cb(main.common.enums.exemptionStatus);
    });
    app.commands.setHandler('common:exemptionType', function (cb) {
      cb(main.common.enums.exemptionType);
    });
    app.commands.setHandler('common:irregStatus', function (cb) {
      cb(main.common.enums.irregStatus);
    });
    app.commands.setHandler('common:irregNature', function (cb) {
      cb(main.common.enums.irregNature);
    });
    app.commands.setHandler('common:coverReference', function (cb) {
      cb(main.common.enums.coverReference);
    });
    app.commands.setHandler('common:countryList', function (cb) {
      cb(main.common.enums.countryList);
    });
  });
});
