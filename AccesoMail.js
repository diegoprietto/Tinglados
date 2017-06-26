"use strict";

var nodemailer = require('nodemailer');

var Asunto = "Consulta de Presupuesto";
var Desde = "Argentech App";
var Hacia = ""

//Se utiliza para evitar que se envíen mas de 100 en un día pudiendo ser realizados por robots
var ControlFraude = {
	Dia: null,
	Contador: 0
}

var Qux = function () {};

//Actualiza el mail de destino
Qux.prototype.actualizarMailDestino = function(mailDestino){
	Hacia = mailDestino;
}

//Envia un correo de solicitud
Qux.prototype.enviarMail = function (error, datos, callback){

	//Validar que no se envíen excesivos mails en poco tiempo
	if (ControlFraude.Dia === (new Date()).getDate()){
		ControlFraude.Contador++;

		//Verificar cantidad enviada
		if (ControlFraude.Contador > 100){
			console.log("Warning: Se han recibido demasiados mails en poco tiempo, los próximos consultar en el sitio");
			if (callback) callback();
			return;	//No enviar mail
		}
	}else{
		//Inicializar
		ControlFraude.Dia = (new Date()).getDate();
		ControlFraude.Contador = 0;
	}

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
	        if (callback) callback();
	    }
	});
}

//Envia un correo para restabler password
Qux.prototype.enviarMailRestablecer = function (error, datosMail, nuevoPassword, mailDestino, callback){

	//Validar que no se envíen excesivos mails en poco tiempo
	if (ControlFraude.Dia === (new Date()).getDate()){
		ControlFraude.Contador++;

		//Verificar cantidad enviada
		if (ControlFraude.Contador > 100){
			console.log("Warning: Se han recibido demasiados mails en poco tiempo, los próximos consultar en el sitio");
			if (callback) callback();
			return;	//No enviar mail
		}
	}else{
		//Inicializar
		ControlFraude.Dia = (new Date()).getDate();
		ControlFraude.Contador = 0;
	}

	//Crear contenido del mail
	var contenido = "<h3>Solicitud para restablecer la contraseña:</h3>\
		<h4>Se generó una nueva contraseña para el usuario solicitante, por favor acceda y proceda a cambiarla de inmediato por su seguridad:</h4>\
		<b>Clave generada:</b> " + nuevoPassword + "<br/>\
		";

	// Definir el transporter
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: datosMail.Id + '@gmail.com',
	        pass: datosMail.Pass
	    }
	});

	//Definir mail
	var mailOptions = {
	    from: Desde,
	    to: mailDestino,
	    subject: "Restablecer contraseña",
	    html: contenido
	};

	//Enviar mail
	transporter.sendMail(mailOptions, function(err, info){
	    if (err){
	        console.log(err);
	        if (error) error();
	    } else {
	        if (callback) callback();
	    }
	});
}

exports.Qux = Qux;