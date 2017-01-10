main.module('assistance.search', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#assistance-search',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.SearchView());
    }
  });
  mod.SearchView = Marionette.Layout.extend({
    template: '#assistance-search-view',
    regions: {
      error: '.tkf-error',
      criteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.criteria,
        parent: this
      }));
      this.results.show(new mod.SearchResults({
        collection: mod.controller.policies
      }));
    }
  });
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#assistance-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      country: {
        title: 'Pays',
        type: 'CustText'
      },
      subsDateFrom: {
        title: 'De',
        type: 'CustDate'
      },
      subsDateTo: {
        title: 'A',
        type: 'CustDate'
      },
      effcDateFrom: {
        title: 'De',
        type: 'CustDate'
      },
      effcDateTo: {
        title: 'A',
        type: 'CustDate'
      },
      clientname: {
        title: 'Nom',
        type: 'CustText'
      },
      clientid: {
        title: 'CIN / RC',
        type: 'CustText'
      }
    },
    search: function () {
      var error = this.commit();
      if (!error) {
        app.request('assistance:search:getData', {
            searchcriteria: this.model
          })
          .done(function (data) {
            mod.controller.policies.reset();
            _.each(data, function (item) {
              var policy = new mod.PolicySummary();
              policy.fromRequest(item);
              var consultlink = policy.get('consultlink');
              consultlink.fromRequest(item.consultlink);
              mod.controller.policies.add(policy);
            });
          })
          .fail(app.fail);
      }
      else {
        app.alert(error);
      }
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#assistance-search-result-row')
      .html()),
    templateData: function () {
      return this.model.toJSON();
    },
    initialize: function () {
      app.common.CustForm.prototype.initialize.apply(this, arguments);
      this.consultLink = new app.common.LinkView({
        model: this.model.get('consultlink')
      });
    },
    render: function () {
      app.common.CustForm.prototype.render.apply(this, arguments);
      this.$('[data-actions="consult"]')
        .append(this.consultLink.render()
          .el);
    }
  });
  mod.SearchResults = Marionette.CompositeView.extend({
    template: '#assistance-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
});
