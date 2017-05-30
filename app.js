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

var AccesoJimp = require('./AccesoJimp.js').Qux;
var accesoJimp = new AccesoJimp();

var async = require("async");

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

  var datos = req.body.content;


  if (datos){

    accesoJimp.obtenerCategorias(
      function () {
        console.log("Error al intentar calcular las dimensiones de la imagen");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      datos,
      function (result) {
        //'result' es un array con las dimensiones de las fotos calculadas en orden de mayor a menor dimensión

        console.log("Creando registro para almacenar las fotos en la BD");

        var registro = {
          BinarioXL: result[0],
          BinarioL: result[1],
          BinarioM: result[2],
          BinarioS: result[3]
        };

        console.log("Se procede al guardado de fotos");

        //Almacenar la colección de fotos
        accesoMongo.guardarFoto(
          function () {
            console.log("Error al intentar actualizar la colección Foto");

            //Enviar un flag de Error
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ Resultado: 'ERROR'}));
          },
          registro,
          function (result) {
            //Enviar un flag de éxito
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ Resultado: 'OK', Info: result}));
          }
        );
      }
    );

  }else{
    //Sin datos de entrada
    console.log("Sin datos");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR', Info: "Error de servidor, no se recibieron datos"}));
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

    //Enviar mail y almacenar en BD en paralelo
    async.parallel([
        function(callback) {

            //Proceso de envío de mail
            accesoMail.enviarMail(
              function () {
                console.log("Error al intentar enviar mail");
                console.log(datos);

                //Indicar error
                callback("Error al intentar enviar mail", null);
              },
              datos,
              function (result) {
                console.log(result);

                //Indicar Éxito
                callback(null, result);
              }
            );
        },
        function(callback) {

          //Proceso de actualización en BD
          accesoMongo.guardarSolicitud(
              function () {
                console.log("Error al intentar almacenar en BD");
                console.log(datos);

                //Indicar error
                callback("Error al intentar almacenar en BD", null);
              },
              datos,
              function (result) {
                console.log(result);

                //Indicar Éxito
                callback(null, result);
              }
            );
        }
    ],
    // Parallel callback
    function(err, results) {
      //Verificar resultado
      if (err) {
        console.log("Error en las funciones en paralelo para enviar mail de solicitud de presupuesto");
        console.log(err)

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      }
      else{
        //Éxito
        console.log("Funciones en paralelo para enviar mail de solicitud de presupuesto realizado con éxito");

        //Enviar un flag de éxito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'OK'}));
      }
    });

  }else{
    //Sin datos de entrada
    console.log("Sin datos");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR'}));
  }
});

app.post('/ObtenerFotos', function(req, res){
  console.log("Acceso a función Ajax ObtenerFotos");

  //Obtener parámetros de entrada
  var datos = req.body.content;
  var anchoCarrousel = null;

  console.log(req.body.content);

  //Verificar si se solicita un ancho específico de imagen para carrousel
  if(datos){
    anchoCarrousel = datos;
    
    console.log("SIII!, ancho solicitado");
  }

  accesoMongo.obtenerFotos(
    function () {
      console.log("Error al intentar obtener la colección Foto");

      //Enviar un flag de Error
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'ERROR'}));
    },
    anchoCarrousel,
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


//Solicitud de registros de usuarios que se contactaron por el formulario de Home
app.get('/ObtenerSolicitudes', function(req, res){
  console.log("Acceso a función Ajax ObtenerSolicitudes");

  accesoMongo.obtenerSolicitudes(
    function () {
      console.log("Error al intentar obtener la colección Solicitudes");

      //Enviar un flag de Error
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'ERROR'}));
    },
    null,
    function (result) {
      console.log(result);

      //Analizar los registros vistos y los que no
      result = AnalizarRegistrosVistos(result, req.session.user.Id);

      //Enviar datos
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'OK', Datos: result}));

      //Actualizar los registros ya vistos
      setTimeout(function(){ 
        MarcarComoVistos(result, req.session.user.Id);
      }, 1000);

    }
  );

});

//FIN Funciones AJAX**************************************************************************************



//INICIO Definición URL**************************************************************************************

//Renderizar usando Pug
app.get('/', function(req, res){
  var sesionCerrada = false;
  var cargarDatosBD = true;

  //Verificar parámetros
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
        console.log("Error al obtener datos");
        console.log(error);

        var estructuraDatos = {
          Info: [],
          CantFotos: 0,
          Admin: esAdmin(req,sesionCerrada)
        }

        res.render('view', {Recursos: estructuraDatos});
      },
      function(data){
        //Renderizar con los datos obtenidos
        data.Admin = esAdmin(req, sesionCerrada);

        res.render('view', {Recursos: data});
      }
    );
  }else{
    //Opción de carga ligera, no traer datos de la BD
    var estructuraDatos = {
      Info: [],
      CantFotos: 0,
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

//ObtenerSolicitudes: Revisa cuales registros son vistos por primera vez por el usuario actual
//Y asigna ese valor al atributo Nuevo para que en el cliente se muestre si es nuevo o no
function AnalizarRegistrosVistos(registros, usuario){
  //Recorrer registros
  for (var i=0; i<registros.length; i++){
    //Verificar si el usuario ya vió esta solicitud
    registros[i].Nuevo = !registros[i].VistoUsuarios.includes(usuario);

    //Borrar propiedad, ya que puede informar nombres de otros usuarios del sistema
    delete registros[i].VistoUsuarios;
  }

  return registros;
}

//Marcar los registros que tienen la marca de Nuevos como ya vistos por el usuario indicado
function MarcarComoVistos(registros, usuario){
  var idsNuevos = new Array();

  //Obtener los ids de los registros nuevos
  for (var i=0; i < registros.length; i++){
    if (registros[i].Nuevo)
      idsNuevos.push(registros[i]._id);
  }

  //Actualizar la BD
  accesoMongo.ActualizarSolicitudesVistas(
    function () {
      console.log("Error al intentar actualizar las solicitudes vistas en la BD");
    },
    usuario,
    idsNuevos,
    function () {
      console.log("Éxito en actualizar las solicitudes vistas en la BD");
    }
  );

}

//FIN Funciones iniciales**************************************************************************************