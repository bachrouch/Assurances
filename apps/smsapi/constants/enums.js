/* vim: fdm=marker
 */
angular.module('app')
  .constant('enums', {
    actor: {
      // {{{
      genders: [{
        code: 'm',
        label: 'Monsieur'
      }, {
        code: 'f',
        label: 'Madame'
      }],
      relations: [{
        code: 'self',
        label: 'Soi-même'
      }, {
        code: 'spouse',
        label: 'Conjoint'
      }, {
        code: 'asc',
        label: 'Ascendant'
      }, {
        code: 'des',
        label: 'Descendant'
      }, {
        code: 'legal',
        label: 'Héritiers légaux'
      }, {
        code: 'other',
        label: 'Autre'
      }],
      // }}}
    },
    policy: {
      // {{{
      periods: [{
        code: 1,
        label: 'Annuel'
      }, {
        code: 2,
        label: 'Semestriel'
      }, {
        code: 4,
        label: 'Trimestriel'
      }, {
        code: 12,
        label: 'Mensuel'
      }],
      terms: [{
        code: 'f',
        label: 'Fixe'
      }, {
        code: 60,
        label: 'Age terme 60 ans'
      }, {
        code: 62,
        label: 'Age terme 62 ans'
      }, {
        code: 65,
        label: 'Age terme 65 ans'
      }],
      status: [{
          code: 'active',
          label: 'Actif'
        }, {
          code: 'canceled',
          label: 'Annulé'
        }, {
          code: 'suspended',
          label: 'Suspendu'
        }, {
          code: 'terminated',
          label: 'Résilié'
        }]
        // }}}
    },
    finance: {
      // {{{
      paymentMethods: [{
        code: 'cash',
        label: 'Espèces'
      }, {
        code: 'check',
        label: 'Chèque'
      }, {
        code: 'deposit',
        label: 'Versement'
      }, {
        code: 'transfer',
        label: 'Virement'
      }, {
        code: 'promissory',
        label: 'Traite'
      }],
      debitDays: [{
          code: 10,
          label: 10
        }, {
          code: 25,
          label: 25
        }, {
          code: 30,
          label: 30
        }]
        // }}}
    },
    savings: {
      // {{{
      mvts: [{
        code: 'dep',
        label: 'Versement'
      }, {
        code: 'com',
        label: 'Commission'
      }, {
        code: 'term',
        label: 'Prévoyance'
      }, {
        code: 'earn',
        label: 'Rémunération'
      }],
      taxes: [{
        code: 0,
        label: '0%'
      }, {
        code: 0.15,
        label: '15%'
      }, {
        code: 0.20,
        label: '20%'
      }, {
        code: 0.25,
        label: '25%'
      }, {
        code: 0.30,
        label: '30%'
      }, {
        code: 0.35,
        label: '35%'
      }],
      updates: [{
        code: 0,
        label: '0%'
      }, {
        code: 0.03,
        label: '3%'
      }, {
        code: 0.05,
        label: '5%'
      }],
      // }}}
    },
    term: {
      // {{{
      evts: [{
        code: 'd',
        label: 'Décès'
      }, {
        code: 'ad',
        label: 'Décès Accidentel'
      }, {
        code: 'i',
        label: 'IPP ou IPT'
      }, {
        code: 'ai',
        label: 'IPP ou IPT Accidentel'
      }],
      types: [{
        code: 'd',
        label: 'Dégressif'
      }, {
        code: 'f',
        label: 'Fixe'
      }],
      capitals: [{
        code: 50000,
        label: 50000
      }, {
        code: 60000,
        label: 60000
      }, {
        code: 70000,
        label: 70000
      }, {
        code: 80000,
        label: 80000
      }, {
        code: 90000,
        label: 90000
      }, {
        code: 100000,
        label: 100000
      }, {
        code: 110000,
        label: 110000
      }],
      // }}}
    }
  });
