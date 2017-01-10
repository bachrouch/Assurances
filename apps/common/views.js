/* globals bootbox */
main.module('common', function (mod, app, Backbone, Marionette, $, _) {
  mod.CustForm = Backbone.Form.extend({
    flush: function () {
      this.model.set(this.getValue());
    },
    commit: function () {
      delete this.model.validationError;
      var err = Backbone.Form.prototype.commit.call(this, {
        validate: true
      });
      if (err && !this.model.validationError) {
        if (err._others) {
          this.model.validationError = err._others;
        }
        else {
          this.model.validationError =
            'Certains champs ne sont pas valides';
        }
      }
      return err;
    },
    initialize: function () {
      Backbone.Form.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'commit', function () {
        this.commit();
      });
      this.listenTo(this.model, 'flush', function () {
        this.flush();
      });
    },
    disable: function (key, dis) {
      this.fields[key].disable(dis);
    },
    setError: function (key, message) {
      this.fields[key].setError(message);
    }
  });
  Backbone.Form.Field.errorClassName = 'has-error';
  Backbone.Form.Field.template = _.template($('#common-field')
    .html());
  Backbone.Form.Field.prototype.disable = function (dis) {
    if (this.editor) {
      this.editor.disable(dis);
    }
  };
  Backbone.Form.validators.errMessages.required = 'Champs obligatoire';
  Backbone.Form.validators.errMessages.regex = 'Champs invalide';
  Backbone.Form.validators.errMessages.email = 'Format email non respecté';
  Backbone.Form.validators.errMessages.url = 'Format url non respecté';
  Backbone.Form.validators.errMessages.match = _.template(
    'Doit correspondre à <%= field %>', null, Backbone.Form.templateSettings
  );
  Backbone.Form.validators.min = function (options) {
    if (!(options.field || options.value)) {
      throw new Error('Missing field for min validation');
    }
    return function (value) {
      if (value === null || value === undefined || value === '') {
        return;
      }
      var min;
      if (options.field) {
        min = this.model.get(options.field);
      }
      else {
        min = options.value;
      }
      var message;
      if (!min) {
        return;
      }
      else {
        if (_.isDate(min)) {
          message = 'Doit être >= ' + moment(min)
            .format('DD/MM/YYYY');
        }
        else {
          message = 'Doit être >= ' + min;
        }
      }
      if (value < min) {
        return {
          type: options.type,
          message: message
        };
      }
    };
  };
  Backbone.Form.validators.max = function (options) {
    if (!(options.field || options.value)) {
      throw new Error('Missing field for max validation');
    }
    return function (value) {
      if (value === null || value === undefined || value === '') {
        return;
      }
      var max;
      if (options.field) {
        max = this.model.get(options.field);
      }
      else {
        max = options.value;
      }
      var message;
      if (!max) {
        return;
      }
      else {
        if (_.isDate(max)) {
          message = 'Doit être <= ' + moment(max)
            .format('DD/MM/YYYY');
        }
        else {
          message = 'Doit être <= ' + max;
        }
      }
      if (value > max) {
        return {
          type: options.type,
          message: message
        };
      }
    };
  };
  var validatorExt = {
    getValidator: function () {
      var val = Backbone.Form.editors.Base.prototype.getValidator.apply(
        this, arguments);
      return _.bind(val, this);
    },
    validate: function () {
      var error = null,
        value = this.getValue(),
        formValues = this.form ? this.form.getValue() : {},
        validators = this.validators;
      if (validators) {
        _.every(validators, function (validator) {
          error = this.getValidator(validator)(value, formValues);
          return error ? false : true;
        }, this);
      }
      return error;
    }
  };
  var disablingExt = {
    manageDisableOnInit: function () {
      var disabler = this.schema.disabler || {};

      function onChange() {
        var dis = false;
        _.each(disabler, function (v, f) {
          var value;
          var field = this.form.fields[f];
          if (field) {
            value = field.getValue();
          }
          else {
            value = this.model.get(f);
          }
          if (!_.isUndefined(value) && value === v) {
            dis = true;
          }
        }, this);
        this.disable(dis);
      }
      _.each(disabler, function (v, f) {
        this.listenTo(this.form, f + ':change', onChange);
      }, this);
    },
    manageDisableOnRender: function () {
      var disabler = this.schema.disabler || {};
      var dis = false;
      _.each(disabler, function (v, f) {
        var value = this.model.get(f);
        if (!_.isUndefined(value) && value === v) {
          dis = true;
        }
      }, this);
      this.disable(dis);
    }
  };
  var autoActionExt = {
    manageAutoCommit: function () {
      var f = function () {
        var field = this.form.fields[this.key];
        if (field) {
          var error = field.validate();
          if (!error) {
            field.commit();
          }
          else {
            this.model.validationError = error.message;
          }
        }
      };
      if (this.schema.commitOnChange) {
        this.on('change', f);
      }
      else if (this.schema.commitOnSet) {
        this.on('set', f);
      }
    },
    manageAutoCheck: function () {
      var f = function () {
        var field = this.form.fields[this.key];
        if (field) {
          field.validate();
        }
      };
      if (this.schema.checkOnChange) {
        this.on('change', f);
      }
      else if (this.schema.checkOnSet) {
        this.on('set', f);
      }
    }
  };
  Backbone.Form.editors.CustCheckbox = Backbone.Form.editors.Checkbox.extend(
    _.extend(validatorExt, disablingExt, autoActionExt, {
      /*
       * Features
       * - commitOnChange/commitOnSet => auto save value to model
       * - checkOnChange/checkOnSet => auto save value to model
       * - disable => link aspect to var from the same model
       */
      disable: function (dis) {
        if (dis) {
          this.$el.attr('disabled', '');
        }
        else {
          this.$el.removeAttr('disabled');
        }
      },
      initialize: function () {
        Backbone.Form.editors.Checkbox.prototype.initialize.apply(
          this, arguments);
        this.on('change', function () {
          this.trigger('set', this);
        });
        this.manageAutoCommit();
        this.manageAutoCheck();
        this.manageDisableOnInit();
      },
      render: function () {
        Backbone.Form.editors.Checkbox.prototype.render.apply(this,
          arguments);
        this.manageDisableOnRender();
        return this;
      }
    }));
  Backbone.Form.editors.CustText = Backbone.Form.editors.Text.extend(_.extend(
    validatorExt, disablingExt, autoActionExt, {
      /*
       * Features
       * - title => place holder
       * - commitOnChange/commitOnSet => auto save value to model
       * - checkOnChange/checkOnSet => auto save value to model
       * - disable => link aspect to var from the same model
       */
      className: 'form-control',
      disable: function (dis) {
        if (dis) {
          this.$el.attr('disabled', '');
        }
        else {
          this.$el.removeAttr('disabled');
        }
      },
      initialize: function () {
        Backbone.Form.editors.Text.prototype.initialize.apply(this,
          arguments);
        this.on('blur', function () {
          this.trigger('set', this);
        });
        if (this.schema.title) {
          this.$el.attr('placeHolder', this.schema.title);
        }
        this.manageAutoCommit();
        this.manageAutoCheck();
        this.manageDisableOnInit();
      },
      render: function () {
        Backbone.Form.editors.Text.prototype.render.call(this);
        this.manageDisableOnRender();
        return this;
      }
    }));
  // Backbone.Form.editors.CustArea = Backbone.Form.editors.Text.extend(_.extend(
  //   validatorExt, disablingExt, autoActionExt, {
  //     /*
  //      * Features
  //      * - title => place holder
  //      * - commitOnChange/commitOnSet => auto save value to model
  //      * - checkOnChange/checkOnSet => auto save value to model
  //      * - disable => link aspect to var from the same model
  //      */
  //     className: 'form-control',
  //     disable: function (dis) {
  //       if (dis) {
  //         this.$el.attr('disabled', '');
  //       }
  //       else {
  //         this.$el.removeAttr('disabled');
  //       }
  //     },
  //     initialize: function () {
  //       Backbone.Form.editors.TextArea.prototype.initialize.apply(this,
  //         arguments);
  //       if (this.schema.title) {
  //         this.$el.attr('placeHolder', this.schema.title);
  //       }
  //     },
  //     render: function () {
  //       Backbone.Form.editors.Text.prototype.render.call(this);
  //     }
  //   }));
  Backbone.Form.editors.CustNumber = Backbone.Form.editors.Number.extend(_.extend(
    validatorExt, disablingExt, autoActionExt, {
      /*
       * Features
       * - title => place holder
       * - commitOnChange/commitOnSet => auto save value to model
       * - checkOnChange/checkOnSet => auto save value to model
       * - disable => link aspect to var from the same model
       * - unit => used to describe num values
       */
      defaultValue: '',
      className: 'form-control',
      setCrudeValue: function (formattedValue) {
        // nothing to do since trailing unit is removed by parseFloat
        this.setValue(formattedValue);
      },
      onStartEdit: function () {
        this.setCrudeValue(this.getValue());
      },
      formatTemplate: _.template('<%= quantity %> <%= unit %>'),
      setFormattedValue: function (crudeValue) {
        var v;
        if (_.isNumber(crudeValue)) {
          v = crudeValue;
        }
        else if (_.isString(crudeValue) && crudeValue) {
          v = parseFloat(crudeValue, 10);
        }
        else {
          v = null;
        }
        if (_.isNaN(v)) {
          v = null;
        }
        if (!_.isNull(v)) {
          Backbone.Form.editors.Text.prototype.setValue.call(this,
            this.formatTemplate({
              quantity: v,
              unit: this.schema.unit
            }));
        }
      },
      onFinishEdit: function () {
        this.setFormattedValue(this.getValue());
      },
      disable: function (dis) {
        if (dis) {
          this.$el.attr('disabled', '');
        }
        else {
          this.$el.removeAttr('disabled');
        }
      },
      initialize: function () {
        Backbone.Form.editors.Text.prototype.initialize.apply(this,
          arguments);
        this.on('blur', function () {
          this.trigger('set', this);
        });
        if (this.schema.title) {
          this.$el.attr('placeHolder', this.schema.title);
        }
        this.manageAutoCommit();
        this.manageAutoCheck();
        this.manageDisableOnInit();
        if (this.schema.unit) {
          this.on('focus', this.onStartEdit);
          this.on('blur', this.onFinishEdit);
        }
      },
      render: function () {
        if (this.schema.unit) {
          this.setFormattedValue(this.value);
        }
        else {
          this.setValue(this.value);
        }
        this.manageDisableOnRender();
        return this;
      },
      onKeyPress: function (event) {
        var self = this,
          delayedDetermineChange = function () {
            setTimeout(function () {
              self.determineChange();
            }, 0);
          };
        //Allow backspace
        if (event.charCode === 0) {
          delayedDetermineChange();
          return;
        }
        //Get the whole new value so that we can prevent things like double decimals points etc.
        var newVal = this.$el.val();
        if (event.charCode !== undefined) {
          newVal = newVal + String.fromCharCode(event.charCode);
        }
        var numeric = /^-?[0-9]*\.?[0-9]*?$/.test(newVal);
        if (numeric) {
          delayedDetermineChange();
        }
        else {
          event.preventDefault();
        }
      },
    }));
  Backbone.Form.editors.CustDate = Backbone.Form.editors.Text.extend(_.extend(
    validatorExt, disablingExt, autoActionExt, {
      /*
       * Features
       * - title => place holder
       * - commitOnChange/commitOnSet => auto save value to model
       * - checkOnChange/checkOnSet => auto save value to model
       * - disable => link aspect to var from the same model
       */
      className: 'form-control',
      disable: function (dis) {
        if (dis) {
          this.$el.attr('disabled', '');
        }
        else {
          this.$el.removeAttr('disabled');
        }
      },
      initialize: function () {
        Backbone.Form.editors.Text.prototype.initialize.apply(this,
          arguments);
        var self = this;
        this.config = this.schema.config || {};
        _.extend(this.config, {
          format: 'L',
          firstDay: 1,
          i18n: {
            previousMonth: 'Mois précédent',
            nextMonth: 'Mois suivant',
            months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai',
              'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre',
              'Novembre', 'Décembre'
            ],
            weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi',
              'Jeudi', 'Vendredi', 'Samedi'
            ],
            weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu',
              'Ven', 'Sam'
            ]
          },
          onSelect: function () {
            self.trigger('change', this);
          }
        });
        this.on('change', function () {
          this.trigger('set', this);
        });
        if (this.schema.title) {
          this.$el.attr('placeHolder', this.schema.title);
        }
        this.manageDisableOnInit();
      },
      render: function () {
        setTimeout(_.bind(function () {
          this.$el.pikaday(this.config);
          this.manageDisableOnRender();
          this.setValue(this.value);
        }, this), 0);
        return this;
      },
      getValue: function () {
        return this.$el.data('pikaday')
          .getDate();
      },
      setValue: function (value) {
        if (value === null) {
          this.$el.val('');
        }
        else {
          this.$el.data('pikaday')
            .setDate(value);
        }
      }
    }));
  Backbone.Form.editors.CustSelect = Backbone.Form.editors.Base.extend(_.extend(
    validatorExt, disablingExt, autoActionExt, {
      /*
       * Features
       * - title => place holder
       * - commitOnChange/commitOnSet => auto save value to model
       * - checkOnChange/checkOnSet => auto save value to model
       * - disable => link aspect to var from the same model
       * - minInput => minimum input length
       * - request => app.request to get values
       * - requestParam => model field to send to request
       */
      tagName: 'input',
      className: 'form-control',
      disable: function (dis) {
        if (dis) {
          this.$el.select2('disable', dis);
        }
        else {
          this.$el.select2('enable', !dis);
        }
      },
      initialize: function () {
        Backbone.Form.editors.Base.prototype.initialize.apply(this,
          arguments);
        this.on('change', function () {
          this.trigger('set', this);
        });
        this.$el.attr('type', 'hidden');
        this.config = this.schema.config || {};
        if (this.schema.title) {
          this.config.placeholder = this.schema.title;
        }
        if (this.schema.multiple) {
          this.config.multiple = 'multiple';
        }
        this.$el.on('change', _.bind(function () {
          this.trigger('change', this);
        }, this));
        this.manageAutoCommit();
        this.manageAutoCheck();
        this.manageDisableOnInit();
        if (!this.schema.validators || !_.contains(this.schema.validators,
            'required')) {
          this.config.allowClear = true;
        }
        if (this.schema.minInput) {
          this.config.minimumInputLength = this.schema.minInput;
        }
        if (this.schema.data) {
          if (_.isString(this.schema.data)) {
            var config = this.config;
            var cb = function (data) {
              config.data = data;
            };
            app.execute(this.schema.data, cb);
          }
          else if (_.isArray(this.schema.data)) {
            this.config.data = this.schema.data;
          }
          else {
            app.execute('error', 'Select data type not OK');
          }
        }
        if (this.schema.request) {
          this.config.query = _.bind(function (q) {
            var d;
            if (this.schema.requestParam) {
              var v;
              var field = this.form.fields[this.schema.requestParam];
              if (field) {
                v = field.getValue();
              }
              else {
                v = this.model.get(this.schema.requestParam);
              }
              d = app.request(this.schema.request, v, q.term);
            }
            else {
              d = app.request(this.schema.request, q.term);
            }
            d.done(function (data) {
              q.callback({
                results: data
              });
            });
            d.fail(function () {
              q.callback({
                results: []
              });
            });
          }, this);
          this.config.initSelection = _.bind(function (element,
            callback) {
            var self = this;
            this.config.query({
              term: element.val(),
              callback: function (res) {
                if (self.schema.multiple) {
                  callback(res.results);
                }
                else {
                  callback(res.results[0]);
                }
              }
            });
          }, this);
        }
      },
      render: function () {
        setTimeout(_.bind(function () {
          this.$el.select2(this.config);
          this.manageDisableOnRender();
          this.setValue(this.value);
        }, this), 0);
        return this;
      },
      getValue: function () {
        return this.$el.select2('val');
      },
      setValue: function (value) {
        this.$el.select2('val', value);
      }
    }));
  mod.ErrorView = Marionette.ItemView.extend({
    template: '#common-error',
    className: 'alert alert-danger',
    templateHelpers: function () {
      return {
        validationError: this.model.validationError
      };
    }
  });
  mod.StepView = Marionette.Layout.extend({
    constructor: function () {
      Marionette.Layout.prototype.constructor.apply(this, arguments);
      this.addRegions({
        error: '.tkf-error'
      });
      this.on('render', function () {
        this.refreshError();
      });
    },
    refreshError: function () {
      if (this.model.validationError) {
        this.error.show(new mod.ErrorView({
          model: this.model
        }));
      }
      else {
        this.error.close();
      }
    }
  });
  mod.DocView = Backbone.View.extend({
    tagName: 'a',
    className: 'btn btn-block',
    renderTitle: function () {
      this.$el.text(this.model.get('title'));
    },
    disable: function (disable) {
      if (disable) {
        this.$el.addClass('disabled');
      }
      else {
        this.$el.removeClass('btn-default');
        this.$el.addClass('btn-success');
        this.$el.removeClass('disabled');
      }
    },
    renderError: function (error) {
      if (error) {
        this.$el.removeClass('btn-default');
        this.$el.addClass('btn-danger');
      }
      else {
        this.$el.removeClass('btn-danger');
        this.$el.addClass('btn-default');
      }
    },
    renderURL: function (url) {
      if (url) {
        this.$el.attr('href', this.model.buildURL());
        this.$el.attr('target', '_blank');
      }
      else {
        this.$el.removeAttr('href');
        this.$el.removeAttr('target');
      }
    },
    modelChanged: function () {
      if (this.model.hasError()) {
        this.renderError(true);
        this.disable(true);
      }
      else {
        this.renderError(false);
        if (this.model.hasURL()) {
          this.renderURL(true);
          this.disable(false);
        }
        else {
          this.renderURL(false);
          this.disable(true);
        }
      }
    },
    initialize: function () {
      this.listenTo(this.model, 'change', function () {
        this.modelChanged();
      });
    },
    render: function () {
      this.renderTitle();
      this.modelChanged();
      return this;
    }
  });
  mod.LinkView = Backbone.View.extend({
    tagName: 'a',
    className: 'btn btn-block',
    renderTitle: function () {
      this.$el.text(this.model.get('title'));
    },
    disable: function (disable) {
      var checkStat = this.model.get('stats');
      if (disable) {
        this.$el.addClass('disabled');
      }
      else {
        this.$el.removeClass('btn-default');
        if (checkStat === false) {
          this.$el.addClass('btn-warning');
        }
        else {
          this.$el.addClass('btn-success');
        }
        this.$el.removeClass('disabled');
      }
    },
    renderError: function (error) {
      if (error) {
        this.$el.removeClass('btn-default');
        this.$el.addClass('btn-danger');
      }
      else {
        this.$el.removeClass('btn-danger');
        this.$el.addClass('btn-default');
      }
    },
    renderURL: function (url) {
      if (url) {
        this.$el.attr('href', this.model.buildURL());
      }
      else {
        this.$el.removeAttr('href');
      }
    },
    modelChanged: function () {
      if (this.model.hasError()) {
        this.renderError(true);
        this.disable(true);
      }
      else {
        this.renderError(false);
        if (this.model.hasURL()) {
          this.renderURL(true);
          this.disable(false);
        }
        else {
          this.renderURL(false);
          this.disable(true);
        }
      }
    },
    initialize: function () {
      this.listenTo(this.model, 'change', function () {
        this.modelChanged();
      });
    },
    render: function () {
      this.renderTitle();
      this.modelChanged();
      return this;
    }
  });
  mod.DialogBody = Marionette.ItemView.extend({
    template: '#common-dialog-body'
  });
  mod.DiagView = Marionette.Region.extend({
    constructor: function () {
      Marionette.Region.prototype.constructor.apply(this, arguments);
      this.ensureEl();
      this.$el.on('hidden', {
        region: this
      }, function (event) {
        event.data.region.close();
      });
    },
    setTitle: function (title) {
      this.title = title;
    },
    onShow: function (par) {
      if (!par.buttons) {
        if (!_.isUndefined(par.closeButton)) {
          bootbox.dialog({
            title: this.title,
            message: par.$el[0].innerHTML,
            closeButton: par.closeButton
          });
        }
        else {
          bootbox.dialog({
            title: this.title,
            message: par.$el[0].innerHTML
          });
        }
      }
      else {
        if (!_.isUndefined(par.closeButton)) {
          bootbox.dialog({
            title: this.title,
            message: par.$el[0].innerHTML,
            buttons: par.buttons,
            closeButton: par.closeButton
          });
        }
        else {
          bootbox.dialog({
            title: this.title,
            message: par.$el[0].innerHTML,
            buttons: par.buttons
          });
        }
      }
    }
  });
  mod.TransitionView = Marionette.Region.extend({
    constructor: function () {
      Marionette.Region.prototype.constructor.apply(this, arguments);
      this.ensureEl();
      this.$el.on('hidden', {
        region: this
      }, function (event) {
        event.data.region.close();
      });
    },
    onRender: function () {
      this.$el.slideDown();
    }
  });
});
