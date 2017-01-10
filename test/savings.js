/* vim: fdm=marker
 */
var moment = require('moment');
var req = require('supertest');
var should = require('should');
var utils = require('../logic/utils');
var pre = require('../pre');
var app = require('../app');
var data = require('./data');
describe('Savings service', function () {
  var express;
  var cookie;
  var draft;
  var contract;
  before(function (done) {
    // {{{
    process.env.NODE_ENV = 'test';
    process.env.TAKAFUL_MONGO_URI = 'mongodb://localhost/takaful';
    process.env.TAKAFUL_PRINT_SRV = 'localhost';
    process.env.TAKAFUL_PRINT_PORT = 3001;
    pre.fire()
      .then(function () {
        app.fire()
          .then(function (exp) {
            express = exp;
            req(express)
              .post('/svc/connection/login')
              .set('Accept', 'application/json')
              .send(data.creds)
              .expect('Content-Type', /json/)
              .expect('set-cookie', /takaful-session=.*/)
              .expect(200)
              .end(function (err, res) {
                cookie = res.headers['set-cookie'].join(';');
                done();
              });
          }, function (error) {
            done(error || 'app ko');
          });
      }, function (error) {
        done(error || 'before ko');
      });
    // }}}
  });
  it('creates draft', function (done) {
    // {{{
    req(express)
      .post('/svc/savings/draft/create')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        draft = res.body;
        should(draft)
          .have.property('_id');
        should(draft)
          .have.property('mvts');
        should(draft)
          .have.property('sits');
        done();
      });
    // }}}
  });
  it('administrates draft', function (done) {
    // {{{
    delete draft.etag;
    delete draft.sits;
    delete draft.mvts;
    draft.admin.depIniComRate = 0;
    draft.admin.depPerComRate = [0];
    req(express)
      .post('/svc/savings/draft/admin')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .send(draft)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        should.equal(draft._id, res.body._id);
        draft = res.body;
        should.equal(draft.admin.depIniComRate, 0);
        should.deepEqual(draft.admin.depPerComRate, [0]);
        done();
      });
    // }}}
  });
  it('updates draft', function (done) {
    // {{{
    delete draft.etag;
    delete draft.sits;
    delete draft.mvts;
    var m = moment()
      .startOf('year')
      .add(1, 'year');
    draft.def = {
      effDate: utils.momentToJSON(m),
      termDate: utils.momentToJSON(m.add(10, 'year'))
    };
    draft.deposit = {
      periodic: 1000,
      period: 1,
      number: 10
    };
    draft.terms = [];
    req(express)
      .post('/svc/savings/draft/update')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .send(draft)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        draft = res.body;
        should(draft)
          .have.property('_id');
        should(draft)
          .have.property('mvts');
        should(draft)
          .have.property('sits');
        var c = 0;
        Object.keys(draft.sits)
          .sort()
          .forEach(function (y) {
            var sit = draft.sits[y];
            c = utils.roundAmount((c + draft.deposit.periodic) * (1 +
              draft.admin.depEarnRate));
            should(sit.cumul)
              .equal(c);
          });
        done();
      });
    // }}}
  });
  it('does not create contract', function (done) {
    // {{{
    delete draft.etag;
    delete draft.sits;
    delete draft.mvts;
    req(express)
      .post('/svc/savings/contract/create')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .send(draft)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        var error = res.body;
        should(error)
          .have.property('lifeBen');
        should(error)
          .have.property('deathBen');
        should(error)
          .have.property('settlements');
        done();
      });
    // }}}
  });
  it('creates contract', function (done) {
    // {{{
    delete draft.etag;
    delete draft.sits;
    delete draft.mvts;
    draft.insured.id = '12345678';
    draft.insured.firstName = 'Ali';
    draft.insured.name = 'Kefia';
    draft.insured.mobile = '58366646';
    draft.insured.email = 'ali.kefia@attakafulia.tn';
    draft.insured.job = 'Développement logiciel';
    draft.lifeBen = [{
      relation: 'self',
      id: '12345678',
      name: 'Ali Kefia',
      percent: 1
    }];
    draft.deathBen = [{
      relation: 'spouse',
      id: '23456789',
      name: 'Fatma Hamza',
      percent: 1
    }];
    draft.subscriber = {
      id: '12345678',
      gender: 'm',
      firstName: 'Ali',
      name: 'Kefia',
      mobile: '58366646',
      email: 'ali.kefia@attakafulia.tn',
      address: 'La Soukra'
    };
    draft.settlements = [{
      amount: draft.deposit.periodic + draft.admin.feesIni + draft.admin
        .feesDep,
      mode: 'cash'
    }];
    req(express)
      .post('/svc/savings/contract/create')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .send(draft)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        contract = res.body;
        should(contract.def)
          .have.property('ref');
        done();
      });
    // }}}
  });
});
