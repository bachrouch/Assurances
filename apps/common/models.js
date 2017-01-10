main.module('common', function (mod, app, Backbone, Marionette, $, _) {
  mod.Step = Backbone.Model.extend({
    defaults: {
      rank: null,
      label: null,
      active: false,
    },
    executeBefore: function (cb) {
      var self = this;
      if (this.before) {
        this.before(function () {
          Marionette.triggerMethod.call(this, 'before');
          cb.call(self);
        }, function (jqr) {
          if (!self.validationError) {
            if (jqr.responseText) {
              self.validationError = jqr.responseText;
            }
            else {
              self.validationError =
                'Errors on "before" processing';
            }
          }
          cb.call(self);
        });
      }
      else {
        Marionette.triggerMethod.call(this, 'before');
        cb.call(self);
      }
    },
    executeCheck: function (cb) {
      var self = this;
      if (this.check) {
        this.check(function () {
          Marionette.triggerMethod.call(this, 'check');
          cb.call(self);
        }, function () {
          if (!self.validationError) {
            self.validationError = 'Errors on "check" processing';
          }
          cb.call(self);
        });
      }
      else {
        Marionette.triggerMethod.call(this, 'check');
        cb.call(self);
      }
    },
    executeAfter: function (cb) {
      var self = this;
      if (this.after) {
        this.after(function () {
          Marionette.triggerMethod.call(this, 'after');
          cb.call(self);
        }, function (jqr) {
          if (!self.validationError) {
            if (jqr.responseText) {
              self.validationError = jqr.responseText;
            }
            else {
              self.validationError =
                'Errors on "after" processing';
            }
          }
          cb.call(self);
        });
      }
      else {
        Marionette.triggerMethod.call(this, 'after');
        cb.call(self);
      }
    }
  });
  mod.Steps = Backbone.Collection.extend({
    model: mod.Step,
    getStep: function (rank) {
      return this.find(function (s) {
        return s.get('rank') === rank;
      });
    },
    getActive: function () {
      return this.find(function (s) {
        return s.get('active');
      });
    },
    setActive: function (step) {
      this.each(function (s) {
        s.set('active', false);
      });
      step.set('active', true);
    }
  });
  mod.Doc = Backbone.Model.extend({
    /*
     * title: text on the button
     * doc: file name which will be downloaded
     * static: added for processing the static reports under res
     * error: filled when server request ko
     * lob: line of business will be used for calling the printing server
     * id: the identifier of the file it's a mongodb hash
     */
    urlBase: '/doc',
    hasError: function () {
      return this.get('error');
    },
    hasURL: function () {
      return !_.isEmpty(this.get('doc'));
    },
    buildURL: function () {
      if (this.get('staticdoc')) {
        return this.get('doc');
      }
      else {
        var sReturn = this.urlBase + '?' + 'doc=' + this.get('doc');
        sReturn += '&lob=' + this.get('lob');
        sReturn += '&id=' + this.get('id');
        return sReturn;
      }
    }
  });
  mod.ProcessLink = Backbone.Model.extend({
    /*
     * title: text on the button
     * processlink: link to the process
     * error: filled when server request ko
     */
    hasError: function () {
      return this.get('error');
    },
    hasURL: function () {
      return !_.isEmpty(this.get('processlink'));
    },
    buildURL: function () {
      return this.get('processlink');
    }
  });
});
