/* vim: fdm=marker
 */
var req = require('supertest');
var should = require('should');
var pre = require('../pre');
var app = require('../app');
var data = require('./data');
describe('Connection', function () {
  var express;
  var cookie;
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
            done();
          }, function (error) {
            done(error || 'app ko');
          });
      }, function (error) {
        done(error || 'before ko');
      });
    // }}}
  });
  it('refuses login', function (done) {
    // {{{
    req(express)
      .post('/svc/connection/login')
      .set('Accept', 'application/json')
      .send(data.badCreds)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        should(res.body)
          .have.property('error');
        done();
      });
    // }}}
  });
  it('accepts login', function (done) {
    // {{{
    req(express)
      .post('/svc/connection/login')
      .set('Accept', 'application/json')
      .send(data.creds)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect('set-cookie', /takaful-session=.*/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        should(res.headers)
          .have.property('set-cookie');
        cookie = res.headers['set-cookie'].join(';');
        done();
      });
    // }}}
  });
  it('refuses logout', function (done) {
    // {{{
    req(express)
      .post('/svc/connection/logout')
      .set('Accept', 'application/json')
      .expect(500)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        should(res.body)
          .have.property('error');
        done();
      });
    // }}}
  });
  it('accepts logout', function (done) {
    // {{{
    req(express)
      .post('/svc/connection/logout')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) {
          done((res && res.body) || err);
          return;
        }
        should(res.body)
          .property('ok', true);
        done();
      });
    // }}}
  });
});
