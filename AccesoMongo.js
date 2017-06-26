"use strict";

var MongoClient = require('mongodb').MongoClient;
var MongoDb = require('mongodb');
var async = require("async");

var uri = "";
var nombreColeccionInfo = "Info";
var nombreColeccionFoto = "Foto";
var nombreColeccionUsers = "Users";
var nombreColeccionSolicitudes = "Solicitudes";
var nombreColeccionDatosMail = "Mail";
var nombreColeccionVisitas = "Visitas";

//Memorias cachés para recursos
var cacheColeccionInfo=null;
var cacheColeccionFotoS=null;
var cacheColeccionFotoM=null;
var cacheColeccionFotoL=null;
var cacheColeccionFotoXL=null;
var cacheColeccionUsers=null;
var cacheColeccionCantFotos=null;

var Qux = function () {};

Qux.prototype.asignarUri = function (cadena){
	uri = cadena;
}

//Devuelve el texto para la información del pié de página
Qux.prototype.obtenerInfo = function (error, usarCache, admin, callback) {
	
	//Verificar si estan los datos en caché
	if (usarCache && cacheColeccionInfo){

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

							if (callback) callback(docs);
						}
					});
				}else{
					collection.find({Mostrar: "S"}).toArray(function(err, docs) {

						if (err){
							//Ocurrió un error
							if (error) error();
						}else{
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

Qux.prototype.obtenerUsuarios = function(error, fnDesencriptar,callback) {

	//Verificar si estan los datos en caché
	if (cacheColeccionUsers){

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

						//Desencriptar datos sensibles
						for (var i=0; i < docs.length; i++){
							if (docs[i].Id = fnDesencriptar(docs[i].Id));
							if (docs[i].Mail = fnDesencriptar(docs[i].Mail));
						}

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
Qux.prototype.obtenerPrimerDato = function(error, nombreColeccion, fnDesencriptar, callback) {

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

					//Desencriptar datos sensibles
					if (docs.Id) docs.Id = fnDesencriptar(docs.Id);
					if (docs.Pass) docs.Pass = fnDesencriptar(docs.Pass);
					if (docs.MailDestino) docs.MailDestino = fnDesencriptar(docs.MailDestino);

					if (callback) callback(docs);
				}
			});
		}
	});
}

//Almacenamiento de solicitud de presupuesto por parte del usuario
Qux.prototype.guardarSolicitud = function(error, datos, callback) {

	//Conectarse a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error();
		}else{

		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccionSolicitudes);
			var nuevoRegistro = convertDatosToSolicitudes(datos);


			//Insertar documentos
			collection.insertMany(
				[nuevoRegistro],
				function(err, result) {

					if (err){
						//Ocurrió un error
						if (error) error();
					}else{
						//Éxito

						db.close();
						callback(result);
					}
			});

		}
	});
}

//Convierte datos entrantes a la estructura adecuada para la colección Solicitudes
function convertDatosToSolicitudes(datosEntrada){
	var estructura = {
		Fecha: new Date(),
		Nombre: datosEntrada.nombre,
		Apellido: datosEntrada.apellido,
		Mail: datosEntrada.mail,
		TelCodigo: datosEntrada.telCodigo,
		TelNro: datosEntrada.telNro,
		Mensaje: datosEntrada.mensaje,
		VistoUsuarios: []
	}

	return estructura;
}

//Obtener registros de Solicitudes de Presupuesto
Qux.prototype.obtenerSolicitudes = function(error, fnDesencriptar, callback) {

	//Se conecta a la BD y obtiene los datos
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error(err);
		}else{
		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccionSolicitudes);

			//Obtener todos los documentos
			collection.find({}).sort({Fecha:-1}).toArray(function(err, docs) {

				if (err){
					//Ocurrió un error
					if (error) error();
				}else{

					//Desencriptar datos sensibles
					for (var i=0; i < docs.length; i++){
			          if (docs[i].Nombre) docs[i].Nombre = fnDesencriptar(docs[i].Nombre);
			          if (docs[i].Apellido) docs[i].Apellido = fnDesencriptar(docs[i].Apellido);
			          if (docs[i].Mail) docs[i].Mail = fnDesencriptar(docs[i].Mail);
			          if (docs[i].TelNro) docs[i].TelNro = fnDesencriptar(docs[i].TelNro);
					}

					db.close();

					if (callback) callback(docs);
				}
			});
		}
	});
}

//Actualizar las solicitudes vistas indicadas con el usuario indicado
Qux.prototype.ActualizarSolicitudesVistas = function(error, usuario, listaIds, callback){

	//Se conecta a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error(err);
		}else{
		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccionSolicitudes);

			//Obtener y actualizar cada uno de los ids

			for (var i=0; i<listaIds.length; i++){
				collection.findOne({ "_id" : new MongoDb.ObjectID(listaIds[i]) }, function(err, doc) {

					if (err){
						//Ocurrió un error
						console.log("Error al intentar actualizar la solicitud " + listaIds[i]);
					}else{

						//Actualizar valor
						doc.VistoUsuarios.push(usuario);

						//Guardar en la BD actualizado
						collection.save(doc, function(err, doc) {

							if (err){
								//Ocurrió un error
								console.log("Error al intentar actualizar la solicitud " + listaIds[i]);
							}
						});
					}

				});

			}
		}
	});
}

//Actualizar las solicitudes vistas indicadas con el usuario indicado
Qux.prototype.ActualizarDatosUsuario = function(error, usuario, datos, callback){

	//Se conecta a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error(err);
		}else{

		    //Actualizar 2 colecciones BD en paralelo
		    async.parallel([
		        function(callback) {

					//Verificar si se debe actualizar datos del usuario
					if (datos && (datos.pass || datos.mail)){
						//Referenciar a la colección
						var collection = db.collection(nombreColeccionUsers);

						collection.findOne({ "Id" : usuario }, function(err, doc) {

							if (err){
								//Ocurrió un error
								console.log("Error al buscar el usuario " + usuario + " en la colección " + nombreColeccionUsers);
								//Indicar error
				                callback("Error al buscar el usuario " + usuario + " en la colección " + nombreColeccionUsers, null);

							}else if(doc){

								//Actualizar valores
								if (datos.pass) doc.Pass = datos.pass;
								if (datos.mail) doc.Mail = datos.mail;

								//Guardar en la BD actualizado
								collection.save(doc, function(err, doc) {

									if (err){
										//Ocurrió un error
										console.log("Error al intentar actualizar los datos de usuario");
										//Indicar error
						                callback("Error al intentar actualizar los datos de usuario", null);
									}else{
										//Actualizado con éxito

										cacheColeccionUsers=null;
										//No hay datos para actualizar en esta colección, indicar éxito
						                callback(null, "Registro actualizado con éxito");
									}
								});
							}else{
								//Ocurrió un error
								console.log("No se encontró el usuario " + usuario + " en la colección " + nombreColeccionUsers);
								//Indicar error
				                callback("No se encontró el usuario " + usuario + " en la colección " + nombreColeccionUsers, null);
							}

						});
					}else{
						//No hay datos para actualizar en esta colección, indicar éxito
		                callback(null, "Sin datos");
					}
		        },
		        function(callback) {

					//Verificar si se debe actualizar datos para el mail
					if (datos && datos.mailDestino){
						//Referenciar a la colección
						var collection = db.collection(nombreColeccionDatosMail);

						collection.findOne({}, function(err, doc) {

							if (err){
								//Ocurrió un error
								console.log("Error al buscar los datos para NodeMailer en la colección " + nombreColeccionDatosMail);
								//Indicar error
				                callback("Error al buscar los datos para NodeMailer en la colección " + nombreColeccionDatosMail, null);
							}else if(doc){

								//Actualizar valores
								doc.MailDestino = datos.mailDestino;

								//Guardar en la BD actualizado
								collection.save(doc, function(err, doc) {

									if (err){
										//Ocurrió un error
										console.log("Error al intentar actualizar los datos de NodeMailer");
										//Indicar error
						                callback("Error al intentar actualizar los datos de NodeMailer", null);
									}else{
										//Actualizado con éxito

										//No hay datos para actualizar en esta colección, indicar éxito
						                callback(null, "Registro actualizado con éxito");
									}
								});
							}else{
								//Ocurrió un error
								console.log("No se encontraron los datos para NodeMailer en la colección " + nombreColeccionDatosMail);
								//Indicar error
				                callback("No se encontraron los datos para NodeMailer en la colección " + nombreColeccionDatosMail, null);
							}

						});
					}else{
						//No hay datos para actualizar en esta colección, indicar éxito

		                callback(null, "Sin datos");
					}

		        }
		    ],
		    // Parallel callback
		    function(err, results) {
		      //Verificar resultado
		      if (err) {
		        console.log("Error en las funciones en paralelo para actualizar datos de usuario");
		        console.log(err)

		        if (error) error(err);
		      }
		      else{
		        //Éxito

		        if (callback) callback(results);
		      }
		    });

		}
	});
}

//Almacenamiento de visita de usuario
Qux.prototype.InsertarVisita = function(error, registro, callback) {

	//Conectarse a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error(err);
		}else{

		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccionVisitas);

			//Insertar documento
			collection.insertMany(
				[registro],
				function(err, result) {

					if (err){
						//Ocurrió un error
						if (error) error(err);
					}else{
						//Éxito

						db.close();
						if (callback) callback(result);
					}
			});

		}
	});
}


//Devuelve la colección completa indicada, con el fin de generar una exportación de todos los datos
Qux.prototype.generarDatosExportacion = function (error, idColeccion, callback) {

	//Verificar la colección
	var nombreColeccion = null;

	switch(idColeccion){
		case "I":
			nombreColeccion = nombreColeccionInfo;
			break;
		case "F":
			nombreColeccion = nombreColeccionFoto;
			break;
		case "U":
			nombreColeccion = nombreColeccionUsers;
			break;
		case "M":
			nombreColeccion = nombreColeccionDatosMail;
			break;
		case "S":
			nombreColeccion = nombreColeccionSolicitudes;
			break;
		case "V":
			nombreColeccion = nombreColeccionVisitas;
			break;
		default:
			//Entrada no válida
			console.log("generarDatosExportacion: Entrada no válida '" + idColeccion + "'");
			if (error) error("Entrada no válida");

			return;
	}

	//Se conecta a la BD y obtiene los datos
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error(err);
		}else{
		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccion);

			//Traer todos los datos
			collection.find({}).toArray(function(err, docs) {

				if (err){
					//Ocurrió un error
					if (error) error(err);
				}else{

					if (callback) callback(docs);
				}
			});

		}
	});
}

//Función genérica para actualizar algún registro (Update)
Qux.prototype.actualizarRegistro = function(error, nombreColeccion, jsonFiltro, jsonUpdate, callback) {

	//Conectarse a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
			//Ocurrió un error
			if (error) error(err);
		}else{

		  	//Referenciar a la colección
			var collection = db.collection(nombreColeccion);

			collection.updateOne(
				jsonFiltro,
			    {$set: jsonUpdate},
			    {},
			    function(err2, result) {

			    	//Verificar resultado de la actualización
					if (err){
						//Ocurrió un error
						if (error) error(err);
					}else{
						//Éxito
						if (callback) callback(result);
					}

				    db.close();
			  	}
		  	);
		}
	});
}

//Borrar caché de usuario
Qux.prototype.borrarCacheUsers = function() {
	cacheColeccionUsers=null;
}

exports.Qux = Qux;