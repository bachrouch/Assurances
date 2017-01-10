main.module('loan', function (mod, app, Backbone) {
  mod.Credit = Backbone.Model.extend({
    /*
     * releaseDate: date
     * endDate: date
     * amount: number
     * duration: number
     * deductible: number
     * refundFreq: select
     * premiumFreq: select
     */
    dateAttributes: ['releaseDate', 'endDate']
  });
  mod.Insured = Backbone.Model.extend({
    /*
     * id: string (cin)
     * state: select
     * gender: select (monsieur/madame)
     * firstName: string
     * lastName: string
     * birthDate: date
     * birthPlace: select (gouvernorat)
     */
    dateAttributes: ['birthDate'],
    getFullName: function () {
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      if (firstName && lastName) {
        return firstName + ' ' + lastName;
      }
    }
  });
  mod.Beneficiary = Backbone.Model.extend({
    /*
     * company: select
     * agency: number
     */
  });
  mod.Coverage = Backbone.Model.extend({
    /*
     * name: string
     * rate: number
     * fees: number
     * premium: number
     */
    defaults: {
      name: null,
      rate: null,
      fees: null,
      premium: null
    }
  });
  mod.Coverages = Backbone.Collection.extend({
    model: mod.Coverage
  });
  mod.Reports = Backbone.Model.extend({
    /*
     * medselDoc: Document
     */
    defaults: function () {
      return {
        medicalReport: new app.common.Doc({
          title: 'Rapport médical'
        }),
        urineAnalysis: new app.common.Doc({
          title: 'Examen urines'
        }),
        medicalQuest: new app.common.Doc({
          title: 'Questionnaire médical'
        }),
        bloodProfile: new app.common.Doc({
          title: 'Profil sanguin'
        }),
        ecgReport: new app.common.Doc({
          title: 'ECG'
        }),
        psaReport: new app.common.Doc({
          title: 'PSA'
        }),
        effortECGReport: new app.common.Doc({
          title: 'ECG d\'effort'
        }),
        chestReport: new app.common.Doc({
          title: 'Radio thorax'
        }),
        financialReport: new app.common.Doc({
          title: 'Questionnaire financier'
        })
      };
    }
  });
  mod.MedicalQuestion = Backbone.Model.extend({});
  mod.MedicalQuestions = Backbone.Collection.extend({
    model: mod.MedicalQuestion
  });
  mod.DoctorProvider = Backbone.Model.extend({});
  mod.DoctorTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.DoctorTests = Backbone.Collection.extend({
    model: mod.DoctorTest
  });
  mod.LabProvider = Backbone.Model.extend({});
  mod.LabTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.LabTests = Backbone.Collection.extend({
    model: mod.LabTest
  });
  mod.CardioProvider = Backbone.Model.extend({});
  mod.CardioTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.CardioTests = Backbone.Collection.extend({
    model: mod.CardioTest
  });
  mod.ImageProvider = Backbone.Model.extend({});
  mod.ImageTest = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.ImageTests = Backbone.Collection.extend({
    model: mod.ImageTest
  });
  mod.MedicalSelection = Backbone.Model.extend({
    defaults: function () {
      return {
        medselDoc: new app.common.Doc({
          title: 'Imprimer'
        })
      };
    }
  });
  mod.MedicalSelections = Backbone.Collection.extend({
    model: mod.MedicalSelection
  });
  mod.Amortization = Backbone.Model.extend({
    /*
     * date: date
     * amount: amount
     */
    defaults: {
      date: null,
      amount: null
    }
  });
  mod.Amortizations = Backbone.Collection.extend({
    model: mod.Amortization
  });
  mod.Quote = Backbone.Model.extend({
    /*
     * premium: amount
     * rate: amount
     * fees: amount
     * totalPremium: amount
     * subscriber: select (personne physique ou morale)
     * subscriberName: string
     * subscriberPhone: string
     * insured: select (personne physique ou morale)
     * subscriberEmail: string
     * quoteDoc: quote printed offer
     * cpDoc: conditions particulières
     * receiptDoc: quittance
     * isSubscriberInsured: boolean default set to true
     */
    getPersonSubscriber: function () {
      return 'Personne physique';
    },
    isSubscriberPerson: function () {
      return this.get('subscriber') === this.getPersonSubscriber();
    },
    wasSubscriberPerson: function () {
      return this.previous('subscriber') === this.getPersonSubscriber();
    },
    getCompanySubscriber: function () {
      return 'Personne morale';
    },
    isSubscriberCompany: function () {
      return this.get('subscriber') === this.getCompanySubscriber();
    },
    wasSubscriberCompany: function () {
      return this.previous('subscriber') === this.getCompanySubscriber();
    },
    getPersonInsured: function () {
      return 'Personne physique';
    },
    isInsuredPerson: function () {
      return this.get('insured') === this.getPersonInsured();
    },
    wasInsuredPerson: function () {
      return this.previous('insured') === this.getPersonInsured();
    },
    defaults: function () {
      return {
        premium: null,
        fees: null,
        totalPremium: null,
        isSubscriberInsured: true,
        subscriber: this.getPersonSubscriber(),
        insured: this.getPersonInsured(),
        cpDoc: new app.common.Doc({
          title: 'Conditions particulières'
        }),
        receiptDoc: new app.common.Doc({
          title: 'Quittance'
        }),
        validateLink: new app.common.ProcessLink({
          title: 'Valider'
        })
      };
    }
  });
});
