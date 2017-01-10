// dependencies
var http = require('http');
var pre = require('./pre');
var app = require('./app');
pre.fire()
  .then(function () {
    console.log('pre ok');
    app.fire()
      .then(function (express) {
        console.log('app ok');
        http.createServer(express)
          .listen(express.get('port'), function (err) {
            if (err) {
              console.log(err);
              process.exit(1);
            }
            console.log('server listening on ' + express.get('port'));
          });
      }, function (err) {
        console.log('app ko');
        console.log(err);
        process.exit(1);
      });
  }, function (err) {
    console.log('pre ko');
    console.log(err);
    process.exit(1);
  });
