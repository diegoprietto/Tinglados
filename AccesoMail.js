"use strict";

var nodemailer = require('nodemailer');

var Asunto = "Consulta de Presupuesto";
var Desde = "App Tinglado";
var Hacia = "dprsoft@yahoo.com.ar"

var Qux = function () {};

Qux.prototype.log = function () {
	console.log('Modulo AccesoMail.js');
};

//Envia un correo
Qux.prototype.enviarMail = function (error, datos, callback){

	//Crear contenido del mail
	var contenido = "<h3>Un usuario solicitó presupuesto en el sistema:</h3>\
		<b>Nombre:</b> " + datos.nombre + "<br/>\
		<b>Apellido:</b> " + datos.apellido + "<br/>\
		<b>Mail:</b> " + datos.mail + "<br/>\
		<b>Código de Área:</b> " + datos.telCodigo + "<br/>\
		<b>Teléfono:</b> " + datos.telNro + "<br/>\
		<b>Mensaje:</b> " + datos.mensaje + "<br/>\
		";

	// Definir el transporter
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: datos.usuarioRemitente + '@gmail.com',
	        pass: datos.passRemitente
	    }
	});

	//Definir mail
	var mailOptions = {
	    from: Desde,
	    to: Hacia,
	    subject: Asunto,
	    html: contenido
	};

	//Enviar mail
	transporter.sendMail(mailOptions, function(err, info){
	    if (err){
	        console.log(err);
	        if (error) error();
	    } else {
	        console.log("Email sent");
	        if (callback) callback();
	    }
	});
}

exports.Qux = Qux;