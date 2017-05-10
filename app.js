var express = require('express');
var app = express();

var bodyParser = require('body-parser');

//Aumentar el límite máximo permitido del request en 50m
//Nota: Por defecto el límite es muy pequeño para permitir subir fotos
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

app.post('/GuardarInfo', function(req, res){
  console.log("Acceso a función Ajax GuardarInfo");

  console.log(req.body.content);

  var datos = req.body.content;

  if (datos){

    accesoMongo.guardarInfo(
      function () {
        console.log("Error al intentar actualizar la colección Info");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      datos,
      function (result) {
        console.log(result);

        //Enviar un flag de éxito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'OK'}));
      }
    );

  }else{
    //Sin datos de entrada
    console.log("Sin datos");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR'}));
  }
});

app.post('/GuardarFoto', function(req, res){
  console.log("Acceso a función Ajax GuardarFoto");

  console.log(req.body.content);

  var datos = req.body.content;

  if (datos){

    accesoMongo.guardarFoto(
      function () {
        console.log("Error al intentar actualizar la colección Foto");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      datos,
      function (result) {
        console.log(result);

        //Enviar un flag de éxito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'OK'}));
      }
    );

  }else{
    //Sin datos de entrada
    console.log("Sin datos");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR'}));
  }
});

app.get('/ObtenerFotos', function(req, res){
  console.log("Acceso a función Ajax ObtenerFotos");

  accesoMongo.obtenerFotos(
    function () {
      console.log("Error al intentar obtener la colección Foto");

      //Enviar un flag de Error
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'ERROR'}));
    },
    function (result) {
      console.log(result);

      //Enviar datos
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'OK', Datos: result}));
    }
  );

});

//FIN Funciones AJAX**************************************************************************************

//INICIO Server**************************************************************************************

//Renderizar usando Pug
app.get('/', function(req, res){

  accesoMongo.obtenerInfo(null, true, false, function(data){
    res.render('view', {info: data});
  });
});

//Administración del sitio
app.get('/admin', function(req, res){
  accesoMongo.obtenerInfo(null, false, true, function(data){
    res.render('admin', {info: data});
  });
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