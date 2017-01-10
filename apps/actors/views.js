/* globals google */
main.module('actors', function (mod, app, Backbone, Marionette, $, _) {
  mod.PersonFormAndMap = Marionette.Layout.extend({
    template: '#actors-person-form-and-map',
    regions: {
      personalInformation: '.tkf-personForm',
      mapsTemplateRegion: '.tkf-mapsTemplate'
    },
    renderPage: function () {
      var personFormDetail = new mod.PersonForm({
        model: this.model
      });
      var templateGoogleMaps = new mod.mapTemplate({
        model: this.model
      });
      this.personalInformation.show(personFormDetail);
      this.mapsTemplateRegion.show(templateGoogleMaps);
    },
    onShow: function () {
      this.renderPage();
    }
  });
  mod.PersonForm = app.common.CustForm.extend({
    template: _.template($('#actors-person-form')
      .html()),
    schema: {
      id: {
        title: 'Numéro d\'identité nationale',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      gender: {
        title: 'Titre',
        type: 'CustSelect',
        data: 'actors:person:genders',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      firstName: {
        title: 'Prénom',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      lastName: {
        title: 'Nom',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      birthDate: {
        title: 'Date de naissance',
        type: 'CustDate',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      socialprofession: {
        title: 'Catégorie socioprofessionnelle',
        type: 'CustSelect',
        request: 'actors:socialprofession',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      phone1: {
        title: 'Téléphone',
        type: 'CustText',
        dataType: 'tel',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      email1: {
        title: 'Email personnel',
        type: 'CustText',
        dataType: 'email',
        validators: ['email', 'required'],
        disabler: {
          lockcontrols: true
        }
      },
      licenceNumber: {
        title: 'Numéro permis de conduire',
        type: 'CustText',
        disabler: {
          lockcontrols: true
        }
      },
      licenceDate: {
        title: 'Date obtention permis',
        type: 'CustText',
        disabler: {
          lockcontrols: true
        }
      },
      address: {
        title: 'Adresse principale',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      postalCode: {
        title: 'Code postal',
        type: 'CustSelect',
        data: 'actors:postalListDisplay',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      locality: {
        title: 'Localité',
        type: 'CustSelect',
        request: 'actors:getLocality',
        requestParam: 'postalCode'
      }
    },
    templateData: function () {
      return this.model.toJSON();
    },
    initEvents: function () {
      var self = this;
      this.disable('locality', true);
      this.on('postalCode:set', function () {
        var postalCode = self.getValue('postalCode');
        if (!self.model.get('fromClient')) {
          app.request('actors:getPostalCodeAddress', postalCode)
            .done(function (data) {
              self.$('[data-values="delegation"]')
                .text(data.delegation);
              self.$('[data-values="governorate"]')
                .text(data.governorate);
              self.model.set('delegation', data.delegation);
              self.model.set('governorate', data.governorate);
              self.model.set('postalCode', postalCode);
              self.setValue('locality', data.locality);
              self.disable('locality', data.disableLocality);
            })
            .fail(app.fail);
        }
        else {
          self.disable('locality', false);
          self.setValue('locality', self.model.get('locality'));
        }
      });
      this.listenTo(this.model, 'change', function () {
        this.setValue(this.model.attributes);
        this.trigger('commit');
      });
      this.on('id:set', function () {
        app.request('actors:getclient', {
            custtype: 'person',
            custid: this.getValue('id')
          })
          .done(function (data) {
            if (!_.isEmpty(data.person)) {
              self.model.set('fromClient', true);
              self.setValue(data.person);
              self.model.fromRequest(data.person);
              self.model.set('fromClient', false);
            }
          })
          .fail(app.fail);
      });
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('id', true);
          this.disable('gender', true);
          this.disable('firstName', true);
          this.disable('lastName', true);
          this.disable('birthDate', true);
          this.disable('socialprofession', true);
          this.disable('phone1', true);
          this.disable('email1', true);
          this.disable('address', true);
          this.disable('licenceNumber', true);
          this.disable('licenceDate', true);
          this.disable('postalCode', true);
        }
        else {
          this.disable('id', false);
          this.disable('gender', false);
          this.disable('firstName', false);
          this.disable('lastName', false);
          this.disable('birthDate', false);
          this.disable('socialprofession', false);
          this.disable('phone1', false);
          this.disable('email1', false);
          this.disable('address', false);
          this.disable('licenceNumber', false);
          this.disable('licenceDate', false);
          this.disable('postalCode', false);
        }
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
      }, this), 0);
      return this;
    },
  });
  mod.CompanyFormAndMap = Marionette.Layout.extend({
    template: '#actors-company-form-and-map',
    regions: {
      companyInformation: '.tkf-companyForm',
      mapsTemplateRegion: '.tkf-mapsTemplate'
    },
    renderPage: function () {
      var companyFormDetail = new mod.CompanyForm({
        model: this.model
      });
      var templateGoogleMaps = new mod.mapTemplate({
        model: this.model
      });
      this.companyInformation.show(companyFormDetail);
      this.mapsTemplateRegion.show(templateGoogleMaps);
    },
    onRender: function () {
      this.renderPage();
    }
  });
  mod.CompanyForm = app.common.CustForm.extend({
    template: _.template($('#actors-company-form')
      .html()),
    schema: {
      id: {
        title: 'Registre de commerce',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      companyName: {
        title: 'Raison sociale',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      activityField: {
        title: 'Secteur d\'activité',
        type: 'CustSelect',
        request: 'actors:fields',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      contactName: {
        title: 'Nom du contact',
        type: 'CustText',
        disabler: {
          lockcontrols: true
        }
      },
      contactPhone: {
        title: 'Téléphone du contact',
        type: 'CustText',
        dataType: 'tel',
        disabler: {
          lockcontrols: true
        }
      },
      contactEmail: {
        title: 'Email du contact',
        type: 'CustText',
        dataType: 'email',
        validators: ['email'],
        disabler: {
          lockcontrols: true
        }
      },
      phone: {
        title: 'Téléphone',
        type: 'CustText',
        dataType: 'tel',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      fax: {
        title: 'Fax',
        type: 'CustText',
        dataType: 'tel',
        disabler: {
          lockcontrols: true
        }
      },
      email: {
        title: 'Email',
        type: 'CustText',
        dataType: 'email',
        validators: ['email', 'required'],
        disabler: {
          lockcontrols: true
        }
      },
      address: {
        title: 'Adresse principale',
        type: 'CustText',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      postalCode: {
        title: 'Code postal',
        type: 'CustSelect',
        data: 'actors:postalListDisplay',
        validators: ['required'],
        disabler: {
          lockcontrols: true
        }
      },
      locality: {
        title: 'Localité',
        type: 'CustSelect',
        request: 'actors:getLocality',
        requestParam: 'postalCode'
      }
    },
    initEvents: function () {
      var self = this;
      this.disable('locality', true);
      this.on('postalCode:set', function () {
        var postalCode = self.getValue('postalCode');
        app.request('actors:getPostalCodeAddress', postalCode)
          .done(function (data) {
            self.$('[data-values="delegation"]')
              .text(data.delegation);
            self.$('[data-values="governorate"]')
              .text(data.governorate);
            self.model.set('delegation', data.delegation);
            self.model.set('governorate', data.governorate);
            self.model.set('postalCode', postalCode);
            self.setValue('locality', data.locality);
          })
          .fail(app.fail);
      });
      self.on('id:set', function () {
        app.request('actors:getclient', {
            custtype: 'company',
            custid: this.getValue('id')
          })
          .done(function (data) {
            if (!_.isEmpty(data.company)) {
              self.model.fromRequest(data.company);
              self.setValue(self.model.toJSON());
            }
          })
          .fail(app.fail);
      });
      this.listenTo(this.model, 'change', function () {
        this.setValue(this.model.attributes);
      });
      this.listenTo(this.model, 'change:lockcontrols', function () {
        if (this.model.get('lockcontrols')) {
          this.disable('id', true);
          this.disable('companyName', true);
          this.disable('activityField', true);
          this.disable('contactName', true);
          this.disable('contactPhone', true);
          this.disable('contactEmail', true);
          this.disable('phone', true);
          this.disable('fax', true);
          this.disable('email', true);
          this.disable('address', true);
          this.disable('postalCode', true);
        }
        else {
          this.disable('id', false);
          this.disable('companyName', false);
          this.disable('activityField', false);
          this.disable('contactName', false);
          this.disable('contactPhone', false);
          this.disable('contactEmail', false);
          this.disable('phone', false);
          this.disable('fax', false);
          this.disable('email', false);
          this.disable('address', false);
          this.disable('postalCode', false);
        }
      });
    },
    templateData: function () {
      return this.model.toJSON();
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      setTimeout(_.bind(function () {
        this.initEvents();
      }, this), 0);
      return this;
    }
  });
  mod.mapTemplate = Marionette.ItemView.extend({
    template: '#actors-map-template',
    displayMap: function () {
      var mapProp = this.model.get('mapProp');
      this.$el.addClass('temporaryTemplate');
      $('body')
        .append(this.$el);
      this.map = new google.maps.Map(this.$el.find('.map-canvas')[0],
        mapProp);
      this.model.set('map', this.map);
      this.$el.remove();
      this.$el.removeClass('temporaryTemplate');
    },
    getLngLat: function (postalCode, delegation, governorate) {
      var map = this.model.get('map');
      var geocoder = new google.maps.Geocoder();
      var marker;
      var longitude;
      var latitude;
      var address = postalCode + ', ' + delegation + ', ' +
        governorate;
      geocoder.geocode({
        'address': address
      }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(17);
          latitude = results[0].geometry.location.lat();
          longitude = results[0].geometry.location.lng();
          marker = new google.maps.Marker({
            title: address,
            map: map,
            position: results[0].geometry.location
          });
        }
        else {
          var geocoder = new google.maps.Geocoder();
          address = postalCode + ', ' + governorate + ', Tunisie';
          geocoder.geocode({
            'address': address
          }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              map.setCenter(results[0].geometry.location);
              map.setZoom(17);
              latitude = results[0].geometry.location.lat();
              longitude = results[0].geometry.location.lng();
              marker = new google.maps.Marker({
                title: address,
                map: map,
                position: results[0].geometry.location
              });
            }
          });
        }
        var infowindow = new google.maps.InfoWindow({
          content: '<strong>' + address + '</strong><br/>' +
            'Latitude: ' + latitude + '<br/>Longitude: ' +
            longitude
        });
        infowindow.open(map, marker);
        app.request('actors:saveLngLat', {
            postalCode: postalCode,
            delegation: delegation,
            longitude: longitude,
            latitude: latitude
          })
          .done(app.done)
          .fail(app.fail);
      });
    },
    updateMap: function (postalCode, delegation, governorate) {
      var longitude = 0;
      var latitude = 0;
      var self = this;
      app.request('actors:getLngLatBase', {
          postalCode: postalCode,
          delegation: delegation
        })
        .done(function (data) {
          longitude = data.longitude;
          latitude = data.latitude;
          if (longitude === 0 && latitude === 0) {
            self.getLngLat(postalCode, delegation, governorate);
          }
          else {
            var address = postalCode + ', ' + delegation + ', ' +
              governorate;
            var map = self.model.get('map');
            var center = new google.maps.LatLng(latitude, longitude);
            map.setZoom(17);
            map.setCenter(center);
            var marker = new google.maps.Marker({
              title: address,
              map: map,
              position: center
            });
            var infowindow = new google.maps.InfoWindow({
              content: '<strong>' + address + '</strong><br/>' +
                'Latitude: ' + latitude + '<br/>Longitude: ' +
                longitude
            });
            infowindow.open(map, marker);
          }
        })
        .fail(app.fail);
    },
    render: function () {
      this.$el.html(_.template($('#actors-map-template')
        .html()));
      this.displayMap();
      this.listenTo(this.model, 'change:postalCode', function () {
        var postalCode = this.model.get('postalCode');
        var delegation = this.model.get('delegation');
        var governorate = this.model.get('governorate');
        this.updateMap(postalCode, delegation, governorate);
      });
    }
  });
  mod.PersonConsult = Marionette.ItemView.extend({
    template: '#actors-person-consult',
    templateHelpers: {
      fullName: function () {
        return this.firstName + ' ' + this.lastName;
      }
    }
  });
  mod.CompanyConsult = Marionette.ItemView.extend({
    template: '#actors-company-consult'
  });
  mod.PersonInsuredForm = app.common.CustForm.extend({
    template: _.template($('#actors-person-insured-form')
      .html()),
    schema: {
      id: {
        title: 'Numéro d\'identité nationale',
        type: 'CustText',
        validators: ['required']
      },
      gender: {
        title: 'Titre',
        type: 'CustSelect',
        data: 'actors:person:genders'
      },
      firstName: {
        title: 'Prénom',
        type: 'CustText',
        validators: ['required']
      },
      lastName: {
        title: 'Nom',
        type: 'CustText',
        validators: ['required']
      },
      licenceNumber: {
        title: 'Numéro permis de conduire',
        type: 'CustText'
      },
      licenceDate: {
        title: 'Date obtention permis',
        type: 'CustDate'
      }
    }
  });
  mod.CompanyInsuredForm = app.common.CustForm.extend({
    template: _.template($('#actors-company-insured-form')
      .html()),
    schema: {
      id: {
        title: 'Registre de commerce',
        type: 'CustText',
        validators: ['required']
      },
      companyName: {
        title: 'Raison sociale',
        type: 'CustText',
        validators: ['required']
      }
    }
  });
});
