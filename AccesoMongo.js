"use strict";

var MongoClient = require('mongodb').MongoClient;
var MongoDb = require('mongodb');

var uri = "mongodb://dprbd:w8vdLyC0VNhkfhXm@cluster0-shard-00-00-ngi72.mongodb.net:27017,cluster0-shard-00-01-ngi72.mongodb.net:27017,cluster0-shard-00-02-ngi72.mongodb.net:27017/tinglado?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
var nombreColeccionInfo = "Info";
var nombreColeccionFoto = "Foto";
var nombreColeccionUsers = "Users";

//Memorias cachés para recursos
var cacheColeccionInfo=null;
var cacheColeccionFotoS=null;
var cacheColeccionFotoM=null;
var cacheColeccionFotoL=null;
var cacheColeccionFotoXL=null;
var cacheColeccionUsers=null;
var cacheColeccionCantFotos=null;

var Qux = function () {};

Qux.prototype.log = function () {
	console.log('Modulo AccesoMongo.js');
};

//Devuelve el texto para la información del pié de página
Qux.prototype.obtenerInfo = function (error, usarCache, admin, callback) {
	
	//Verificar si estan los datos en caché
	if (usarCache && cacheColeccionInfo){

		console.log("Acierto en caché: Colección " + nombreColeccionInfo);
		if (callback) callback(cacheColeccionInfo);

	}else{

		//Se conecta a la BD y obtiene los datos
		MongoClient.connect(uri, function(err, db) {

			if (err){
				//Ocurrió un error
				if (error) error();
			}else{
			  	//Referenciar a la colección
				var collection = db.collection(nombreColeccionInfo);

				// Find some documents
				if (admin){
					collection.find({}).toArray(function(err, docs) {

						if (err){
							//Ocurrió un error
							if (error) error();
						}else{
							console.log(docs)

							if (callback) callback(docs);
						}
					});
				}else{
					collection.find({Mostrar: "S"}).toArray(function(err, docs) {

						if (err){
							//Ocurrió un error
							if (error) error();
						}else{
							console.log(docs)
							//Actualizar caché
							cacheColeccionInfo = docs;
							db.close();
							if (callback) callback(docs);
						}
					});
				}
			}
		});

	}
}

Qux.prototype.guardarInfo = function(error, datos, callback) {

	//Conectarse a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error();
		}else{

		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccionInfo);

			//Eliminar documentos previos
			collection.drop(function(err, result) {

				if (err){
					//Ocurrió un error
					if (error) error();
				}else{

					//Insertar documentos
					collection.insertMany(
						datos,
						function(err, result) {

							if (err){
								//Ocurrió un error
								if (error) error();
							}else{
								//Éxito
								console.log("MongoDB: Colección Actualizada");

        						//Resetear caché
        						cacheColeccionInfo=null;

								db.close();
								callback(result);
							}
					});
				}


			});
		}
	});
}

Qux.prototype.guardarFoto = function(error, datos, callback) {

	var estructuraDatos = new Array();

	estructuraDatos.push(datos);

	//Conectarse a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			console.log("Error al intentar conectar a la BD para guardar fotos");
			//Ocurrió un error
			if (error) error();
		}else{

		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccionFoto);

			//Insertar documento
			collection.insertMany(
				estructuraDatos,
				function(err, result) {

					if (err){
						console.log("Error en la función insertMany de MongoDB");
						console.log(err);
						//Ocurrió un error
						if (error) error();
					}else{
						//Éxito
						console.log("MongoDB: Colección Actualizada");

						//Resetear caché
						cacheColeccionFotoS = null;
						cacheColeccionFotoM = null;
						cacheColeccionFotoL = null;
						cacheColeccionFotoXL = null;
						cacheColeccionCantFotos = null;
						//Éxito
						if (callback) callback(result);
					}
			});

		}

		db.close();
	});
}

Qux.prototype.borrarFoto = function(error, idFoto, callback) {

	var estructuraDatos = { "_id" : new MongoDb.ObjectID(idFoto) };

	//Conectarse a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error();
		}else{

		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccionFoto);

			//Insertar documento
			collection.deleteOne(
				estructuraDatos,
				function(err, result) {

					if (err){
						//Ocurrió un error
						if (error) error();
					}else{
						//Éxito
						console.log("MongoDB: Colección Actualizada");

						//Resetear caché
						cacheColeccionFotoS = null;
						cacheColeccionFotoM = null;
						cacheColeccionFotoL = null;
						cacheColeccionFotoXL = null;
						cacheColeccionCantFotos = null;

						db.close();
						callback(result);
					}
			});

		}
	});
}

Qux.prototype.obtenerFotos = function(error, anchoContenedor, callback) {

	console.log(anchoContenedor);

	var filtroTamanio;
	var cacheColeccionFotoAdecuado;
	if (anchoContenedor){
		//Buscar el tamaño adecuado de foto para la pantalla del dispositivo
		anchoContenedor= parseInt(anchoContenedor);

		if (anchoContenedor >= 900){
			filtroTamanio = {_id: 1, BinarioXL: 1};
			cacheColeccionFotoAdecuado = cacheColeccionFotoXL;
		}else if (anchoContenedor >= 600){
			filtroTamanio = {_id: 1, BinarioL: 1};
			cacheColeccionFotoAdecuado = cacheColeccionFotoL;
		}else if (anchoContenedor >= 300){
			filtroTamanio = {_id: 1, BinarioM: 1};
			cacheColeccionFotoAdecuado = cacheColeccionFotoM;
		}else{
			filtroTamanio = {_id: 1, BinarioS: 1};
			cacheColeccionFotoAdecuado = cacheColeccionFotoS;
		}

	}else{
		//Por defecto obtener las fotos de tamaño menor
		filtroTamanio = {_id: 1, BinarioS: 1};
	}

	//Verificar si estan los datos en caché
	if (cacheColeccionFotoAdecuado){

		console.log("Acierto en caché: Colección de fotos");
		if (callback) callback(cacheColeccionFotoAdecuado);

	}else{

		//Se conecta a la BD y obtiene los datos
		MongoClient.connect(uri, function(err, db) {

			if (err){
				//Ocurrió un error
				if (error) error();
			}else{
			  	//Referenciar a la colección
				var collection = db.collection(nombreColeccionFoto);

				//Obtener todos los documentos
				collection.find({},filtroTamanio).toArray(function(err, docs) {

					if (err){
						//Ocurrió un error
						if (error) error();
					}else{
						console.log(docs)

						//Actualizar caché
						if (anchoContenedor >= 900){
							cacheColeccionFotoXL = docs;
						}else if (anchoContenedor >= 600){
							cacheColeccionFotoL = docs;
						}else if (anchoContenedor >= 300){
							cacheColeccionFotoM = docs;
						}else{
							cacheColeccionFotoS = docs;
						}

						db.close();

						if (callback) callback(docs);
					}
				});
			}
		});

	}
}

//Obtener información y fotos para renderizar el home
Qux.prototype.obtenerDatosHome = function (error, callback) {

	var estructuraDatos = new Object();

	//Verificar si estan los datos en caché
	if (cacheColeccionInfo && cacheColeccionCantFotos){
		estructuraDatos.Info = cacheColeccionInfo;
		estructuraDatos.CantFotos = cacheColeccionCantFotos;

		if (callback) callback(estructuraDatos);

	}else{

		//Se conecta a la BD y para obtener todos los datos
		MongoClient.connect(uri, function(err, db) {

			if (err){
				//Ocurrió un error
				if (error) error(err);
			}else{
			  	//Referenciar a las colecciones
				var collectionInfo = db.collection(nombreColeccionInfo);
				var collectionFoto = db.collection(nombreColeccionFoto);

				// Buscar los documentos de info que tengan el flag de mostrar al usuario
				collectionInfo.find({Mostrar: "S"}).toArray(function(errI, docs) {

					if (errI){
						//Ocurrió un error
						if (error) error(errI);
					}else{
						//Actualizar caché y estructura
						cacheColeccionInfo = docs;
						estructuraDatos.Info = docs;

						//Obtener todos los documentos de Foto
						collectionFoto.count(function(errF, result) {

							if (errF){
								//Ocurrió un error
								if (error) error(errF);
							}else{
								console.log("OBTENINENDO CANTIDAD DE REGISTROS")
								console.log(result);

								//Actualizar caché y estructura
								cacheColeccionCantFotos = result;
								estructuraDatos.CantFotos = result;

								//Cerrar conexión
								db.close();

								if (callback) callback(estructuraDatos);
							}
						});

					}
				});
			}
		});

	}
}

Qux.prototype.obtenerUsuarios = function(error, callback) {

	//Verificar si estan los datos en caché
	if (cacheColeccionUsers){

		console.log("Acierto en caché: Colección " + nombreColeccionUsers);
		if (callback) callback(cacheColeccionUsers);

	}else{

		//Se conecta a la BD y obtiene los datos
		MongoClient.connect(uri, function(err, db) {

			if (err){
				//Ocurrió un error
				if (error) error();
			}else{
			  	//Referenciar a la colección
				var collection = db.collection(nombreColeccionUsers);

				//Obtener todos los documentos
				collection.find({}).toArray(function(err, docs) {

					if (err){
						//Ocurrió un error
						if (error) error();
					}else{
						console.log(docs)

						//Actualizar caché
						cacheColeccionUsers = docs;
						db.close();

						if (callback) callback(docs);
					}
				});
			}
		});

	}
}

//Llamada genérica para obtener el primer dato de una colección a indicar
Qux.prototype.obtenerPrimerDato = function(error, nombreColeccion, callback) {

	//Se conecta a la BD y obtiene los datos
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error();
		}else{
		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccion);

			//Obtener un documento
			collection.findOne({}, function(err, docs) {

				if (err){
					//Ocurrió un error
					if (error) error();
				}else{
					//Cerrar conexión
					db.close();

					if (callback) callback(docs);
				}
			});
		}
	});
}


exports.Qux = Qux;