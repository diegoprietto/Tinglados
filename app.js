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

  //Contar la solicitud
  setTimeout(function(){ 
    ContadorVisitas("GT", req);
  }, 1000);

	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ t1: '11-', t2: '6468-6615' }));
});

app.post('/GuardarInfo', function(req, res){

  var datos = req.body.content;

  if (datos){

    accesoMongo.guardarInfo(
      function () {
        console.log("GuardarInfo: Error al intentar actualizar la colección Info");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      datos,
      function (result) {

        //Enviar un flag de éxito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'OK'}));
      }
    );

  }else{
    //Sin datos de entrada
    console.log("GuardarInfo: Sin datos en el requerimiento");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR'}));
  }
});

app.post('/GuardarFoto', function(req, res){

  var datos = req.body.content;


  if (datos){

    accesoJimp.obtenerCategorias(
      function () {
        console.log("GuardarFoto: Error al intentar calcular las dimensiones de la imagen");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      datos,
      function (result) {
        //'result' es un array con las dimensiones de las fotos calculadas en orden de mayor a menor dimensión

        var registro = {
          BinarioXL: result[0],
          BinarioL: result[1],
          BinarioM: result[2],
          BinarioS: result[3]
        };

        //Almacenar la colección de fotos
        accesoMongo.guardarFoto(
          function () {
            console.log("GuardarFoto: Error al intentar actualizar la colección Foto");

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
    console.log("GuardarFoto: Sin datos en el requerimiento.");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR', Info: "Error de servidor, no se recibieron datos"}));
  }
});

app.post('/BorrarFoto', function(req, res){

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

        //Enviar un flag de éxito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'OK'}));
      }
    );

  }else{
    //Sin datos de entrada
    console.log("BorrarFoto: Sin datos en el requerimiento.");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR'}));
  }
});

app.post('/Contacto', function(req, res){

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
                console.log("Contacto: Error al intentar enviar mail");

                //Indicar error
                callback("Error al intentar enviar mail", null);
              },
              datos,
              function (result) {

                //Indicar Éxito
                callback(null, result);
              }
            );
        },
        function(callback) {

          //Proceso de actualización en BD
          accesoMongo.guardarSolicitud(
              function () {
                console.log("guardarSolicitud: Error al intentar almacenar en BD");

                //Indicar error
                callback("Error al intentar almacenar en BD", null);
              },
              datos,
              function (result) {

                //Contar la solicitud
                setTimeout(function(){ 
                  ContadorVisitas("M", req, datos.nombre);
                }, 1000);

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
        console.log(err);

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      }
      else{
        //Enviar un flag de éxito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'OK'}));
      }
    });

  }else{
    //Sin datos de entrada
    console.log("Contacto: Sin datos en el requerimiento.");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR'}));
  }
});

app.post('/ObtenerFotos', function(req, res){

  //Obtener parámetros de entrada
  var datos = req.body.content;
  var anchoCarrousel = null;

  //Verificar si se solicita un ancho específico de imagen para carrousel
  if(datos){
    anchoCarrousel = datos;
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

      //Enviar datos
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'OK', Datos: result}));
    }
  );

});

app.post('/login', function(req, res){

    var datos = req.body.content;

    if(!datos || !datos.id || !datos.pass){
        console.log("Login: No se recibieron las credenciales");
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

          var encontrado = false;
          for(var i=0; i<result.length; i++){
            if (result[i].Id.toLowerCase() === datos.id.toLowerCase() && result[i].Pass === datos.pass){
              req.session.user = result[i];
              encontrado = true;

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

  accesoMongo.obtenerSolicitudes(
    function () {
      console.log("Error al intentar obtener la colección Solicitudes");

      //Enviar un flag de Error
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'ERROR'}));
    },
    function (result) {

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


//Solicitud de datos para la vista usuario
app.get('/ObtenerDatosVistaUsuario', function(req, res){

  //Armar respuesta
  var estructuraDatos = {
    mail: req.session.user.Mail,
    mailDestino: datosMail.MailDestino
  }

  //Enviar datos
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ Resultado: 'OK', Datos: estructuraDatos}));
});


//Actualizar datos de usuario y mail de destino de solicitudes
app.post('/GuardarUsuario', function(req, res){

  var datos = req.body.content;

  if (datos){

    //En caso de requerir password verificar que esté correcto
    if (datos.oldPass || datos.pass){
      if (datos.oldPass !== req.session.user.Pass){
        //Password incorrecto, informar y salir
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERRORPASS', Info: "El password actual es incorrecto."}));

        return;
      }
    }

    //Almacenar la colección de fotos
    accesoMongo.ActualizarDatosUsuario(
      function () {
        console.log("Error al intentar actualizar las colecciones.");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      req.session.user.Id,
      datos,
      function (result) {
        //Actualizar datos localmente
        if (datos.pass) req.session.user.Pass = datos.pass;
        if (datos.mail) req.session.user.Mail = datos.mail;
        if (datos.mailDestino){
          //Actualizar localmente
          datosMail.MailDestino = datos.mailDestino;
          accesoMail.actualizarMailDestino(datos.mailDestino);
        }

        //Enviar un flag de éxito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'OK'}));
      }
    );

  }else{
    //Sin datos de entrada
    console.log("Sin datos en el requerimiento.");

    //Enviar un flag de Error
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ Resultado: 'ERROR', Info: "Error de servidor, no se recibieron datos"}));
  }
});

//FIN Funciones AJAX**************************************************************************************



//INICIO Definición URL**************************************************************************************

//Renderizar usando Pug
app.get('/', function(req, res){
  var sesionCerrada = false;
  var cargarDatosBD = true;

  //Contar visita
  setTimeout(function(){ 
    ContadorVisitas("H", req);
  }, 1000);

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

    res.render('admin', {info: data, user: req.session.user});
  });
});

app.get('/login', function(req, res){
    res.render('login');
});

//Cualquier url que no existente, redirigir a Home
app.all('/*', function (req, res) {

  //Contar la solicitud
  setTimeout(function(){ 
    ContadorVisitas("P", req, req.originalUrl);
  }, 1000);

   console.log("Acceso a url inexistente: " + req.originalUrl);

   res.redirect('/');
})

 //FIN Definición URL**************************************************************************************



//INICIO Control Atenticación**************************************************************************************

function checkSignIn(req, res, next){
    if(req.session.user){

      next();
    } else {

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

      datosMail = result;
      //Actualizar el mail de destino de las solicitudes de presupuesto
      if (result && result.MailDestino){
        accesoMail.actualizarMailDestino(result.MailDestino);
      }
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
      //Éxito
    }
  );
}

//Almacena un registro de la visita realizada, útil como contador de visitas y estadisticas del sitio
function ContadorVisitas(accion, req, descripcionOpcional){

  var estructuraDatos = {
    Fecha: new Date(),
    Accion: accion,
    Descripcion: descripcionOpcional ? descripcionOpcional : "",
    Usuario: (req && req.session.user && req.session.user.Id) ? req.session.user.Id : ""
  };

  //Actualizar la BD
  accesoMongo.InsertarVisita(
    function () {
      console.log("Error al intentar insertar un contador de visitas.");
    },
    estructuraDatos,
    function () {
      //Éxito
    }
  );
}

//Contar Inicio del server
setTimeout(function(){ 
  ContadorVisitas("I");
}, 1000);

//FIN Funciones iniciales**************************************************************************************