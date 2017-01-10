main.module('configs.product', function (mod, app, Backbone, Marionette, $, _) {
  mod.LayoutProduct = Marionette.Layout.extend({
    template: '#configs-product-layout',
    regions: {
      criteria: '.tkf-criteria',
      actions: '.tkf-actions',
      results: '.tkf-results'
    },
    onRender: function () {
      var critMod = mod.controller.criteria;
      var products = mod.controller.products;
      this.criteria.show(new mod.SearchCriteria({
        model: critMod
      }));
      this.actions.show(new mod.ProductActions());
      this.results.show(new mod.ProductResults({
        collection: products
      }));
    }
  });
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#configs-product-search-criteria')
      .html()),
    schema: {
      contract: {
        title: 'N° Contrat',
        type: 'CustNumber'
      },
      branch: {
        title: 'Branche',
        type: 'CustSelect',
        request: 'common:branchList'
      },
      product: {
        title: 'Produit',
        type: 'CustSelect',
        request: 'common:productList',
        requestParam: 'branch'
      }
    },
    initEvents: function () {
      this.on('branch:change', function () {
        this.setValue('product', null);
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
    },
    searchProd: function () {
      $('.tkf-selected-product')
        .remove();
      $('.tkf-selected-cover')
        .remove();
      var products = mod.controller.products;
      products.reset();
      this.commit();
      app.request('configs:product:searchProd', this.model)
        .done(function (data) {
          products.fromRequest(data.products);
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="searchProd"]': 'searchProd'
    }
  });
  mod.ProductActions = Marionette.ItemView.extend({
    template: '#configs-product-action'
  });
  mod.ProductResultRow = Marionette.ItemView.extend({
    template: '#configs-product-result-row',
    tagName: 'tr',
    templateHelpers: {
      branchName: function () {
        var branch = this.branch;
        var name;
        _.each(main.common.enums.branchList, function (item) {
          if (item.id === parseInt(branch)) {
            name = item.text;
          }
        });
        return name;
      },
      statusDesc: function () {
        var status = this.status;
        if (status === 0) {
          return 'Désactivé';
        }
        if (status === 1) {
          return 'Activé';
        }
        return 'N/C';
      }
    },
    displayProdDetails: function () {
      var currentRow = this.$el.closest('tr');
      if ($('.tkf-selected-product')
        .length === 1) {
        $('.tkf-selected-product')
          .slideUp(function () {
            $('.tkf-selected-product')
              .parent()
              .remove();
            return false;
          });
      }
      else {
        var covers = mod.controller.covers;
        covers.reset();
        var newRow = '<tr><td colspan="8" ';
        newRow += 'class="tkf-selected-product">';
        newRow += '</td></tr>';
        $(newRow)
          .insertAfter(currentRow);
        var product = this.model;
        var mgr = new app.common.TransitionView({
          el: $('.tkf-selected-product')
        });
        app.request('configs:product:getDetails', product)
          .done(function (data) {
            var sCover;
            _.each(data.covers, function (item) {
              sCover = new mod.Cover();
              sCover.fromRequest(item);
              sCover.get('commissions')
                .fromRequest(item.commissions);
              covers.add(sCover);
            });
            mgr.show(new mod.ProductCovers({
              collection: covers
            }));
          })
          .fail(app.fail);
      }
    },
    configureProduct: function () {},
    events: {
      'click a[data-actions="configureProduct"]': 'configureProduct',
      'click a[data-actions="displayProdDetails"]': 'displayProdDetails'
    }
  });
  mod.ProductResults = Marionette.CompositeView.extend({
    template: '#configs-product-result-table',
    itemView: mod.ProductResultRow,
    itemViewContainer: 'tbody'
  });
  mod.ProductCoverRow = Marionette.ItemView.extend({
    template: '#configs-product-covers-row',
    tagName: 'tr',
    displayCoverComm: function () {
      var currentRow = this.$el.closest('tr');
      if ($('.tkf-selected-cover')
        .length === 1) {
        $('.tkf-selected-cover')
          .slideUp(function () {
            $('.tkf-selected-cover')
              .parent()
              .remove();
            return false;
          });
      }
      else {
        var newRow = '<tr><td colspan="4" ';
        newRow += 'class="tkf-selected-cover">';
        newRow += '</td></tr>';
        $(newRow)
          .insertAfter(currentRow);
        var cover = this.model;
        var mgr = new app.common.TransitionView({
          el: $('.tkf-selected-cover')
        });
        mgr.show(new mod.CoverCommissions({
          collection: cover.get('commissions')
        }));
      }
    },
    events: {
      'click a[data-actions="displayCoverComm"]': 'displayCoverComm'
    }
  });
  mod.ProductCovers = Marionette.CompositeView.extend({
    template: '#configs-product-covers-table',
    itemView: mod.ProductCoverRow,
    itemViewContainer: 'tbody'
  });
  mod.CoverCommissionsRow = app.common.CustForm.extend({
    template: _.template($('#configs-product-commissions-row')
      .html()),
    schema: {
      rateFormatted: {
        title: '% Commission',
        type: 'CustNumber',
        unit: '%'
      }
    },
    render: function () {
      var profile = this.model.get('profile');
      var name;
      _.each(main.common.enums.commProfileList, function (item) {
        if (item.id === profile) {
          name = item.text;
        }
      });
      this.model.set('profileName', name);
      this.model.set('prevRate', this.model.get('rateFormatted'));
      app.common.CustForm.prototype.render.apply(this, arguments);
    },
    templateData: function () {
      return this.model.toJSON();
    },
    saveNewCommission: function () {
      var self = this;
      var newRateFo = this.getValue('rateFormatted');
      var prod = this.model.get('code');
      var cov = this.model.get('cover');
      var profile = this.model.get('profile');
      var prevRate = this.model.get('prevRate');
      var setComm = {};
      setComm.rate = newRateFo / 100;
      setComm.product = prod;
      setComm.cover = cov;
      setComm.profile = profile;
      setComm.opType = 'setCommission';
      setComm.newRate = newRateFo;
      setComm.prevRate = prevRate;
      app.request('configs:product:applyCommProfileRate', setComm)
        .done(function () {
          self.model.set('prevRate', newRateFo);
        })
        .fail(app.fail);
    },
    revertOldCommission: function () {
      var self = this;
      var revRateFo = this.model.get('rateFormatted');
      var prevRate = this.model.get('prevRate');
      var prod = this.model.get('code');
      var cov = this.model.get('cover');
      var profile = this.model.get('profile');
      var setComm = {};
      setComm.rate = revRateFo / 100;
      setComm.product = prod;
      setComm.cover = cov;
      setComm.profile = profile;
      setComm.opType = 'revertCommission';
      setComm.newRate = revRateFo;
      setComm.prevRate = prevRate;
      app.request('configs:product:applyCommProfileRate', setComm)
        .done(function () {
          self.model.set('prevRate', revRateFo);
          self.setValue('rateFormatted', revRateFo);
          self.$('[name="rateFormatted"]')
            .focus();
        })
        .fail(app.fail);
    },
    events: {
      'click a[data-actions="saveNewCommission"]': 'saveNewCommission',
      'click a[data-actions="revertOldCommission"]': 'revertOldCommission'
    }
  });
  mod.CoverCommissions = Marionette.CompositeView.extend({
    template: '#configs-product-commissions-table',
    itemView: mod.CoverCommissionsRow,
    itemViewContainer: 'tbody'
  });
});
