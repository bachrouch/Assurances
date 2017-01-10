/* vim: fdm=marker
 */
var session = require('../logic/session');
var loan = require('../logic/loan');

function _respond(error, result) {
  // {{{
  var err;
  if (error) {
    if (typeof error === 'object') {
      if (error instanceof Error) {
        err = {
          _SERVER_: error.message || error,
          _STACK_: error.stack
        };
      }
      else {
        err = error;
      }
    }
    else {
      err = {
        _SERVER_: '' + error
      };
    }
    this.send(500, err);
  }
  else {
    this.send(result);
  }
  // }}}
}

function _buildCtx(req) {
  // {{{
  return {
    user: req.session.user
  };
  // }}}
}

function requestDraft(req, res) {
  // {{{
  loan.requestDraft(req.body._id, req.body.msg, _buildCtx(req), _respond.bind(
    res));
  // }}}
}

function createDraft(req, res) {
  // {{{
  loan.createDraft(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function readDraft(req, res) {
  // {{{
  loan.readDraft(req.body._id, _buildCtx(req), _respond.bind(res));
  // }}}
}

function updateDraft(req, res) {
  // {{{
  loan.updateDraft(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function adminDraft(req, res) {
  // {{{
  loan.adminDraft(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function checkRightDraft(req, res) {
  //{{{
  loan.checkRightDraft(req.body.right, _buildCtx(req), _respond.bind(res));
  //}}}
}

function createQuote(req, res) {
  //{{{
  loan.createQuote(req.body, _buildCtx(req), _respond.bind(res));
  //}}}
}

function readQuote(req, res) {
  //{{{
  loan.readQuote(req.body.ref, _buildCtx(req), _respond.bind(res));
  //}}}
}

function searchContract(req, res) {
  //{{{
  loan.searchContract(req.body.criteria, _buildCtx(req), _respond.bind(res));
  //}}}
}

function createContract(req, res) {
  // {{{
  loan.createContract(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function readContract(req, res) {
  // {{{
  loan.readContract(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function validateContract(req, res) {
  loan.validateContract(req.body, _buildCtx(req), _respond.bind(res));
}
exports.declare = function (app) {
  app.post('/svc/loan/draft/request', session.ensureAuth, requestDraft);
  app.post('/svc/loan/draft/create', session.ensureAuth, createDraft);
  app.post('/svc/loan/draft/read', session.ensureAuth, readDraft);
  app.post('/svc/loan/draft/update', session.ensureAuth, updateDraft);
  app.post('/svc/loan/draft/admin', session.ensureAuth, adminDraft);
  app.post('/svc/loan/draft/check', session.ensureAuth, checkRightDraft);
  app.post('/svc/loan/quote/create', session.ensureAuth, createQuote);
  app.post('/svc/loan/quote/read', session.ensureAuth, readQuote);
  app.post('/svc/loan/quote/search', session.ensureAuth, searchContract);
  app.post('/svc/loan/contract/create', session.ensureAuth, createContract);
  app.post('/svc/loan/contract/read', session.ensureAuth, readContract);
  app.post('/svc/loan/contract/search', session.ensureAuth, searchContract);
  app.post('/svc/loan/contract/check', session.ensureAuth, checkRightDraft);
  app.post('/svc/loan/contract/validate', session.ensureAuth,
    validateContract);
};
