/* vim: fdm=marker
 */
var session = require('../logic/session');
var savings = require('../logic/savings');

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
  savings.requestDraft(req.body._id, req.body.msg, _buildCtx(req), _respond.bind(
    res));
  // }}}
}

function createDraft(req, res) {
  // {{{
  savings.createDraft(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function readDraft(req, res) {
  // {{{
  savings.readDraft(req.body._id, _buildCtx(req), _respond.bind(res));
  // }}}
}

function updateDraft(req, res) {
  // {{{
  savings.updateDraft(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function adminDraft(req, res) {
  // {{{
  savings.adminDraft(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function checkRightDraft(req, res) {
  //{{{
  savings.checkRightDraft(req.body.right, _buildCtx(req), _respond.bind(res));
  //}}}
}

function createQuote(req, res) {
  //{{{
  savings.createQuote(req.body, _buildCtx(req), _respond.bind(res));
  //}}}
}

function readQuote(req, res) {
  //{{{
  savings.readQuote(req.body.ref, _buildCtx(req), _respond.bind(res));
  //}}}
}

function searchContract(req, res) {
  //{{{
  savings.searchContract(req.body.criteria, _buildCtx(req), _respond.bind(res));
  //}}}
}

function createContract(req, res) {
  // {{{
  savings.createContract(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function readContract(req, res) {
  // {{{
  savings.readContract(req.body, _buildCtx(req), _respond.bind(res));
  // }}}
}

function saveFreeDeposit(req, res) {
  //{{{
  savings.saveFreeDeposit(req.body, _buildCtx(req), _respond.bind(res));
  //}}}
}

function domiciliate(req, res) {
  savings.domiciliate(req.body, _buildCtx(req), _respond.bind(res));
}

function validateContract(req, res) {
  savings.validateContract(req.body, _buildCtx(req), _respond.bind(res));
}
exports.declare = function (app) {
  app.post('/svc/savings/draft/request', session.ensureAuth, requestDraft);
  app.post('/svc/savings/draft/create', session.ensureAuth, createDraft);
  app.post('/svc/savings/draft/read', session.ensureAuth, readDraft);
  app.post('/svc/savings/draft/update', session.ensureAuth, updateDraft);
  app.post('/svc/savings/draft/admin', session.ensureAuth, adminDraft);
  app.post('/svc/savings/draft/check', session.ensureAuth, checkRightDraft);
  app.post('/svc/savings/quote/create', session.ensureAuth, createQuote);
  app.post('/svc/savings/quote/read', session.ensureAuth, readQuote);
  app.post('/svc/savings/quote/search', session.ensureAuth, searchContract);
  app.post('/svc/savings/contract/create', session.ensureAuth, createContract);
  app.post('/svc/savings/contract/read', session.ensureAuth, readContract);
  app.post('/svc/savings/contract/saveFreeDeposit', session.ensureAuth,
    saveFreeDeposit);
  app.post('/svc/savings/contract/search', session.ensureAuth, searchContract);
  app.post('/svc/savings/contract/check', session.ensureAuth, checkRightDraft);
  app.post('/svc/savings/contract/domiciliate', session.ensureAuth,
    domiciliate);
  app.post('/svc/savings/contract/validate', session.ensureAuth,
    validateContract);
};
