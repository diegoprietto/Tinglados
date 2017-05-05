var express = require('express');
var app = express();
////Conexión a Mongo
//var MongoClient = require('mongodb').MongoClient;

//Definición de puerto
app.set('port', (process.env.PORT || 5000));

//Archivos públicos
app.use(express.static('public'));

//Usar el paquete Pug para Templates
app.set('view engine', 'pug');

//Atributos
//var uri = "mongodb://dprbd:w8vdLyC0VNhkfhXm@cluster0-shard-00-00-ngi72.mongodb.net:27017,cluster0-shard-00-01-ngi72.mongodb.net:27017,cluster0-shard-00-02-ngi72.mongodb.net:27017/tinglado?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";

//INICIO Funciones AJAX**************************************************************************************

//Ajax: Telefono
app.get('/getTel', function(req, res){
	console.log("Acceso a función Ajax getTel");

	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ t1: '4321', t2: '-1111' }));
});

//FIN Funciones AJAX**************************************************************************************

//INICIO Funciones MongoDB**************************************************************************************

/*var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('Tinglados');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}*/

//FIN Funciones MongoDB**************************************************************************************

//INICIO Server**************************************************************************************

//Renderizar usando Pug
app.get('/', function(req, res){

	/*//Obtener info de BD
	MongoClient.connect(uri, function(err, db) {
	  	//Buscar todos los documentos
		findDocuments(db, function() {
		    db.close();
		  });
	});*/

	res.render('view');
});

//Cualquier url que no existente
app.all('/*', function (req, res) {
   res.send('Has ingresado una url inexistente!');
   console.log("Acceso a url inexistente");
})

var server = app.listen(app.get('port'), function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Servidor iniciado en http://%s:%s", host, port)
})

//FIN Server**************************************************************************************