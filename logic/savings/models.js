/* vim: fdm=marker
 */
var moment = require('moment');
var utils = require('../utils');
var val = require('../val');

function createDefaultDraft() {
  // {{{
  var today = moment();
  var nextFirst = moment()
    .add(1, 'month');
  var bd = utils.momentFromJSON('1979-05-01');
  return {
    admin: {
      depEarnRate: 0.045,
      depIniMin: 0,
      depIniComRate: 0.05,
      depFreeMinComRate: 0,
      depFreeMaxComRate: 0.1,
      depFreeDefComRate: 0.05,
      depPerMin: 600,
      depPerComRate: [0.3, 0.05],
      updateCom: false,
      termActRate: 0.03,
      termFeesRate: 0.0005,
      termSurvAdjust: 0,
      feesIni: 10,
      feesDep: 2,
      maxAge: 70,
      withoutDebit: false,
      minForDebit: 100,
      useTV: false
    },
    def: {
      effDate: utils.momentToJSON(today.add(1, 'day')),
      termDate: utils.momentToJSON(today.add(15, 'year'))
    },
    insured: {
      birthDate: utils.momentToJSON(bd),
      gender: 'm',
      job: 'Ingénieur',
      taxRate: 0.3
    },
    deposit: {
      initial: 3000,
      periodic: 500,
      free: [],
      updateRate: 0,
      period: 12,
      number: 180,
      nextDate: utils.momentToJSON(nextFirst)
    },
    terms: [{
      evt: 'd',
      type: 'd',
      cap: 50000,
      fromBack: false
    }]
  };
  // }}}
}

function getAdminDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      depEarnRate: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 0.10
      },
      depIniMin: {
        type: 'num',
        mandatory: true,
        min: 0
      },
      depIniComRate: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 1
      },
      depFreeMinComRate: {
        type: 'num',
        min: 0,
        max: 1
      },
      depFreeMaxComRate: {
        type: 'num',
        min: 0,
        max: 1
      },
      depFreeDefComRate: {
        type: 'num',
        min: 0,
        max: 1
      },
      depPerMin: {
        type: 'num',
        mandatory: true,
        min: 0
      },
      depPerComRate: {
        type: 'array',
        mandatory: true,
        min: 1,
        element: {
          type: 'num',
          min: 0,
          max: 1
        }
      },
      updateCom: {
        type: 'bool',
        mandatory: true
      },
      termActRate: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 1
      },
      termFeesRate: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 1
      },
      termSurvAdjust: {
        type: 'num',
        mandatory: true,
        min: -1,
        max: 0.3
      },
      feesIni: {
        type: 'num',
        mandatory: true,
        min: 0
      },
      feesDep: {
        type: 'num',
        mandatory: true,
        min: 0
      },
      maxAge: {
        type: 'num',
        mandatory: true,
        min: 0
      },
      useTV: {
        type: 'bool',
        mandatory: true
      },
      withoutDebit: {
        type: 'bool'
      },
      minForDebit: {
        type: 'num'
      }
    }
  };
  // }}}
}

function getDefinitionDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      effDate: {
        type: 'date',
        mandatory: true,
        younger: [0, 'day']
      },
      termDate: {
        type: 'date',
        mandatory: true
      },
      pack: {
        type: 'str'
      },
      ref: {
        type: 'num'
      },
      ver: {
        type: 'num'
      },
      nature: {
        type: 'str'
      },
      status: {
        type: 'str'
      },
      motive: {
        type: 'str'
      },
      user: {
        type: 'obj',
        fields: {
          ip: {
            type: 'str'
          },
          id: {
            type: 'str'
          },
          username: {
            type: 'str'
          },
          fullName: {
            type: 'str'
          },
          email: {
            type: 'str'
          },
          pos: {
            type: 'obj',
            fields: {
              code: {
                type: 'str'
              },
              name: {
                type: 'str'
              }
            }
          }
        }
      },
      endorsement: {
        type: 'obj',
        fields: {
          date: {
            type: 'date'
          },
          motif: {
            type: 'str'
          }
        }
      }
    }
  };
  // }}}
}

function getInsuredDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      id: {
        type: 'str',
        match: val.idRE
      },
      gender: {
        type: 'str',
        mandatory: true,
        values: ['m', 'f']
      },
      firstName: {
        type: 'str'
      },
      name: {
        type: 'str'
      },
      birthDate: {
        type: 'date',
        mandatory: true,
        older: [20, 'year']
      },
      mobile: {
        type: 'str',
        match: val.mobileRE
      },
      email: {
        type: 'str',
        match: val.emailRE
      },
      job: {
        type: 'str'
      },
      taxRate: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 0.35
      }
    }
  };
  // }}}
}

function getFullInsuredDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      id: {
        type: 'str',
        match: val.idRE
      },
      gender: {
        type: 'str',
        mandatory: true,
        values: ['m', 'f']
      },
      firstName: {
        type: 'str',
        mandatory: true
      },
      name: {
        type: 'str',
        mandatory: true
      },
      birthDate: {
        type: 'date',
        mandatory: true,
        older: [20, 'year']
      },
      mobile: {
        type: 'str',
        mandatory: true,
        match: val.mobileRE
      },
      email: {
        type: 'str',
        match: val.emailRE
      },
      job: {
        type: 'str'
      },
      taxRate: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 0.35
      }
    }
  };
  // }}}
}

function getDepositDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      initial: {
        type: 'num'
      },
      periodic: {
        type: 'num'
      },
      free: {
        type: 'array',
        element: {
          type: 'obj',
          fields: {
            amount: {
              type: 'num'
            },
            effDate: {
              type: 'date'
            },
            com: {
              type: 'num',
              min: 0,
              max: 1
            }
          }
        }
      },
      updateRate: {
        type: 'num',
        min: 0
      },
      period: {
        type: 'int',
        values: [1, 2, 4, 12]
      },
      number: {
        type: 'int'
      },
      nextDate: {
        type: 'date',
        younger: [0, 'day']
      }
    }
  };
  // }}}
}

function getTermsDesc() {
  // {{{
  return {
    type: 'array',
    element: {
      type: 'obj',
      fields: {
        evt: {
          type: 'str',
          mandatory: true,
          values: ['d', 'ad', 'i', 'ai']
        },
        type: {
          type: 'str',
          mandatory: true,
          values: ['d', 'f']
        },
        cap: {
          type: 'num',
          mandatory: true,
          min: 5000
        },
        fromBack: {
          type: 'bool',
          mandatory: true
        }
      }
    }
  };
  // }}}
}

function getBeneficiariesDesc() {
  // {{{
  return {
    type: 'array',
    element: {
      type: 'obj',
      fields: {
        relation: {
          type: 'str',
          mandatory: true,
          values: ['self', 'spouse', 'asc', 'des', 'other', 'legal']
        },
        id: {
          type: 'str',
          match: val.idRE
        },
        birthDate: {
          type: 'date'
        },
        name: {
          type: 'str'
        },
        percent: {
          type: 'num',
          mandatory: true,
          min: 0,
          max: 1
        }
      }
    }
  };
  // }}}
}

function getSubscriberDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      id: {
        type: 'str',
        mandatory: true,
        match: val.idRE
      },
      reference: {
        type: 'str'
      },
      gender: {
        type: 'str',
        mandatory: true,
        values: ['m', 'f']
      },
      firstName: {
        type: 'str',
        mandatory: true
      },
      name: {
        type: 'str',
        mandatory: true
      },
      birthDate: {
        type: 'date',
        mandatory: true,
        older: [18, 'year']
      },
      phone: {
        type: 'str',
        match: val.phoneRE
      },
      mobile: {
        type: 'str',
        mandatory: true,
        match: val.mobileRE
      },
      email: {
        type: 'str',
        mandatory: true,
        match: val.emailRE
      },
      address: {
        type: 'str',
        mandatory: true
      }
    }
  };
  // }}}
}

function getDraftSubscriberDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      id: {
        type: 'str',
        match: val.idRE
      },
      reference: {
        type: 'str'
      },
      gender: {
        type: 'str',
        values: ['m', 'f']
      },
      firstName: {
        type: 'str',
      },
      name: {
        type: 'str',
      },
      birthDate: {
        type: 'date',
        older: [18, 'year']
      },
      phone: {
        type: 'str',
        match: val.phoneRE
      },
      mobile: {
        type: 'str',
        match: val.mobileRE
      },
      email: {
        type: 'str',
        match: val.emailRE
      },
      address: {
        type: 'str',
      }
    }
  };
  // }}}
}

function getSettlementsDesc() {
  // {{{
  return {
    type: 'array',
    element: {
      type: 'obj',
      fields: {
        amount: {
          type: 'num',
          mandatory: true
        },
        mode: {
          type: 'str',
          mandatory: true,
          values: ['cash', 'check', 'deposit', 'transfer', 'debit',
            'promissory'
          ]
        },
        name: {
          type: 'str'
        }
      }
    }
  };
  // }}}
}

function getPaymentDesc() {
  //{{{
  return {
    type: 'obj',
    fields: {
      mode: {
        type: 'str',
        values: ['debit', '']
      },
      bankAccount: {
        type: 'str'
      },
      domiciliation: {
        type: 'str'
      },
      'domiciliationDate': {
        type: 'date'
      }
    }
  };
  //}}}
}

function generateDraftDesc() {
  // {{{
  var desc = {
    type: 'obj',
    mandatory: true,
    fields: {}
  };
  desc.fields.admin = getAdminDesc();
  desc.fields.admin.mandatory = true;
  desc.fields.def = getDefinitionDesc();
  desc.fields.def.mandatory = true;
  desc.fields.insured = getInsuredDesc();
  desc.fields.insured.mandatory = true;
  desc.fields.subscriber = getDraftSubscriberDesc();
  desc.fields.subscriber.mandatory = false;
  desc.fields.deposit = getDepositDesc();
  desc.fields.deposit.mandatory = true;
  desc.fields.terms = getTermsDesc();
  desc.fields.terms.mandatory = true;
  desc.fields.terms.max = 4;
  return desc;
  // }}}
}

function generateQuoteDesc() {
  // {{{ TODO 
  var desc = {
    type: 'obj',
    mandatory: true,
    fields: {}
  };
  desc.fields.admin = getAdminDesc();
  desc.fields.admin.mandatory = true;
  desc.fields.def = getDefinitionDesc();
  desc.fields.def.mandatory = true;
  desc.fields.insured = getFullInsuredDesc();
  desc.fields.insured.mandatory = true;
  desc.fields.deposit = getDepositDesc();
  desc.fields.deposit.mandatory = true;
  desc.fields.terms = getTermsDesc();
  desc.fields.terms.mandatory = true;
  desc.fields.terms.max = 4;
  desc.fields.subscriber = getSubscriberDesc();
  desc.fields.subscriber.mandatory = true;
  return desc;
  // }}}
}

function generateContractDesc() {
  // {{{
  var desc = {
    type: 'obj',
    mandatory: true,
    fields: {}
  };
  desc.fields.admin = getAdminDesc();
  desc.fields.admin.mandatory = true;
  desc.fields.def = getDefinitionDesc();
  desc.fields.def.mandatory = true;
  desc.fields.insured = getFullInsuredDesc();
  desc.fields.insured.mandatory = true;
  for (var k in desc.fields.insured.fields) {
    desc.fields.insured.fields[k].mandatory = true;
  }
  desc.fields.deposit = getDepositDesc();
  desc.fields.deposit.mandatory = true;
  desc.fields.terms = getTermsDesc();
  desc.fields.terms.mandatory = true;
  desc.fields.terms.max = 4;
  desc.fields.lifeBen = getBeneficiariesDesc();
  desc.fields.lifeBen.mandatory = true;
  desc.fields.lifeBen.max = 5;
  desc.fields.deathBen = getBeneficiariesDesc();
  desc.fields.deathBen.mandatory = true;
  desc.fields.deathBen.max = 5;
  desc.fields.subscriber = getSubscriberDesc();
  desc.fields.subscriber.mandatory = true;
  desc.fields.settlements = getSettlementsDesc();
  desc.fields.settlements.mandatory = true;
  desc.fields.settlements.min = 1;
  desc.fields.payment = getPaymentDesc();
  desc.fields.payment.mandatory = true;
  return desc;
  // }}}
}
Object.defineProperty(exports, 'defaultDraft', {
  get: createDefaultDraft
});
exports.draftDesc = generateDraftDesc();
exports.quoteDesc = generateQuoteDesc();
exports.contractDesc = generateContractDesc();
