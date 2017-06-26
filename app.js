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

var ModuloEncriptar = require('./ModuloEncriptar.js').Qux;
var moduloEncriptar = new ModuloEncriptar();

var ModuloHash = require('./ModuloHash.js').Qux;
var moduloHash = new ModuloHash();

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


//Mensajes standar para el usuario
var msjErrorServidor = 'Error en el servidor, recargue la página y vuelva a reintentar, si el problema continua contacte al desarrollador para buscar solución al problema.'

//Obtener URI de Mong de variable de entorno por seguridad
var uriBD = (process.env.UriBD || "ERROR");
accesoMongo.asignarUri(uriBD);

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

app.post('/GuardarInfo', checkAdminRoleAjax, function(req, res){

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

app.post('/GuardarFoto', checkAdminRoleAjax, function(req, res){

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

app.post('/BorrarFoto', checkAdminRoleAjax, function(req, res){

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

          //Encriptar datos sensibles
          var clonDatos = clonarObjetoJs(datos);

          if (clonDatos.nombre) clonDatos.nombre = moduloEncriptar.encrypt(clonDatos.nombre);
          if (clonDatos.apellido) clonDatos.apellido = moduloEncriptar.encrypt(clonDatos.apellido);
          if (clonDatos.mail) clonDatos.mail = moduloEncriptar.encrypt(clonDatos.mail);
          if (clonDatos.telNro) clonDatos.telNro = moduloEncriptar.encrypt(clonDatos.telNro);

          //Proceso de actualización en BD
          accesoMongo.guardarSolicitud(
              function () {
                console.log("guardarSolicitud: Error al intentar almacenar en BD");

                //Indicar error
                callback("Error al intentar almacenar en BD", null);
              },
              clonDatos,
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
        },moduloEncriptar.decrypt,
        function (result) {

          var encontrado = false;
          for(var i=0; i<result.length; i++){

            if (result[i].Id.toLowerCase() === datos.id.toLowerCase()){

              //Verificar hash
              encontrado = true;
              moduloHash.comparePassword(datos.pass, result[i].Pass, function(err, isPasswordMatch){
                if (err){
                  console.log("Se produjo un error al intentar validar el password con el valor hash.");
                  console.log(err);

                  //Enviar un flag de Error
                  res.setHeader('Content-Type', 'application/json');
                  res.send(JSON.stringify({ Resultado: 'ERROR'}));

                }else if (isPasswordMatch){
                  //Password correcto
                  req.session.user = result[i];

                  //Enviar un flag de Ok
                  res.setHeader('Content-Type', 'application/json');
                  res.send(JSON.stringify({ Resultado: 'OK'}));

                }else{
                  //Enviar un flag de error de autenticación
                  res.setHeader('Content-Type', 'application/json');
                  res.send(JSON.stringify({ Resultado: 'NOTFIND'}));
                }

              });

              break;
            }
          }

          if (!encontrado){
            //Enviar un flag de error de autenticación
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ Resultado: 'NOTFIND'}));
          }

        }
      );
    }
});

app.post('/loginRestablecer', function(req, res){

    var datos = req.body.content;

    if(!datos || !datos.id){
        console.log("Login: No se recibieron datos para restablecer");
        //Enviar un flag de error de autenticación
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ RESULTADO: 'INCOMPLETE', MENSAJE: 'Introduzca el usuario.'}));
    }
    else{

      accesoMongo.obtenerUsuarios(
        function () {
          console.log("Error al intentar obtener la colección Users");

          //Enviar un flag de Error
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({ RESULTADO: 'ERROR', MENSAJE: msjErrorServidor}));

        },moduloEncriptar.decrypt,
        function (result) {

          var indice = -1;
          for(var i=0; i<result.length; i++){

            if (result[i].Id.toLowerCase() === datos.id.toLowerCase()){
              //Encontrado
              indice=i;
              break;
            }
          }

          if (indice >= 0){
            //Encontrado, actualizar pass
            var nuevaPass = generarClave();
            var nuevaPassHash = moduloHash.cryptPasswordSync(nuevaPass);

            accesoMongo.actualizarRegistro(
              function (err){
                console.log("loginRestablecer: Error al intentar actualizar un registro de Users");
                console.log(err);

                //Enviar un flag de Error
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ RESULTADO: 'ERROR', MENSAJE: msjErrorServidor}));
              },
              nombreColeccionUsers,
              { Id: moduloEncriptar.encrypt(result[indice].Id) },
              { Pass: nuevaPassHash },
              function(resultAct){

                //Proceso de envío de mail con la nueva clave generada
                accesoMail.enviarMailRestablecer(
                  function () {
                    console.log("Contacto: Error al intentar enviar mail");

                    //Enviar un flag de Error
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ RESULTADO: 'ERROR', MENSAJE: msjErrorServidor}));
                  },
                  datosMail,
                  nuevaPass,
                  result[indice].Mail,
                  function (resultMailer) {

                    //Borrar caché de usuarios
                    accesoMongo.borrarCacheUsers();

                    //Enviar un flag de Ok
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ RESULTADO: 'OK'}));
                  }
                );

              }
            );



          }else{
            //Enviar un flag de error de autenticación
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ RESULTADO: 'NOTFIND', MENSAJE: 'Usuario no encontrado.'}));
          }

        }
      );
    }
});

//Solicitud de registros de usuarios que se contactaron por el formulario de Home
app.get('/ObtenerSolicitudes', checkAdminRoleAjax, function(req, res){

  accesoMongo.obtenerSolicitudes(
    function () {
      console.log("Error al intentar obtener la colección Solicitudes");

      //Enviar un flag de Error
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'ERROR'}));
    },moduloEncriptar.decrypt,
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
app.get('/ObtenerDatosVistaUsuario', checkAdminRoleAjax, function(req, res){

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
app.post('/GuardarUsuario', checkAdminRoleAjax, function(req, res){

  var datos = req.body.content;

  if (datos){

    //En caso de requerir password verificar que esté correcto
    if (datos.oldPass || datos.pass){
      if (!moduloHash.comparePasswordSync(datos.oldPass, req.session.user.Pass)){
        //Password incorrecto, informar y salir
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERRORPASS', Info: "El password actual es incorrecto."}));

        return;
      }
    }

    //Encriptar datos sensibles
    var clonDatos = clonarObjetoJs(datos);

    if (clonDatos.mail) clonDatos.mail = moduloEncriptar.encrypt(clonDatos.mail);
    if (clonDatos.mailDestino) clonDatos.mailDestino = moduloEncriptar.encrypt(clonDatos.mailDestino);

    //Aplicar hash (No reversible) a contraseñas
    if (clonDatos.pass) clonDatos.pass = moduloHash.cryptPasswordSync(clonDatos.pass);

    //Almacenar en la BD
    accesoMongo.ActualizarDatosUsuario(
      function () {
        console.log("Error al intentar actualizar las colecciones.");

        //Enviar un flag de Error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'ERROR'}));
      },
      moduloEncriptar.encrypt(req.session.user.Id),
      clonDatos,
      function (result) {
        //Actualizar datos localmente
        if (clonDatos.pass) req.session.user.Pass = clonDatos.pass;
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


app.post('/GenerarDatos', checkDevRoleAjax, function(req, res){

    var dato = req.body.content;

    if(!dato){
        console.log("GenerarDatos: No se recibieron datos");
        //Enviar un flag de error
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ Resultado: 'NODATA'}));
    }
    else{

      accesoMongo.generarDatosExportacion(
        function () {
          console.log("Error al generar datos de exportación");

          //Enviar un flag de Error
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({ Resultado: 'ERROR'}));
        },
        dato,
        function (result) {

          //Entregar como archivo de texto
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(result));
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

function checkAdminRoleAjax(req, res, next){
    if(req.session.user && req.session.user.Rol && (req.session.user.Rol==="A" || req.session.user.Rol==="X")){

      next();
    } else {

      //Usuario no autorizado
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'ERRORAUTH', Info: "El usuario no esta autorizado."}));
    }
}

function checkDevRoleAjax(req, res, next){
    if(req.session.user && req.session.user.Rol && req.session.user.Rol==="X"){

      next();
    } else {

      //Usuario no autorizado
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ Resultado: 'ERRORAUTH', Info: "El usuario no esta autorizado."}));
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
var nombreColeccionUsers = "Users";
var datosMail = null;

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

//Obtener datos para el envío de correos
function obtenerDatosMail(){
  accesoMongo.obtenerPrimerDato(
    function () {
      console.log("Error al intentar obtener la colección Foto");
    },
    nombreColeccionDatosMail,
    moduloEncriptar.decrypt,
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
    Usuario: (req && req.session && req.session.user && req.session.user.Id) ? req.session.user.Id : ""
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

//clonar objetos con jQuery
function clonarObjetoJs (obj) {
    return JSON.parse(JSON.stringify(obj));
}

//Genera password al azar para restablecer contraseña
function generarClave(){
  var lsTexto = ['Pepe', 'Pepito', 'Casa', 'Tormenta', 'Rayo', 'Primavera', 'Rio', 'Copa', 'Sabueso', 'Salchichon',
  'Cimiento', 'Abeja', 'Touch', 'Singapur', 'Drenaje', 'Carburador', 'Silicio', 'Cordoba', 'Saturno', 'Penal'];

  var indice = getRandomInt(0,20);
  var numerico = getRandomInt(1000,9999);

  return lsTexto[indice] + numerico;
}

//Genera un número entero al azar según los límites indicados
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//Contar Inicio del server
setTimeout(function(){ 
  ContadorVisitas("I");
}, 1000);

//FIN Funciones iniciales**************************************************************************************