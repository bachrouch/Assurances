var session = require('../logic/session');
var ora = require('./loan-ora');

function listCreditBeneficiaries(req, res) {
  // {{{
  res.send([{
    id: 'Al Baraka Bank',
    text: 'Al Baraka Bank'
  }, {
    id: 'Banque d\'Habitat',
    text: 'Banque d\'Habitat'
  }, {
    id: 'Banque Zitouna',
    text: 'Banque Zitouna'
  }, {
    id: 'Stusid Bank',
    text: 'Stusid Bank'
  }]);
  // }}}
}

function listCoverages(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.fees = 2;
  quote.premium = 100;
  quote.totalPremium = 102;
  quote.valid = true;
  quote.adjustContribution = 0;
  quote.adjustCommission = 10;
  res.send({
    quote: quote,
    coverages: [{
      name: 'Décés ou Invalidité Absolute et Definitive',
      premium: 1000,
      premiumModifiable: true
    }]
  });
  // }}}
}

function listAmortizations(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote,
    amortizations: [{
      date: '2013-12-18',
      dateModifiable: false,
      amount: 1000,
      amountModifiable: false
    }, {
      date: '2013-12-18',
      dateModifiable: false,
      amount: 1000,
      amountModifiable: false
    }, {
      date: '2013-12-18',
      dateModifiable: false,
      amount: 1000,
      amountModifiable: false
    }]
  });
  // }}}
}

function setSubscriber(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function createCredit(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.reference = 'Quote';
  res.send({
    quote: quote
  });
  // }}}
}

function updateCredit(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.valid = true;
  res.send({
    quote: quote
  });
  // }}}
}

function saveProject(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.contractref = '15501999999';
  quote.validateLink = {};
  quote.validateLink.title = 'Validez votre contrat N° 15501999999';
  quote.validateLink.processlink = 'loan#contract/15501999999/valid';
  quote.validateLink.stats = true;
  res.send({
    quote: quote
  });
  // }}}
}

function setMedicalSelection(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.valid = true;
  res.send({
    quote: quote
  });
  // }}}
}

function checkMedicalSelection(req, res) {
  // {{{
  var quote = req.body.quote;
  quote.valid = true;
  res.send({
    quote: quote
  });
  // }}}
}

function printMedicalReport(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printFiancialReport(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printDetailedQuest(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printUrineTest(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printBloodProfile(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printPSA(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printECG(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printStressECG(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function printChestFilm(req, res) {
  // {{{
  var quote = req.body.quote;
  res.send({
    quote: quote
  });
  // }}}
}

function getDoctorProvider(req, res) {
  // {{{
  res.send({});
  // }}}
}

function getLabProvider(req, res) {
  // {{{
  res.send({});
  // }}}
}

function getCardioProvider(req, res) {
  // {{{
  res.send({});
  // }}}
}

function getImageryProvider(req, res) {
  // {{{
  res.send({});
  // }}}
}

function searchLoan(req, res) {
  // {{{
  res.send({});
  // }}}
}

function getLoanPol(req, res) {
  // {{{
  var id = req.body.id;
  var policy = {
    reference: id,
    premium: 100,
    fees: 2,
    totalPremium: 102,
    adjustContribution: 0,
    adjustCommission: 10,
    isSubscriberInsured: true,
    subscriber: 'Personne physique',
    insured: 'Personne physique',
    insuredType: 'Assuré',
    userAdmin: true,
    lockcontrols: true,
    isValid: false,
    attestationDoc: {
      title: 'Attestation'
    },
    receiptDoc: {
      title: 'Quittance'
    }
  };
  var insuredSubscriber = {
    insuredType: 'Assuré',
    lockcontrols: true
  };
  var subscriberType = {
    subscriber: 'Personne physique',
    lockcontrols: true
  };
  var insured = {
    gender: '1',
    id: '12345678',
    firstName: 'Sami',
    lastName: 'Saddem',
    birthDate: '1980-01-01',
    profession: '1',
    field: '1',
    name: 'Sami Saddem',
    medicalSelection: [{
      id: 1,
      description: 'Etes-vous en arrêt de travail pour une raison médicale?',
      answerYes: false,
      answerDetails: '',
      lockcontrols: true
    }, {
      id: 2,
      description: 'Suivez-vous un traitement médicamenteux?',
      answerYes: false,
      answerDetails: '',
      lockcontrols: true
    }, {
      id: 3,
      description: 'Avez-vous des séquelles d\'accident ? une infirmité ou un handicap ? une maladie congénitale ?',
      answerYes: false,
      answerDetails: '',
      lockcontrols: true
    }, {
      id: 4,
      description: 'Dans le passé, avez-vous été hospitalisé(e)? opéré(e) ? effectué un EXAMEN (ECG, EMG, IRM...)?',
      answerYes: true,
      answerDetails: 'Caillot de vésicule biliaire',
      lockcontrols: true
    }, {
      id: 5,
      description: 'Avez-vous été ou êtes-vous atteint(e) d\'une maladie chronique ?',
      answerYes: false,
      answerDetails: '',
      lockcontrols: true
    }],
    insuredHeight: 183,
    insuredWeight: 70,
    insuredSmoker: 'Non',
    lockcontrols: true
  };
  var loan = {
    duration: 120,
    amount: 155000,
    deductible: 0,
    releaseDate: '2015-11-15',
    endDate: '2025-10-30',
    lockcontrols: true
  };
  var beneficiary = {
    company: 'Al Baraka Bank',
    agency: null,
    lockcontrols: true
  };
  var person = {
    customerReference: null,
    id: '12345678',
    gender: '1',
    firstName: 'Ali',
    lastName: 'Kefia',
    birthDate: '1981-01-01',
    birthPlace: '24',
    profession: '4',
    professionField: '30',
    phone1: '71666777',
    phone2: '55555000',
    email1: 'ali.kefia@attakafulia.tn',
    email2: 'test@attakafulia.tn',
    address1: '10 RUE DE TEST POUR TEST TUNIS 1000',
    address2: '15 RUE DE JERUSALEM TUNIS LE BELVEDERE 1002',
    licenceNumber: '',
    licenceDate: '',
    socialprofession: '1',
    lockcontrols: true
  };
  var validationLocks = [{
    id: 1,
    description: 'Indice de masse corporelle bas.',
    validated: false
  }, {
    id: 2,
    description: 'L\'assuré suit un traitement médicamenteux.',
    validated: false
  }, {
    id: 3,
    description: 'Profil sanguin obligatoire.',
    validated: true
  }, {
    id: 4,
    description: 'Capital entrant en compte pour la réassurance.'
  }, {
    id: 5,
    description: 'L\'assuré est atteint d\'une maladie chronique.',
    validated: false
  }];
  res.send({
    insured: insured,
    policy: policy,
    loan: loan,
    beneficiary: beneficiary,
    person: person,
    insuredsubscriber: insuredSubscriber,
    subscribertype: subscriberType,
    validationLocks: validationLocks
  });
  // }}}
}

function calculateContribution(req, res) {
  // {{{
  res.send({});
  // }}}
}

function adminEdit(req, res) {
  // {{{
  res.send({});
  // }}}
}

function validateContract(req, res) {
  // {{{
  if (req.body.policy.reference === '15501999999') {
    res.send(500, 'Cette validation requiert une dérogation !');
    return;
  }
  var receiptDoc = {};
  receiptDoc.doc = 'rc-14100999999';
  receiptDoc.lob = '/all/receipt';
  receiptDoc.id = 'XXXXX';
  var attestationDoc = {};
  attestationDoc.doc = 'at-14100999999';
  attestationDoc.lob = '/loan/attestation';
  attestationDoc.id = 'XXXXX';
  res.send({
    receiptDoc: receiptDoc,
    attestationDoc: attestationDoc
  });
  // }}}
}

function lockvalidation(req, res) {
  // {{{
  res.send({});
  // }}}
}

function unlockvalidation(req, res) {
  // {{{
  res.send({});
  // }}}
}
exports.declare = function (app) {
  app.post('/svc/loan/credit/beneficiaries', session.ensureAuth, ora.listCreditBeneficiaries ||
    listCreditBeneficiaries);
  app.post('/svc/loan/credit/create', session.ensureAuth, ora.createCredit ||
    createCredit);
  app.post('/svc/loan/credit/update', session.ensureAuth, ora.updateCredit ||
    updateCredit);
  app.post('/svc/loan/coverage/list', session.ensureAuth, ora.listCoverages ||
    listCoverages);
  app.post('/svc/loan/subscriber/set', session.ensureAuth, ora.setSubscriber ||
    setSubscriber);
  app.post('/svc/loan/amortization/list', session.ensureAuth, ora.listAmortizations ||
    listAmortizations);
  app.post('/svc/loan/medicalselection/set', session.ensureAuth, ora.setMedicalSelection ||
    setMedicalSelection);
  app.post('/svc/loan/medicalselection/check', session.ensureAuth, ora.checkMedicalSelection ||
    checkMedicalSelection);
  app.post('/svc/loan/provider/doctor', session.ensureAuth, ora.getDoctorProvider ||
    getDoctorProvider);
  app.post('/svc/loan/provider/lab', session.ensureAuth, ora.getLabProvider ||
    getLabProvider);
  app.post('/svc/loan/provider/cardio', session.ensureAuth, ora.getCardioProvider ||
    getCardioProvider);
  app.post('/svc/loan/provider/imagery', session.ensureAuth, ora.getImageryProvider ||
    getImageryProvider);
  app.post('/svc/loan/print/medicalreport', session.ensureAuth, ora.printMedicalReport ||
    printMedicalReport);
  app.post('/svc/loan/print/financialreport', session.ensureAuth, ora.printFiancialReport ||
    printFiancialReport);
  app.post('/svc/loan/print/detailedquest', session.ensureAuth, ora.printDetailedQuest ||
    printDetailedQuest);
  app.post('/svc/loan/print/urinetest', session.ensureAuth, ora.printUrineTest ||
    printUrineTest);
  app.post('/svc/loan/print/bloodprofile', session.ensureAuth, ora.printBloodProfile ||
    printBloodProfile);
  app.post('/svc/loan/print/psa', session.ensureAuth, ora.printPSA ||
    printPSA);
  app.post('/svc/loan/print/ecg', session.ensureAuth, ora.printECG ||
    printECG);
  app.post('/svc/loan/print/stressecg', session.ensureAuth, ora.printStressECG ||
    printStressECG);
  app.post('/svc/loan/print/chestfilm', session.ensureAuth, ora.printChestFilm ||
    printChestFilm);
  app.post('/svc/loan/project/save', session.ensureAuth, ora.saveProject ||
    saveProject);
  app.post('/svc/loan/search/getData', session.ensureAuth, ora.searchLoan ||
    searchLoan);
  app.post('/svc/loan/policy/get', session.ensureAuth, ora.getLoanPol ||
    getLoanPol);
  app.post('/svc/loan/contribution/calculate', session.ensureAuth, ora.calculateContribution ||
    calculateContribution);
  app.post('/svc/loan/admin/edit', session.ensureAuth, ora.adminEdit ||
    adminEdit);
  app.post('/svc/loan/contract/validate', session.ensureAuth, ora.validateContract ||
    validateContract);
  app.post('/svc/loan/admin/lockvalidation', session.ensureAuth, ora.lockvalidation ||
    lockvalidation);
  app.post('/svc/loan/admin/unlockvalidation', session.ensureAuth, ora.unlockvalidation ||
    unlockvalidation);
};
