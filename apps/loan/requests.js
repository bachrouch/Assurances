main.module('loan', function (mod, app) {
  mod.addInitializer(function () {
    app.reqres.setHandler('loan:credit:beneficiaries', function (
      criterium) {
      return app.common.post('/svc/loan/credit/beneficiaries', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:coverage:list', function (data) {
      return app.common.post('/svc/loan/coverage/list', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:amortization:list', function (data) {
      return app.common.post('/svc/loan/amortization/list', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:subscriber:set', function (data) {
      return app.common.post('/svc/loan/subscriber/set', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest()
      });
    });
    app.reqres.setHandler('loan:credit:create', function (data) {
      return app.common.post('/svc/loan/credit/create', {
        quote: data.quote.toRequest(),
        credit: data.credit.toRequest(),
        insured: data.insured.toRequest(),
        beneficiary: data.beneficiary.toRequest()
      });
    });
    app.reqres.setHandler('loan:credit:update', function (data) {
      return app.common.post('/svc/loan/credit/update', {
        quote: data.quote.toRequest(),
        credit: data.credit.toRequest(),
        insured: data.insured.toRequest(),
        beneficiary: data.beneficiary.toRequest()
      });
    });
    app.reqres.setHandler('loan:print:quote', function (data) {
      return app.common.post('/svc/loan/print/quote', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:print:cp', function (data) {
      return app.common.post('/svc/loan/print/cp', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:policy:get', function (data) {
      return app.common.post('/svc/loan/policy/get', {
        id: data.id
      });
    });
    app.reqres.setHandler('loan:print:receipt', function (data) {
      return app.common.post('/svc/loan/print/receipt', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:contract:save', function (data) {
      return app.common.post('/svc/loan/contract/save', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:medicalselection:set', function (data) {
      return app.common.post('/svc/loan/medicalselection/set', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest(),
        medquestions: data.medquestions.toRequest()
      });
    });
    app.reqres.setHandler('loan:medicalselection:check', function (data) {
      return app.common.post('/svc/loan/medicalselection/check', {
        quote: data.quote.toRequest(),
        insured: data.insured.toRequest()
      });
    });
    app.reqres.setHandler('loan:provider:doctor', function (criterium) {
      return app.common.post('/svc/loan/provider/doctor', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:provider:lab', function (criterium) {
      return app.common.post('/svc/loan/provider/lab', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:provider:cardio', function (criterium) {
      return app.common.post('/svc/loan/provider/cardio', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:provider:imagery', function (criterium) {
      return app.common.post('/svc/loan/provider/imagery', {
        criterium: criterium
      });
    });
    app.reqres.setHandler('loan:print:medicalreport', function (data) {
      return app.common.post('/svc/loan/print/medicalreport', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:financialreport', function (data) {
      return app.common.post('/svc/loan/print/financialreport', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:detailedquest', function (data) {
      return app.common.post('/svc/loan/print/detailedquest', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:urinetest', function (data) {
      return app.common.post('/svc/loan/print/urinetest', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:bloodprofile', function (data) {
      return app.common.post('/svc/loan/print/bloodprofile', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:psa', function (data) {
      return app.common.post('/svc/loan/print/psa', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:ecg', function (data) {
      return app.common.post('/svc/loan/print/ecg', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:stressecg', function (data) {
      return app.common.post('/svc/loan/print/stressecg', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:print:chestfilm', function (data) {
      return app.common.post('/svc/loan/print/chestfilm', {
        quoteref: data.quoteref,
        providerid: data.providerid,
        doctestid: data.doctestid
      });
    });
    app.reqres.setHandler('loan:project:save', function (data) {
      return app.common.post('/svc/loan/project/save', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:contribution:calculate', function (data) {
      return app.common.post('/svc/loan/contribution/calculate', {
        quote: data.quote.toRequest()
      });
    });
    app.reqres.setHandler('loan:admin:edit', function (data) {
      return app.common.post('/svc/loan/admin/edit', {
        policy: data.policy.toRequest(),
        editedmodel: data.editedmodel,
        newdata: data.newdata.toRequest(),
        extradata: data.extradata
      });
    });
    app.reqres.setHandler('loan:contract:validate', function (data) {
      return app.common.post('/svc/loan/contract/validate', {
        policy: data.policy.toRequest()
      });
    });
    app.reqres.setHandler('loan:admin:lockvalidation', function (data) {
      return app.common.post('/svc/loan/admin/lockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('loan:admin:unlockvalidation', function (data) {
      return app.common.post('/svc/loan/admin/unlockvalidation', {
        policy: data.policy.toRequest(),
        valid: data.valid.toRequest()
      });
    });
    app.reqres.setHandler('loan:subscriber:check', function (data) {
      return app.common.post('/svc/loan/subscriber/check', {
        quote: data.quote.toRequest(),
        subscriber: data.subscriber.toRequest()
      });
    });
  });
});
