var user = {};
user.code = 'bob';
var pages = [{
    id: 'auto',
    path: '/auto',
    label: 'Auto',
    active: false,
    items: [{
      label: 'Présentation',
      path: '/auto#index'
    }, {
      label: 'Souscription Individuelle',
      path: '/auto#subscribe'
    }, {
      label: 'Souscription Flotte',
      path: '/auto#fleet'
    },
    {
     label: 'Souscription Frontière',
     path: '/auto#frontierInsurance'
   },
    {
      label: 'Rechercher',
      path: '/auto#search'
    }, {
      label: 'Gestion du terme',
      path: '/auto#term'
    }]
  }, {
    id: 'assistance',
    path: '/assistance',
    label: 'Assistance',
    active: false,
    items: [{
      label: 'Présentation',
      path: '/assistance#index'
    }, {
      label: 'Souscrire',
      path: '/assistance#subscribe'
    }]
  }, {
    id: 'loan',
    path: '/loan',
    label: 'Tamouil',
    active: false,
    items: [{
      label: 'Présentation',
      path: '/loan#index'
    }, {
      label: 'Souscrire',
      path: '/loan#subscribe'
    }]
  }, {
    id: 'family',
    path: '/family',
    label: 'Vie',
    active: false,
    items: [{
      label: 'Présentation',
      path: '/family/#/index'
    }, {
      label: 'Souscription Epargne / Retraite',
      path: '/family/#/savings/subscribe/new'
    }, {
      label: 'Rechercher',
      path: '/family/#/savings/search'
    }]
  }, {
    id: 'finance',
    path: '/finance',
    label: 'Finance',
    active: false,
    items: [{
      label: 'Nouvelle Feuille de caisse',
      path: '/finance#payment'
    }, {
      label: 'Rechercher Feuille de caisse',
      path: '/finance#payment/search'
    }, {
      label: 'Rechercher Quittance',
      path: '/finance#receipt/search'
    }, {
      label: 'Quittancement',
      path: '/finance#premium/search'
    }]
    }, {
    id: 'sms',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
    path: '/sms',
    label: 'Messages',
    active: false,
    items: [{
      label: 'Rechercher Bordoreau',
      path: '/smsapi/#/savings/search'
    }, {
      label: 'Envoyer SMS',
      path: '/smsapi/send'
    }]
  }, {
    id: 'admin',
    path: '/admin',
    label: 'Administration',
    active: false,
    items: [{
      label: 'Feuilles de caisse',
      path: '/admin#payment'
    }, {
      label: 'Quittances',
      path: '/admin#receipt'
    }, {
      label: 'Nouveau Remboursement ',
      path: '/admin#payback'
    }, {
      label: 'Rechercher Remboursement',
      path: '/admin#payback/search'
    }, {
      label: 'Terme',
      path: '/admin#terms'
    }, {
      label: 'Gestion des dérogations',
      path: '/admin#exemption'
    }]
  }];
  user.pages = pages;
  db.user.insert(user);
