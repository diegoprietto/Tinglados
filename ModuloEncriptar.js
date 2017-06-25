"use strict";

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

var Qux = function () {};

//Recibe un password en texto plano y lo devuelve en el callback en forma de hash
Qux.prototype.encrypt = function (text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

//Recibe un password en texto plano y en hash, por callback indica si coincide o no
Qux.prototype.decrypt = function (text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

exports.Qux = Qux;