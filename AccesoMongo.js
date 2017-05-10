var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://dprbd:w8vdLyC0VNhkfhXm@cluster0-shard-00-00-ngi72.mongodb.net:27017,cluster0-shard-00-01-ngi72.mongodb.net:27017,cluster0-shard-00-02-ngi72.mongodb.net:27017/tinglado?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
var nombreColeccionInfo = "Info";
var nombreColeccionFoto = "Foto";

//Memorias cachés para recursos
var cacheColeccionInfo=null;
var cacheColeccionFoto=null;

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

	estructuraDatos.push(
		{
			Binario: datos
		}
	);

	//Conectarse a la BD
	MongoClient.connect(uri, function(err, db) {

		if (err){
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
						//Ocurrió un error
						if (error) error();
					}else{
						//Éxito
						console.log("MongoDB: Colección Actualizada");

						//Resetear caché
						cacheColeccionFoto=null;

						db.close();
						callback(result);
					}
			});

		}
	});
}

Qux.prototype.obtenerFotos = function(error, callback) {

	//Verificar si estan los datos en caché
	if (cacheColeccionFoto){

		console.log("Acierto en caché: Colección " + cacheColeccionFoto);
		if (callback) callback(cacheColeccionFoto);

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
				collection.find({}).toArray(function(err, docs) {

					if (err){
						//Ocurrió un error
						if (error) error();
					}else{
						console.log(docs)
						
						//Actualizar caché
						cacheColeccionFoto = docs;
						db.close();

						if (callback) callback(docs);
					}
				});
			}
		});

	}
}

exports.Qux = Qux;