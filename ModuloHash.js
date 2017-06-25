"use strict";

var bcrypt = require('bcrypt');

var Qux = function () {};

//Recibe un password en texto plano y lo devuelve en el callback en forma de hash
Qux.prototype.cryptPassword = function(password, callback) {
   bcrypt.genSalt(10, function(err, salt) {
    if (err) 
      return callback(err);

    bcrypt.hash(password, salt, function(err, hash) {
      return callback(null, hash);
    });

  });
};

//Recibe un password en texto plano y en hash, por callback indica si coincide o no
Qux.prototype.comparePassword = function(password, hashPassword, callback) {
   bcrypt.compare(password, hashPassword, function(err, isPasswordMatch) {
      if (err) 
        return callback(err);
      return callback(null, isPasswordMatch);
   });
};

//Recibe un password en texto plano y lo devuelve en el callback en forma de hash
Qux.prototype.cryptPasswordSync = function(password) {
  return bcrypt.hashSync(password, 10);
};

//Recibe un password en texto plano y en hash, y devuelve true si coinciden, sino false
Qux.prototype.comparePasswordSync = function(password, hashPassword) {
  return bcrypt.compareSync(password, hashPassword);
};

exports.Qux = Qux;