main.module('mySpace.exemption', function (mod, app, Backbone) {
  mod.CheckBtn = Backbone.Model.extend({
    defaults: function () {
      return {
        status: ''
      };
    }
  });
  mod.Request = Backbone.Model.extend({
    defaults: function () {
      return {
        msg: null,
        reference: null,
        receiptsList: new app.finance.payment.ReceiptsList()
      };
    }
  });
  mod.Act = Backbone.Model.extend({
    dateAttributes: ['date', 'actDate'],
    defaults: function () {
      return {
        actName: null,
        date: null,
        actDate: null,
        modifiedBy: null
      };
    }
  });
  mod.ActsList = Backbone.Collection.extend({
    model: mod.Act
  });
  mod.Actions = Backbone.Model.extend({
    defaults: function () {
      return {
        comments: null,
        actsList: new mod.ActsList()
      };
    }
  });
  mod.Exemption = Backbone.Model.extend({
    dateAttributes: ['creationDate', 'closingDate'],
    defaults: function () {
      return {
        reference: null,
        status: null,
        type: null,
        object: null,
        creator: null,
        creationDate: null,
        closingDate: null,
        closingUser: null,
        pos: new app.finance.payment.POS(),
        request: new mod.Request(),
        actions: new mod.Actions()
      };
    }
  });
  mod.Exemptions = Backbone.Collection.extend({
    model: mod.Exemption
  });
  mod.ExemptionCriteria = Backbone.Model.extend({
    dateAttributes: ['fromCreationDate', 'toCreationDate'],
    defaults: function () {
      return {
        pos: null,
        reference: null,
        status: null,
        fromCreationDate: null,
        toCreationDate: null,
        type: null,
        num: null
      };
    }
  });
  mod.SendExep = Backbone.Model.extend({
    defaults: function () {
      return {
        status: ''
      };
    }
  });
});
