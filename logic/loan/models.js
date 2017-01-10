/* vim: fdm=marker
 */
var moment = require('moment');
var utils = require('../utils');
var val = require('../val');

function createDefaultDraft() {
  // {{{
  var today = moment();
  var bd = utils.momentFromJSON('1981-03-31');
  return {
    admin: {
      termActRate: 0.035,
      termFeesRate: 0.0001,
      termSurvAdjust: 0,
      termSurvAdjustMin: 0,
      termSurvAdjustMax: 0.2,
      fees: 2,
      maxAge: 70,
      useTV: false,
      useFloorRate: true,
      com: 0.1,
    },
    adjustement: {
      termSurvAdjust: 0,
      com: 0.1
    },
    def: {
      effDate: utils.momentToJSON(today),
      termDate: utils.momentToJSON(today.add(1, 'year')),
      deductible: 3, //3 months
      period: 12,
      capital: 50000
    },
    insured: {
      birthDate: utils.momentToJSON(bd),
      gender: 'm'
    },
    terms: [{
      evt: 'd',
      type: 'd',
      cap: 50000
    }],
    history: []
  };
  // }}}
}

function getAdminDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
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
        max: 1
      },
      termSurvAdjustMin: {
        type: 'num',
        mandatory: true,
        min: -1,
        max: 1
      },
      termSurvAdjustMax: {
        type: 'num',
        mandatory: true,
        min: -1,
        max: 1
      },
      fees: {
        type: 'num',
        mandatory: true,
        min: 0
      },
      maxAge: {
        type: 'num',
        mandatory: true,
        min: 0
      },
      com: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 1
      },
      useTV: {
        type: 'bool',
        mandatory: true
      },
      useFloorRate: {
        type: 'bool',
        mandatory: true
      }
    }
  };
  // }}}
}

function getAdjustementDesc() {
  // {{{
  return {
    type: 'obj',
    fields: {
      termSurvAdjust: {
        type: 'num',
        mandatory: true,
        min: -1,
        max: 0.3
      },
      com: {
        type: 'num',
        mandatory: true,
        min: 0,
        max: 1
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
      deductible: {
        type: 'num',
        mandatory: true,
        min: 0
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
      },
      period: {
        type: 'int',
        values: [1, 2, 4, 12]
      },
      capital: {
        type: 'int',
        mandatory: true
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
          min: 100
        }
      }
    }
  };
  // }}}
}

function getHistoryDesc() {
  // {{{
  return {
    type: 'array',
    element: {
      type: 'obj',
      fields: {
        user: {
          type: 'str',
          mandatory: true
        },
        date: {
          type: 'date',
          mandatory: true
        },
        time: {
          type: 'time',
          mandatory: true
        },
        action: {
          type: 'str',
          mandatory: true
        },
        details: {
          type: 'str'
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

function generateDraftDesc() {
  // {{{
  var desc = {
    type: 'obj',
    mandatory: true,
    fields: {}
  };
  desc.fields.admin = getAdminDesc();
  desc.fields.admin.mandatory = true;
  desc.fields.adjustement = getAdjustementDesc();
  desc.fields.adjustement.mandatory = true;
  desc.fields.def = getDefinitionDesc();
  desc.fields.def.mandatory = true;
  desc.fields.insured = getInsuredDesc();
  desc.fields.insured.mandatory = true;
  desc.fields.subscriber = getDraftSubscriberDesc();
  desc.fields.subscriber.mandatory = false;
  desc.fields.terms = getTermsDesc();
  desc.fields.terms.mandatory = true;
  desc.fields.terms.max = 4;
  desc.fields.history = getHistoryDesc();
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
  desc.fields.adjustement = getAdjustementDesc();
  desc.fields.adjustement.mandatory = true;
  desc.fields.def = getDefinitionDesc();
  desc.fields.def.mandatory = true;
  desc.fields.insured = getFullInsuredDesc();
  desc.fields.insured.mandatory = true;
  desc.fields.terms = getTermsDesc();
  desc.fields.terms.mandatory = true;
  desc.fields.terms.max = 4;
  desc.fields.subscriber = getSubscriberDesc();
  desc.fields.subscriber.mandatory = true;
  desc.fields.history = getHistoryDesc();
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
  desc.fields.adjustement = getAdjustementDesc();
  desc.fields.adjustement.mandatory = true;
  desc.fields.def = getDefinitionDesc();
  desc.fields.def.mandatory = true;
  desc.fields.insured = getFullInsuredDesc();
  desc.fields.insured.mandatory = true;
  for (var k in desc.fields.insured.fields) {
    desc.fields.insured.fields[k].mandatory = true;
  }
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
  desc.fields.history = getHistoryDesc();
  return desc;
  // }}}
}
Object.defineProperty(exports, 'defaultDraft', {
  get: createDefaultDraft
});
exports.draftDesc = generateDraftDesc();
exports.quoteDesc = generateQuoteDesc();
exports.contractDesc = generateContractDesc();
