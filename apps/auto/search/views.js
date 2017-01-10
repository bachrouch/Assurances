main.module('auto.search', function (mod, app, Backbone, Marionette, $, _) {
  mod.Layout = Marionette.Layout.extend({
    template: '#auto-search',
    regions: {
      content: '.tkf-content'
    },
    onRender: function () {
      this.content.show(new mod.SearchView());
    }
  });
  mod.SearchView = Marionette.Layout.extend({
    template: '#auto-search-view',
    regions: {
      error: '.tkf-error',
      criteria: '.tkf-criteria',
      results: '.tkf-results'
    },
    onRender: function () {
      this.criteria.show(new mod.SearchCriteria({
        model: mod.controller.criteria
      }));
      if (mod.controller.criteria.get('admin')) {
        this.results.show(new mod.AdminSearchResults({
          collection: mod.controller.policies
        }));
      }
      else {
        this.results.show(new mod.SearchResults({
          collection: mod.controller.policies
        }));
      }
    }
  });
  mod.SearchCriteria = app.common.CustForm.extend({
    template: _.template($('#auto-search-criteria')
      .html()),
    schema: {
      reference: {
        title: 'Référence',
        type: 'CustText'
      },
      vehicle: {
        title: 'Véhicule',
        type: 'CustText'
      },
      clientid: {
        title: 'CIN / RC',
        type: 'CustText'
      },
      clientname: {
        title: 'Nom',
        type: 'CustText'
      },
      effcDateFrom: {
        title: 'De',
        type: 'CustDate'
      },
      effcDateTo: {
        title: 'A',
        type: 'CustDate'
      },
      nature: {
        title: 'Nature',
        type: 'CustSelect',
        request: 'auto:contract:natures'
      },
      status: {
        title: 'Etat',
        type: 'CustSelect',
        request: 'auto:contract:statuses'
      }
    },
    search: function () {
      this.commit();
      app.request('auto:search:getData', {
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
    },
    events: {
      'click a[data-actions="search"]': 'search',
    }
  });
  mod.ResultFormRow = app.common.CustForm.extend({
    template: _.template($('#auto-search-result-row')
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
    template: '#auto-search-result-table',
    itemView: mod.ResultFormRow,
    itemViewContainer: 'tbody'
  });
  mod.AdminResultFormRow = app.common.CustForm.extend({
    template: _.template($('#auto-admin-search-result-row')
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
  mod.AdminSearchResults = Marionette.CompositeView.extend({
    template: '#auto-admin-search-result-table',
    itemView: mod.AdminResultFormRow,
    itemViewContainer: 'tbody'
  });
});
