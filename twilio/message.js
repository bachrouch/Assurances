//var client = require('./client');
//var logger = require('../logger/log');
var msg = {};
 
msg.sendMsg = function(to, message, callback) {
  //console.log('hiii');
  var client = require('twilio')('AC498145e701174fd5d2099ada898875ab', '2e3e917e2987ebea9db7fa8c6336ac94');
  /*
  client.sendMessage({
    to: +21653501351,
    from: '+14506667788', // your Twilio number
    body: 'Votre bulletin de soin est déjà traitée , veuillez passer chez nous pour la récupérer notre cher(e) assuré(e) , Welcome To Attakafulia Assurance .'// The body of the text message
  }, function(error, message) {
    // Log the response to DiskDB for auditing purposes
    if (error) {
     console.log('error sending message',+error);
    } else {
      console.log('sms sent succsusfully');
    }
    //callback(error, 'fdhdhhfdfh');
  });
*/
//console.log('before');
client.sendMessage({
        to: '+21653501351',
        from: '+12013807332',
        body: 'Votre bulletin de soin est déjà traitée'
  }, function(error, message) {
    }, function (err, message) {
      console.log('messages.create');
      if(err){callback(err);
      }else {
        callback();
      }
        console.log(message.sid);
    });
};
 
module.exports = msg;