var config = require('../config');
var session = require('../logic/session');
var request = require('request');
var email = require('../logic/email');

function download(req, res) {
  var lob = req.query.lob;
  var doc = req.query.doc;
  var id = req.query.id;
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  var url = 'http://' + printsrv + ':' + printprt;
  url += lob + '/pdf/' + id;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=' + doc + '.pdf');
  request({
    url: url,
    encoding: null,
    method: 'GET'
  }, function (err, resp, body) {
    if (err) {
      res.send(500, JSON.stringify(err));
    }
    else if (resp.statusCode === 200) {
      res.send(body);
    }
    else {
      res.send(500, JSON.stringify(body));
    }
  });
}

function generatePrint(req, res) {
  var ref = req.query.id;
  var lob = req.query.lob;
  var doc = req.query.doc;
  var printsrv = config.PRINT_SRV;
  var printprt = config.PRINT_PORT;
  // generate the doc
  request({
    url: 'http://' + printsrv + ':' + printprt + lob,
    method: 'POST',
    json: ref
  }, function (err, result, body) {
    if (err) {
      res.send(500, JSON.stringify(err));
    }
    //print the doc
    var id = body.id;
    var url = 'http://' + printsrv + ':' + printprt;
    url += lob + '/pdf/' + id;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=' + doc +
      '.pdf');
    request({
      url: url,
      encoding: null,
      method: 'GET'
    }, function (err, resp, body) {
      if (err) {
        res.send(500, JSON.stringify(err));
      }
      else if (resp.statusCode === 200) {
        if (req.query.sdemail) {
          var sender;
          sender = 'At-Takafulia<admin@takaful.tn>';
          var subject = 'Offre assurances at-takafulia';
          var msg =
            'Bonjour, \n Veuillez trouver ci-joint votre offre d\'assurances. \n Pour plus d\'informations, n\'hésitez pas à nous contacter.';
          var mel = {
            from: sender,
            to: req.query.sdemail,
            replyTo: req.session.user.email,
            subject: subject,
            text: msg,
            attachments: [{
              filename: ref + '.pdf',
              content: body
            }]
          };
          res.send(body);
          email.send(mel, function () {});
        }
        else {
          res.send(body);
        }
      }
      else {
        res.send(500, JSON.stringify(body));
      }
    });
  });
}
exports.declare = function (app) {
  app.get('/doc', session.ensureAuth, download);
  app.get('/print', session.ensureAuth, generatePrint);
};
