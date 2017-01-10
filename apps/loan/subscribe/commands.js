main.module('loan.subscribe', function (mod, app) {
  mod.addInitializer(function () {
    app.commands.setHandler('loan:subscribe:new', function () {
      app.loan.current = 'subscribe';
      mod.controller = new mod.Controller();
      app.mainRegion.show(mod.controller.layout);
      mod.router.navigate('subscribe/step/1', {
        trigger: true,
        replace: false
      });
    });
    app.commands.setHandler('loan:subscribe:existing', function (id) {
      app.loan.current = 'subscribe';
      mod.controller = new mod.Controller();
      mod.controller.container.reset();
      mod.controller.launch(id);
    });
    app.commands.setHandler('loan:subscribe:step', function (rank) {
      if (app.loan.current === 'subscribe') {
        var current = mod.controller.getActiveStep();
        if (!current) {
          rank = 1;
          mod.controller.activateStep(mod.controller.getStep(rank),
            true);
        }
        else if (rank) {
          delete current.validationError;
          var step = mod.controller.getStep(rank);
          var curRank = current.get('rank');
          if (rank <= curRank) {
            mod.controller.activateStep(step);
          }
          else if (rank > curRank + 1) {
            current.validationError =
              'Vous ne pouvez pas sauter les étapes';
            mod.controller.freezeStep();
          }
          else {
            current.executeCheck(function () {
              if (current.validationError) {
                mod.controller.freezeStep();
              }
              else {
                current.executeAfter(function () {
                  if (current.validationError) {
                    mod.controller.freezeStep();
                  }
                  else {
                    mod.controller.activateStep(step);
                  }
                });
              }
            });
          }
        }
      }
      else {
        mod.router.navigate('error', {
          trigger: true,
          replace: false
        });
      }
    });
  });
});
