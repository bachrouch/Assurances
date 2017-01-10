main.module('admin.commission', function (mod, app, Backbone) {
  mod.Criteria = Backbone.Model.extend({
    dateAttributes: ['raisedFrom', 'raisedTo', 'effectiveFrom',
      'effectiveTo'
    ],
    defaults: {
      reference: null,
      pos: null,
      status: null,
      onlyIrregular: true
    }
  });
  mod.ReceiptComm = Backbone.Model.extend({
    /*
    reference: Receipt Number
    raisedDate: Receipt raised date
    effectiveDate: Receipt effective date
    pos: Point of sale
    status: Commission status for receipt
    link: Link to check receipt page
    product: product code
    */
    dateAttributes: ['effectiveDate', 'raisedDate', 'toDate'],
    defaults: function () {
      return {
        consultlink: new app.common.ProcessLink({
          title: 'Consulter'
        })
      };
    }
  });
  mod.ReceiptsComm = Backbone.Collection.extend({
    model: mod.ReceiptComm
  });
  mod.PosSummaryModel = Backbone.Model.extend({
    /*
    code: Pos code
    name: Pos name
    activityStart: Date of first subscribed contract
    accreditDate: Date of the accredititation
    currentProfile: Name of current profile
    transcodedTo: Code of pos used for transfert
    */
    dateAttributes: ['activityStart', 'accreditDate', 'activityEnd'],
    defaults: {
      code: null,
      name: null,
      transcodedTo: null
    }
  });
  mod.AuditSingleHistory = Backbone.Model.extend({
    /*
    name: Username of the action
    date: Date of the action
    action: Description of the action
    */
    dateAttributes: ['date']
  });
  mod.AuditHistory = Backbone.Collection.extend({
    model: mod.AuditSingleHistory
  });
  mod.AuditSingleCover = Backbone.Model.extend({
    /*
    code: Cover code
    amount: Net amount of the cover
    commission: Receipt commission
    calcCommission: Recalculated commission
    */
  });
  mod.AuditCoverages = Backbone.Collection.extend({
    model: mod.AuditSingleCover
  });
  mod.AuditAction = Backbone.Model.extend({
    defaults: {
      identifiedUser: null,
      identifiedComments: null,
      identified: false,
      transferredUser: null,
      transferredComments: null,
      transferred: false,
      requestUser: null,
      requestComments: null,
      requested: false,
      fixedUser: null,
      fixedComments: null,
      fixed: false
    }
  });
});
