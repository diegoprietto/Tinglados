"use strict";

var fs = require('fs');
var nombreArchivo = 'data.txt';

var Qux = function () {};

//Guarda en archivo plano
/*
	error: Función callback que se ejecuta cuando ocurre un error
	data: String que se almacena en el archivo
	callback: Función callback que se ejecuta cuando se guarda con éxito
*/
Qux.prototype.almacenar = function (error, data, callback){

	fs.writeFile(nombreArchivo, data, (err) => {
		
		if (err){
			//Ocurrió un error
			if (error) error();
		}else{
			//Guardado con éxito
			callback();
		}
	});
}

//Obtiene datos del archivo plano
/*
	error: Función callback que se ejecuta cuando ocurre un error
	callback: Función callback que se ejecuta cuando se carga con éxito, se pasa los datos leídos por parámetro
*/
Qux.prototype.obtener = function (error, callback){

	fs.readFile(nombreArchivo, (err, data) => {
		
		if (err){
			//Ocurrió un error
			if (error) error();
		}else{
			//Guardado con éxito
			callback(data);
		}
	});
}

exports.Qux = Qux;