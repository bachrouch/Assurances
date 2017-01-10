/* globals google */
main.module('actors', function (mod, app, Backbone) {
  mod.Person = Backbone.Model.extend({
    /*
     * customerReference: string
     * id: string (cin)
     * gender: select (monsieur/madame)
     * firstName: string
     * lastName: string
     * birthDate: date
     * birthPlace: select (gouvernorat)
     * profession: select
     * professionField: select
     * phone1: string (téléphone mobile)
     * phone2: string (téléphone fixe)
     * email1: string (email personnel)
     * email2: string (email pro)
     * adresse1: string (adresse principale)
     * adresse2: string (adresse secondaire)
     * postalCode: list
     * locality :list
     */
    dateAttributes: ['birthDate'],
    firstName: '',
    defaults: {
      customerReference: null,
      locality: 'Localité',
      delegation: '',
      governorate: '',
      postalCode: null,
      mapProp: {
        center: new google.maps.LatLng(34, 10),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
    },
    setFullName: function (fullName) {
      if (fullName) {
        var match = fullName.match(/(\w+)\s+(\w+)/i);
        if (match) {
          this.set({
            firstName: match[1],
            lastName: match[2]
          });
        }
      }
    },
    getFullName: function () {
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      if (firstName && lastName) {
        return firstName + ' ' + lastName;
      }
    }
  });
  mod.Company = Backbone.Model.extend({
    /*
     * customerReference: string
     * id: string (registre du commerce)
     * taxNumber: string (matricule fiscal)
     * structureType: select (sarl, sa, ...)
     * companyName: string (raison sociale)
     * activityField: select
     * contactName: string
     * contactPhone: string
     * contactEmail: string
     * phone: string
     * fax: string
     * email: string
     * address: string
     * postalCode :list
     * locality : list
     */
    // TODO: separate from beneficiary model
    dateAttributes: ['withdrawalDate'],
    defaults: {
      customerReference: null,
      locality: 'Localité',
      delegation: '',
      governorate: '',
      mapProp: {
        center: new google.maps.LatLng(34, 10),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
    }
  });
  mod.InsuredPerson = Backbone.Model.extend({
    /*
     * customerReference: string
     * id: string (cin)
     * gender: select (monsieur/madame)
     * firstName: string
     * lastName: string
     * licenceDate: date
     * licenceNumber: string
     * phone1: string (téléphone mobile)
     * email1: string (email personnel)
     * adresse1: string (adresse principale)
     */
    dateAttributes: ['licenceDate'],
    defaults: {
      customerReference: null
    }
  });
  mod.InsuredCompany = Backbone.Model.extend({
    /*
     * customerReference: string
     * id: string (registre du commerce)
     * companyName: string (raison sociale)
     */
    // TODO: separate from beneficiary model
    defaults: {
      customerReference: null
    }
  });
});
