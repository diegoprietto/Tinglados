"use strict";

var express = require('express');
var app = express();

var bodyParser = require('body-parser');

//Aumentar el límite máximo permitido del request en 50m
//Nota: Por defecto el límite es muy pequeño para permitir subir fotos
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

var AccesoMongo = require('./AccesoMongo.js').Qux;
var accesoMongo = new AccesoMongo();

var AccesoMail = require('./AccesoMail.js').Qux;
var accesoMail = new AccesoMail();

//Guardar datos en sesiones
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());
app.use(session({secret: "Datos de Sesion"}));

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
    res.send(JSON.stringify({ t1: '11-', t2: '6468-6615' }));
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
        res.send(JSON.stringify({ Resultado: 'OK', Info: result}));
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

app.post('/BorrarFoto', function(req, res){
  console.log("Acceso a función Ajax BorrarFoto");

  console.log(req.body.content);

  var idFoto = req.body.content;

  if (idFoto){

    accesoMongo.borrarFoto(
      function () {
        console.log("Error al intentar actualizar la colección Foto");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      idFoto,
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

app.post('/Contacto', function(req, res){
  console.log("Acceso a función Ajax Contacto");

  console.log(req.body.content);

  var datos = req.body.content;

  //Si hay datos, enviar correo
  if (datos){
    datos.usuarioRemitente = datosMail.Id;
    datos.passRemitente = datosMail.Pass;

    accesoMail.enviarMail(
      function () {
        console.log("Error al intentar enviar mail");
        console.log(datos);

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

app.post('/login', function(req, res){
    console.log("Acceso a función Ajax login");
    console.log(req.body.content);

    var datos = req.body.content;

    if(!datos || !datos.id || !datos.pass){
        console.log("No se recibieron las credenciales");
        //Enviar un flag de error de autenticación
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'INCOMPLETE'}));
    }
    else{

      accesoMongo.obtenerUsuarios(
        function () {
          console.log("Error al intentar obtener la colección Users");

          //Enviar un flag de Error
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({ Resultado: 'ERROR'}));
        },
        function (result) {
          console.log(result);

          var encontrado = false;
          for(var i=0; i<result.length; i++){
            if (result[i].Id.toLowerCase() === datos.id.toLowerCase() && result[i].Pass === datos.pass){
              req.session.user = result[i];
              encontrado = true;
              console.log("LOGIN CORRECTO");
              break;
            }
          }

          if (encontrado){
              //Enviar un flag de Ok
              res.setHeader('Content-Type', 'application/json');
              res.send(JSON.stringify({ Resultado: 'OK'}));
          }else{
            //Enviar un flag de error de autenticación
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ Resultado: 'NOTFIND'}));
          }


        }
      );
    }
});

//FIN Funciones AJAX**************************************************************************************



//INICIO Definición URL**************************************************************************************

//Renderizar usando Pug
app.get('/', function(req, res){
  var sesionCerrada = false;
  var cargarDatosBD = true;

  //Verificar parámetros
  console.log("req.query:");
  console.log(req.query);
  if (req.query.action && req.query.action === "logout" && req.session){
    //Cerrar sesión
    sesionCerrada = true;
    req.session.destroy();
  }

  //Verificar si cargar o no las fotos y datos
  if (req.query.datosbd && req.query.datosbd === "no")
    cargarDatosBD = false;

  if (cargarDatosBD){
    //Obtener datos de la BD
    accesoMongo.obtenerDatosHome(
      function(error){
        //Error, pasar datos en blanco
        var estructuraDatos = {
          Info: [],
          Foto: [],
          Admin: esAdmin(req,sesionCerrada)
        }

        res.render('view', {Recursos: estructuraDatos});
      },
      function(data){
        //Renderizar con los datos obtenidos
        data.Admin = esAdmin(req,sesionCerrada);
        res.render('view', {Recursos: data});
      }
    );
  }else{
    //Opción de carga ligera, no traer datos de la BD
    var estructuraDatos = {
      Info: [],
      Foto: [],
      Admin: esAdmin(req,sesionCerrada)
    }

    res.render('view', {Recursos: estructuraDatos});
  }

});

//Determina a partir de los datos de sesión si se tiene permiso de administrador del sitio
function esAdmin(req, sesionCerrada){
  if (sesionCerrada){
    return true;
  }else if(req && req.session && req.session.user){
    return true;
  }else{
    return false;
  }
}

//Administración del sitio
app.get('/admin', checkSignIn, function(req, res){
  accesoMongo.obtenerInfo(null, false, true, function(data){
    //Obtener rol
    var rol = req.session.user.Rol;
    res.render('admin', {info: data, rol: rol});
  });
});

app.get('/login', function(req, res){
    res.render('login');
});

//Cualquier url que no existente, redirigir a Home
app.all('/*', function (req, res) {
   console.log("Acceso a url inexistente");

   res.redirect('/');
})

 //FIN Definición URL**************************************************************************************



//INICIO Control Atenticación**************************************************************************************

function checkSignIn(req, res, next){
    if(req.session.user){
      console.log("checkSignIn: Usuario con sesión iniciada: " + req.session.user.Id);
      next();
    } else {
      console.log("checkSignIn: Usuario no logueado");
      res.redirect('/login');
    }
}

//FIN Control Atenticación**************************************************************************************



//INICIO Server**************************************************************************************

var server = app.listen(app.get('port'), function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Servidor iniciado en http://%s:%s", host, port)
})

//FIN Server**************************************************************************************



//INICIO Funciones iniciales**************************************************************************************

//Atributos
var nombreColeccionDatosMail = "Mail";
var datosMail = null;


//Obtener datos para el envío de correos
function obtenerDatosMail(){
  accesoMongo.obtenerPrimerDato(
    function () {
      console.log("Error al intentar obtener la colección Foto");
    },
    nombreColeccionDatosMail,
    function (result) {
      console.log(result);

      datosMail = result;
    }
  );
}

//Buscar datos al iniciar la App
obtenerDatosMail();

//FIN Server**************************************************************************************