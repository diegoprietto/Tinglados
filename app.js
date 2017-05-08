var express = require('express');
var app = express();

var Qux = require('./AccesoArchivos.js').Qux;
var qux = new Qux();

var AccesoMongo = require('./AccesoMongo.js').Qux;
var accesoMongo = new AccesoMongo();

//Definición de puerto
app.set('port', (process.env.PORT || 5000));

//Archivos públicos
app.use(express.static('public'));

//Usar el paquete Pug para Templates
app.set('view engine', 'pug');

//INICIO Funciones AJAX**************************************************************************************

//Ajax: Telefono
app.get('/getTel', function(req, res){
	console.log("Acceso a función Ajax getTel");

	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ t1: '4321', t2: '-1111' }));
});

//FIN Funciones AJAX**************************************************************************************

//INICIO Server**************************************************************************************

//Renderizar usando Pug
app.get('/', function(req, res){

  accesoMongo.obtenerInfo(null, function(data){
    res.render('view', {info: data});
  });
});

//Administración del sitio
app.get('/admin', function(req, res){
  res.render('admin');
});

//Cualquier url que no existente, redirigir a Home
app.all('/*', function (req, res) {
   console.log("Acceso a url inexistente");

   res.redirect('/');
})

var server = app.listen(app.get('port'), function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Servidor iniciado en http://%s:%s", host, port)
})

//FIN Server**************************************************************************************