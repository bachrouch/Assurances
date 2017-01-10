main.module('common', function (mod, app, Backbone, Marionette, $, _) {
  mod.addInitializer(function () {
    _._isEqual = _.isEqual;
    _.mixin({
      isEqual: function (a, b) {
        return _._isEqual(a, b) || (_.isDate(a) && _.isDate(b) &&
          a.getTime() === b.getTime());
      },
      isEqualAmounts: function (a, b) {
        var result = false;
        a = Number(a.toFixed(3));
        b = Number(b.toFixed(3));
        var diff = a - b;
        diff = Number(diff.toFixed(3));
        if (diff === 0) {
          result = true;
        }
        return result;
      },
      fixNumber: function (num, precision) {
        return Number(num.toFixed(precision));
      },
      beautifyAmount: function (num, withoutUnit) {
        if (_.isUndefined(num) || _.isNull(num) || _.isNaN(num)) {
          return 'N/A';
        }
        else {
          var unit = '';
          if (!withoutUnit) {
            unit = ' DT';
          }
          return $.number(num, 3, ',', ' ') + unit;
        }
      },
      beautifyPercent: function (num) {
        if (_.isUndefined(num) || _.isNull(num) || _.isNaN(num)) {
          return 'N/A';
        }
        else {
          return $.number(num, 1, '.') + '%';
        }
      },
      beautifyDate: function (date) {
        if (_.isUndefined(date) || _.isNull(date)) {
          return '--/--/----';
        }
        else {
          if (_.isDate(date)) {
            return moment(date)
              .format('L');
          }
          else {
            throw new Error('bad date format');
          }
        }
      },
      beautifyDuration: function (from, to) {
        if (_.isUndefined(from) || _.isNull(from) || _.isUndefined(
            to) || _.isNull(to)) {
          return 'N/A';
        }
        else {
          if (_.isDate(from) && _.isDate(to)) {
            return moment.duration(to.getTime() - from.getTime())
              .humanize();
          }
          else {
            throw new Error('bad date format');
          }
        }
      },
      updateStatus: function (status) {
        if (status === 0) {
          return 'Brouillon';
        }
        else if (status === 1) {
          return 'Clôturé';
        }
        else if (status === 2) {
          return 'Accepté';
        }
        else if (status === 3) {
          return 'En instance';
        }
        else if (status === 4) {
          return 'Rejeté';
        }
        else if (status === 5) {
          return 'Erroné';
        }
        else if (status === 6) {
          return 'Liquidé';
        }
        else {
          return status;
        }
      },
      updateExemptionStatus: function (status) {
        if (status === 0) {
          return 'Non Traité';
        }
        else if (status === 1) {
          return 'Accepté';
        }
        else if (status === 2) {
          return 'Rejeté';
        }
        else {
          return status;
        }
      },
      updateExemptionType: function (type) {
        if (type === 0) {
          return 'Automobile';
        }
        else if (type === 1) {
          return 'Feuille de Caisse';
        }
        else {
          return type;
        }
      },
      updateIdType: function (type) {
        if (type === 'CIN') {
          return 'Carte d\'identité nationale';
        }
        else if (type === 'PASS') {
          return 'Passeport';
        }
        else if (type === 'CAS') {
          return 'Carte de séjour';
        }
        else {
          return type;
        }
      },
      updateSettlementMode: function (mode) {
        if (mode === 0 || mode === 'transfer') {
          return 'Virement';
        }
        else if (mode === 1 || mode === 'cash' || mode ===
          'deposit') {
          return 'Espèces/Versement';
        }
        else if (mode === 2 || mode === 'check') {
          return 'Chèque';
        }
        else if (mode === 3 || mode === 'promissory') {
          return 'Traite';
        }
        else if (mode === 4) {
          return 'Perte et profit';
        }
        else if (mode === 5) {
          return 'Prélèvement sur salaire';
        }
        else if (mode === 6) {
          return 'Prélèvement bancaire';
        }
      },
      checkObjectTree: function (obj, key) {
        return key.split('.')
          .reduce(function (o, x) {
            return (typeof o === 'undefined' || o === null) ? o :
              o[x];
          }, obj);
      }
    });

    function flatten(obj) {
      var newObj = {};
      _.each(obj, function (v, k) {
        if (!_.isObject(v)) {
          newObj[k] = v;
        }
      });
      return newObj;
    }

    function fromRequest(obj, modelProxy) {
      obj = flatten(obj);
      if (modelProxy && modelProxy.dateAttributes) {
        _.each(modelProxy.dateAttributes, function (attr) {
          var d = obj[attr];
          if (d) {
            if (_.isString(d)) {
              obj[attr] = moment(d, 'YYYY-MM-DD')
                .toDate();
            }
            else {
              delete obj[attr];
            }
          }
        });
      }
      return obj;
    }

    function toRequest(obj, modelProxy) {
      if (modelProxy && modelProxy.dateAttributes) {
        _.each(modelProxy.dateAttributes, function (attr) {
          var d = obj[attr];
          if (d) {
            if (_.isDate(d)) {
              obj[attr] = moment(d)
                .format('YYYY-MM-DD');
            }
            else {
              delete obj[attr];
            }
          }
        });
      }
      return flatten(obj);
    }
    Backbone.Model.prototype.toRequest = function () {
      return toRequest(this.toJSON(), this);
    };
    Backbone.Model.prototype.fromRequest = function (obj) {
      this.set(fromRequest(obj, this));
    };
    Backbone.Collection.prototype.fromRequest = function (arr) {
      var modelProto = this.model.prototype;
      this.reset(_.map(arr, function (obj) {
        return fromRequest(obj, modelProto);
      }));
    };
    Backbone.Collection.prototype.toRequest = function () {
      var modelProto = this.model.prototype;
      return this.map(function (obj) {
        return toRequest(obj.toJSON(), modelProto);
      });
    };
    mod.post = function (url, data) {
      return $.ajax(url, {
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(data),
        dataType: 'json'
      });
    };
    app.fail = function (jqr) {
      var dialog = new app.common.DiagView({
        el: '#modal'
      });
      dialog.setTitle('Erreur');
      var err = new Backbone.Model();
      err.validationError = jqr.responseText;
      var alt = new mod.ErrorView({
        model: err
      });
      dialog.show(alt);
    };
    mod.initEnums = function (callback) {
      var self = this;
      this.enums = {};
      var forSync = 17;
      $.post('/svc/common/banklist', function (data) {
        self.enums.banks = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/paymentStatus', function (data) {
        self.enums.paymentStatus = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/exemptionStatus', function (data) {
        self.enums.exemptionStatus = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/exemptionType', function (data) {
        self.enums.exemptionType = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/auto/getIdTypes', function (data) {
        self.enums.getIdTypes = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/settlementMode', function (data) {
        self.enums.settlementMode = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/posList', function (data) {
        self.enums.posList = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/travelTypes', function (data) {
        self.enums.travelTypes = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/termStatus', function (data) {
        self.enums.termStatus = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/paybackStatus', function (data) {
        self.enums.paybackStatus = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/irregStatus', function (data) {
        self.enums.irregStatus = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/irregNature', function (data) {
        self.enums.irregNature = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/coverReference', function (data) {
        self.enums.coverReference = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/branchList', function (data) {
        self.enums.branchList = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/productList', function (data) {
        self.enums.productList = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/common/commProfileList', function (data) {
        self.enums.commProfileList = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
      $.post('/svc/auto/getListOfCountries', function (data) {
        self.enums.countryList = data;
        forSync--;
        if (forSync === 0) {
          callback();
        }
      });
    };
    mod.initRules = function (callback) {
      var self = this;
      this.appRules = {};
      $.post('/svc/common/getConfigUtils', function (data) {
        _.each(data, function (item) {
          self.appRules[item.name] = item.params;
        });
        callback();
      });
    };
    mod.destroyEnums = function (callback) {
      delete this.enums;
      delete this.appRules;
      callback();
    };
  });
});
