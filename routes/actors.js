/* vim: fdm=marker
 */
var session = require('../logic/session');
var client = require('../logic/client');
var ora = require('./actors-ora');
var mongo = require('../mongo');
var _ = require('underscore');

function listStates(req, res) {
  // {{{
  //var criterium = req.body.criterium;
  res.send([{
    id: 1,
    text: 'Ariana'
  }, {
    id: 2,
    text: 'Béja'
  }, {
    id: 3,
    text: 'Ben Arous'
  }, {
    id: 4,
    text: 'Bizerte'
  }, {
    id: 5,
    text: 'Gabès'
  }, {
    id: 6,
    text: 'Gafsa'
  }, {
    id: 7,
    text: 'Jendouba'
  }, {
    id: 8,
    text: 'Kairouan'
  }, {
    id: 9,
    text: 'Kasserine'
  }, {
    id: 10,
    text: 'Kébili'
  }, {
    id: 11,
    text: 'Kef'
  }, {
    id: 12,
    text: 'Mahdia'
  }, {
    id: 13,
    text: 'Manouba'
  }, {
    id: 14,
    text: 'Médenine'
  }, {
    id: 15,
    text: 'Monastir'
  }, {
    id: 16,
    text: 'Nabeul'
  }, {
    id: 17,
    text: 'Sfax'
  }, {
    id: 18,
    text: 'Sidi Bouzid'
  }, {
    id: 19,
    text: 'Siliana'
  }, {
    id: 20,
    text: 'Sousse'
  }, {
    id: 21,
    text: 'Tataouine'
  }, {
    id: 22,
    text: 'Tozeur'
  }, {
    id: 23,
    text: 'Tunis'
  }, {
    id: 24,
    text: 'Zaghouan'
  }]);
  // }}}
}

function listFields(req, res) {
  // {{{
  //var criterium = req.body.criterium;
  res.send([{
    id: 1,
    text: 'Transports et services connexes'
  }, {
    id: 2,
    text: 'Télécommunication et technologies de l\'information'
  }, {
    id: 3,
    text: 'Services et équipements pour la santé'
  }, {
    id: 4,
    text: 'Services aux entreprises'
  }, {
    id: 5,
    text: 'Pétrole et gaz'
  }, {
    id: 6,
    text: 'Mécanique et sous-traitance industrielle'
  }, {
    id: 7,
    text: 'Maison et décoration'
  }, {
    id: 8,
    text: 'Loisirs, tourisme et bien-être'
  }, {
    id: 9,
    text: 'Logistique, manutention et stockage'
  }, {
    id: 10,
    text: 'Informatique, bureautique et NTIC'
  }, {
    id: 11,
    text: 'Impression, papier et édition'
  }, {
    id: 12,
    text: 'Hydraulique et pneumatique'
  }, {
    id: 13,
    text: 'Habillement et industrie textile'
  }, {
    id: 14,
    text: 'Equipements pour la distribution'
  }, {
    id: 15,
    text: 'Environnement'
  }, {
    id: 16,
    text: 'Energie, minerais et matières premières'
  }, {
    id: 17,
    text: 'Emballage et conditionnement'
  }, {
    id: 18,
    text: 'Electricité , électronique et électroménager'
  }, {
    id: 19,
    text: 'Communication, événement et équipements audiovisuels'
  }, {
    id: 20,
    text: 'Chimie, cosmétique et hygiène'
  }, {
    id: 21,
    text: 'Chauffage et climatisation'
  }, {
    id: 22,
    text: 'Caoutchouc et plastique'
  }, {
    id: 23,
    text: 'Biens et équipements d\'hôtellerie et de restauration'
  }, {
    id: 24,
    text: 'Biens et équipements d\'entreprise'
  }, {
    id: 25,
    text: 'Bâtiment et construction'
  }, {
    id: 26,
    text: 'Artisanat'
  }, {
    id: 27,
    text: 'Analyse, mesure et pesage'
  }, {
    id: 28,
    text: 'Agroalimentaire'
  }, {
    id: 29,
    text: 'Agriculture , élevage et pêche'
  }, {
    id: 30,
    text: 'Administration et organismes'
  }]);
  // }}}
}

function listProfessions(req, res) {
  // {{{
  //var criterium = req.body.criterium;
  res.send([{
    id: 1,
    text: 'Employé'
  }, {
    id: 2,
    text: 'Cadre moyen'
  }, {
    id: 3,
    text: 'Cadre'
  }, {
    id: 4,
    text: 'Cadre supérieur'
  }, {
    id: 5,
    text: 'Profession libérale'
  }]);
  // }}}
}

function getClient(req, res) {
  // {{{
  var custtype = req.body.custtype;
  var custid = req.body.custid;
  if (custtype === 'person' && custid === '12345678') {
    res.send({
      person: {
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
        address: '10 RUE DE TEST POUR TEST TUNIS 1000',
        address2: '15 RUE DE JERUSALEM TUNIS LE BELVEDERE 1002',
        licenceNumber: 'T12345678',
        licenceDate: '2000-10-27',
        postalCode: '1002',
        delegation: 'Cite El Khadra'
      }
    });
  }
  else if (custtype === 'company' && custid === '87654321') {
    res.send({
      company: {
        id: '87654321',
        taxNumber: 'XYZ880011',
        structureType: 2,
        companyName: 'At-Takafulia Assurances',
        activityField: '30',
        contactName: 'Ali Kefia',
        contactPhone: '71666777',
        contactEmail: 'ali.kefia@attakafulia.tn',
        phone: '31331800',
        fax: '71843384',
        email: 'info@attakafulia.tn',
        address: '15 RUE DE JERUSALEM LE BELVEDERE TUNIS 1002',
        postalCode: '1002',
        delegation: 'Cite El Khadra'
      }
    });
  }
  else {
    res.send({});
  }
  // }}}
}

function listSocialProfessions(req, res) {
  // {{{
  //var criterium = req.body.criterium;
  res.send([{
    id: 1,
    text: 'Catégorie 1'
  }, {
    id: 2,
    text: 'Catégorie 2'
  }, {
    id: 3,
    text: 'Catégorie 3'
  }, {
    id: 4,
    text: 'Catégorie 4'
  }, {
    id: 5,
    text: 'Catégorie 5'
  }]);
  // }}}
}

function readPerson(req, res) {
  // {{{
  var person = client.readPerson(req.body.id);
  if (person) {
    res.send(person);
  }
  else {
    res.send({
      id: req.body.id,
      inexisting: true
    });
  }
  // }}}
}

function setPerson(req, res) {
  var err = '';
  client.setPerson(req.body.person);
  if (err) {
    res.send(500, err);
  }
  else {
    res.json(null);
  }
}

function getPostalCodeAddress(req, res) {
  var postalCode = parseInt(req.body.postalCode, 10);
  var disableLocality = false;
  var longitude = 0;
  var latitude = 0;
  mongo.getZipCodesCol()
    .find({
      'zip': postalCode
    })
    .toArray(function (err, address) {
      if (err) {
        res.send(err);
      }
      else {
        disableLocality = (address.length < 2);
        if (address[0].longitude !== undefined) {
          longitude = address[0].longitude;
          latitude = address[0].latitude;
        }
        res.send({
          locality: address[0].locality,
          delegation: address[0].delegation,
          governorate: address[0].governorate,
          disableLocality: disableLocality,
          longitude: longitude,
          latitude: latitude
        });
      }
    });
}

function loadPostalList(req, res) {
  var postalList = [];
  mongo.getZipCodesCol()
    .distinct('zip', function (err, postalCodeList) {
      if (err) {
        res.send(err);
      }
      else {
        postalCodeList.sort('zip', 1);
        var j = 0;
        var postalCodeListItem;
        _.each(postalCodeList, function (item) {
          postalCodeListItem = {};
          postalCodeListItem.id = item;
          postalCodeListItem.text = item.toString();
          postalList.push(postalCodeListItem);
          j++;
        });
        res.send(postalList);
      }
    });
}

function getPostalLocality(req, res) {
  var postalCode = parseInt(req.body.postalCode, 10);
  var localityList = [];
  mongo.getZipCodesCol()
    .find({
      'zip': postalCode
    })
    .toArray(function (err, items) {
      if (err) {
        res.send(err);
      }
      else {
        var j = 0;
        var localityListItem;
        _.each(items, function (item) {
          localityListItem = {};
          localityListItem.id = j;
          localityListItem.text = item.locality;
          localityList.push(localityListItem);
          j++;
        });
        res.send(localityList);
      }
    });
}

function saveLngLat(req, res) {
  var postalCode = parseInt(req.body.postalCode, 10);
  var delegation = req.body.delegation;
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;
  mongo.getZipCodesCol()
    .update({
      'zip': postalCode,
      'delegation': delegation
    }, {
      $set: {
        longitude: longitude,
        latitude: latitude
      }
    }, {
      multi: true,
    }, function (err) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(null);
      }
    });
}

function getLngLatBase(req, res) {
  var postalCode = parseInt(req.body.postalCode, 10);
  var delegation = req.body.delegation;
  var longitude = 0;
  var latitude = 0;
  mongo.getZipCodesCol()
    .findOne({
      'zip': postalCode,
      'delegation': delegation
    }, function (err, result) {
      if (err) {
        res.send(err);
      }
      else {
        if (result.longitude !== undefined) {
          longitude = result.longitude;
          latitude = result.latitude;
        }
        res.send({
          longitude: longitude,
          latitude: latitude
        });
      }
    });
}
exports.declare = function (app) {
  app.post('/svc/actors/states', session.ensureAuth, ora.listStates ||
    listStates);
  app.post('/svc/actors/fields', session.ensureAuth, ora.listFields ||
    listFields);
  app.post('/svc/actors/professions', session.ensureAuth, ora.listProfessions ||
    listProfessions);
  app.post('/svc/actors/getclient', session.ensureAuth, ora.getClient ||
    getClient);
  app.post('/svc/actors/socialprofession', session.ensureAuth, ora.listSocialProfessions ||
    listSocialProfessions);
  app.post('/svc/actors/person/read', session.ensureAuth, ora.readPerson ||
    readPerson);
  app.post('/svc/actors/person/set', session.ensureAuth, ora.setPerson ||
    setPerson);
  app.post('/svc/actors/person/getPostalCodeAddress', session.ensureAuth,
    getPostalCodeAddress);
  app.post('/svc/actors/person/loadPostalList', session.ensureAuth,
    loadPostalList);
  app.post('/svc/actors/postalLocality', session.ensureAuth,
    getPostalLocality);
  app.post('/svc/actors/saveLngLat', session.ensureAuth, saveLngLat);
  app.post('/svc/actors/getLngLatBase', session.ensureAuth, getLngLatBase);
};
