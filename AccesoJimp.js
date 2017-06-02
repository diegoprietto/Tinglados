"use strict";

var jimp = require("jimp");
var async = require("async");

var Qux = function () {};

//Módulo para procesamiento de imágenes
/*
	error: Función callback que se ejecuta cuando ocurre un error
	dataBase64: String de la imagen codificada
	dimension: Objeto que representa la dimensión a ajustar, ej: dimension = {x: 1200; y: 600}
	callback: Función callback que se ejecuta cuando se guarda con éxito
*/
Qux.prototype.obtenerCategorias = function (error, dataBase64, callback){

	//Quitar metadatos de una imagen base64
	function turcarMetadatosBase64(imgbase64){
	    var indice = imgbase64.indexOf(",");
	    var truncar = imgbase64.substring(indice+1, imgbase64.length);
	    return truncar;
	};

	//Función que se ejecutará en paralelo, ajusta el tamaño de imagen a la dimensión indicada
	function truncarMetadatosBase64(img, dimension, callback){
		jimp.read(Buffer.from( img , 'base64')
			, function (err, imagen) {
		    if (err){
		    	//Error
		    	console.log("Error al leer la img codificada");
		    	console.log(err);
		    	if (callback) callback(err, null);
		    }
		    else{
		    	//Achicar la imagen y obtener código Base64 de la misma
			    imagen.cover(dimension.x, dimension.y).getBase64( jimp.AUTO, function(err2, result){
				    if (err2){
				    	//Error
				    	console.log("Error al reajustar la imagen");
				    	console.log(err2);
				    	if (callback) callback(err2, null);
				    }else{

				    	//Retornar imagen reajustada en Base64
		     			if (callback) callback(null, result);
					}

				});

		    }
		});
	};

	//Se quita la parte que indica el MIME, ya que de lo contrario genera una excepción al intentar leer la imagen
	dataBase64 = turcarMetadatosBase64(dataBase64);

	//Convertir imagenes en forma paralela (Relación de aspecto 26:17)
	async.parallel([
	    function(callback) {
	        truncarMetadatosBase64(dataBase64, {x: 1200, y: 784.6153846}, callback);
	    },
	    function(callback) {
	        truncarMetadatosBase64(dataBase64, {x: 900, y: 588.4615385}, callback);
	    },
	    function(callback) {
	        truncarMetadatosBase64(dataBase64, {x: 600, y: 392.3076923}, callback);
	    },
	    function(callback) {
	        truncarMetadatosBase64(dataBase64, {x: 300, y: 196.1538462}, callback);
	    }
	],
	
	//Callback de async.parallel
	function(err, results) {
		//Verificar resultado
		if (err) {
			console.log("Error en las funciones en paralelo para procesamiento de imagen");
			console.log(err)
			if (error) error(err);
		}
		else{
			//Éxito
			if (callback) callback(results);
		}
	});

}

exports.Qux = Qux;